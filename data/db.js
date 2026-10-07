// Module DB basé sur sql.js (SQLite compilé en WebAssembly).
// Choix volontaire : zéro compilation native requise, donc zéro risque d'échec
// d'installation sur un hébergement mutualisé comme alwaysdata.
// Compromise : la base vit en mémoire et est explicitement sauvegardée sur disque
// après chaque écriture (fonction persist()).

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'portfolio.sqlite');

let SQL = null;
let dbInstance = null;

async function init() {
  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  dbInstance.run(`CREATE TABLE IF NOT EXISTS boutique_produits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_catalogue TEXT NOT NULL DEFAULT 'boutique',
    nom TEXT NOT NULL,
    description TEXT,
    prix REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    image TEXT,
    whatsapp_numero TEXT,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migration douce : si la colonne n'existait pas encore sur une base déjà créée
  try { dbInstance.run(`ALTER TABLE boutique_produits ADD COLUMN type_catalogue TEXT NOT NULL DEFAULT 'boutique'`); } catch (e) { /* colonne déjà présente, on ignore */ }

  dbInstance.run(`CREATE TABLE IF NOT EXISTS annonces (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    description TEXT,
    image TEXT,
    lien TEXT,
    couleur_accent TEXT DEFAULT '#00f0c0',
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  dbInstance.run(`CREATE TABLE IF NOT EXISTS jeux_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jeu TEXT NOT NULL,
    pseudo TEXT NOT NULL,
    score INTEGER NOT NULL,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  dbInstance.run(`CREATE TABLE IF NOT EXISTS sondages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    questions_json TEXT NOT NULL,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  dbInstance.run(`CREATE TABLE IF NOT EXISTS sondages_reponses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sondage_id INTEGER NOT NULL,
    reponses_json TEXT NOT NULL,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sondage_id) REFERENCES sondages(id)
  )`);

  dbInstance.run(`CREATE TABLE IF NOT EXISTS votes_evenements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titre TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    categories_json TEXT NOT NULL,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  dbInstance.run(`CREATE TABLE IF NOT EXISTS votes_bulletins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evenement_id INTEGER NOT NULL,
    categorie TEXT NOT NULL,
    option_choisie TEXT NOT NULL,
    ip_hash TEXT NOT NULL,
    cree_le DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evenement_id) REFERENCES votes_evenements(id)
  )`);

  persist();
  console.log('[DB] sql.js initialisé et tables prêtes.');
}

function persist() {
  if (!dbInstance) return;
  const data = dbInstance.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// ---- Wrapper compatible avec le style "sqlite3" utilisé dans les routes ----
// run(sql, params, callback) -> exécute une écriture (INSERT/UPDATE/DELETE), callback(err) avec this.lastID
function sanitizeParams(params) {
  return (params || []).map(p => (p === undefined ? null : p));
}

function run(sql, params, callback) {
  if (typeof params === 'function') { callback = params; params = []; }
  try {
    const stmt = dbInstance.prepare(sql);
    stmt.bind(sanitizeParams(params));
    stmt.step();
    stmt.free();

    let lastID = null;
    const idResult = dbInstance.exec('SELECT last_insert_rowid() AS id');
    if (idResult.length && idResult[0].values.length) {
      lastID = idResult[0].values[0][0];
    }

    persist();
    if (callback) callback.call({ lastID }, null);
  } catch (err) {
    if (callback) callback(err);
  }
}

// get(sql, params, callback) -> callback(err, row) une seule ligne
function get(sql, params, callback) {
  if (typeof params === 'function') { callback = params; params = []; }
  try {
    const stmt = dbInstance.prepare(sql);
    stmt.bind(sanitizeParams(params));
    let row = null;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    callback(null, row);
  } catch (err) {
    callback(err);
  }
}

// all(sql, params, callback) -> callback(err, rows) toutes les lignes
function all(sql, params, callback) {
  if (typeof params === 'function') { callback = params; params = []; }
  try {
    const stmt = dbInstance.prepare(sql);
    stmt.bind(sanitizeParams(params));
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    callback(null, rows);
  } catch (err) {
    callback(err);
  }
}

module.exports = {
  init,
  db: { run, get, all }
};
