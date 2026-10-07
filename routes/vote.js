const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../data/db');

function hashIp(ip) {
  const salt = process.env.SESSION_SECRET || 'sel-defaut';
  return crypto.createHash('sha256').update(ip + salt).digest('hex');
}

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
}

router.get('/', (req, res) => {
  res.render('projets/vote', { title: 'Plateforme de vote' });
});

// ---- Créer un événement ----
router.post('/creer', express.json(), (req, res) => {
  const { titre, categories } = req.body;
  if (!titre || !Array.isArray(categories) || !categories.length) {
    return res.status(400).json({ error: 'Titre et au moins une catégorie sont requis.' });
  }
  const code = uuidv4().slice(0, 8);
  db.run(
    'INSERT INTO votes_evenements (titre, code, categories_json) VALUES (?, ?, ?)',
    [titre, code, JSON.stringify(categories)],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erreur base de données.' });
      res.json({ success: true, code });
    }
  );
});

// ---- Récupérer un événement par code ----
router.get('/evenement/:code', (req, res) => {
  db.get('SELECT * FROM votes_evenements WHERE code = ?', [req.params.code], (err, ev) => {
    if (!ev) return res.status(404).json({ error: 'Événement introuvable.' });
    const ipHash = hashIp(getClientIp(req));
    db.all('SELECT categorie, option_choisie, ip_hash FROM votes_bulletins WHERE evenement_id = ?', [ev.id], (err2, bulletins) => {
      const categories = JSON.parse(ev.categories_json);
      const resultats = categories.map(cat => {
        const votesCount = {};
        cat.options.forEach(opt => votesCount[opt] = 0);
        (bulletins || []).filter(b => b.categorie === cat.nom).forEach(b => {
          if (votesCount[b.option_choisie] !== undefined) votesCount[b.option_choisie]++;
        });
        const dejaVote = (bulletins || []).some(b => b.categorie === cat.nom && b.ip_hash === ipHash);
        return { nom: cat.nom, options: cat.options, votes: votesCount, dejaVote };
      });
      res.json({ titre: ev.titre, code: ev.code, categories: resultats });
    });
  });
});

// ---- Voter ----
router.post('/evenement/:code/voter', express.json(), (req, res) => {
  const { categorie, option } = req.body;
  const ipHash = hashIp(getClientIp(req));

  db.get('SELECT * FROM votes_evenements WHERE code = ?', [req.params.code], (err, ev) => {
    if (!ev) return res.status(404).json({ error: 'Événement introuvable.' });

    db.get(
      'SELECT id FROM votes_bulletins WHERE evenement_id = ? AND categorie = ? AND ip_hash = ?',
      [ev.id, categorie, ipHash],
      (err2, existing) => {
        if (existing) return res.status(403).json({ error: 'Vous avez déjà voté dans cette catégorie.' });

        db.run(
          'INSERT INTO votes_bulletins (evenement_id, categorie, option_choisie, ip_hash) VALUES (?, ?, ?, ?)',
          [ev.id, categorie, option, ipHash],
          function (err3) {
            if (err3) return res.status(500).json({ error: 'Erreur lors du vote.' });
            res.json({ success: true });
          }
        );
      }
    );
  });
});

module.exports = router;
