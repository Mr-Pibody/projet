const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { resizeAndSave } = require('../data/image-utils');
const { db } = require('../data/db');

const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'boutique');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 } // 8Mo avant compression
});

// Configuration des 3 catalogues qui réutilisent ce même moteur
const CATALOGUES = {
  boutique: { titre: 'Catalogue Boutique', passwordEnv: 'ADMIN_PASSWORD_BOUTIQUE', sessionKey: 'isAdminBoutique', itemLabel: 'produit' },
  ecommerce: { titre: 'Boutique E-commerce', passwordEnv: 'ADMIN_PASSWORD_ECOMMERCE', sessionKey: 'isAdminEcommerce', itemLabel: 'produit' },
  restaurant: { titre: 'Menu Restaurant', passwordEnv: 'ADMIN_PASSWORD_RESTAURANT', sessionKey: 'isAdminRestaurant', itemLabel: 'plat' }
};

function getConfig(type) {
  return CATALOGUES[type] || CATALOGUES.boutique;
}

function requireAdmin(type) {
  return function (req, res, next) {
    const cfg = getConfig(type);
    if (req.session && req.session[cfg.sessionKey]) return next();
    return res.status(401).json({ error: 'Non autorisé.' });
  };
}

function registerCatalogueRoutes(type) {
  const cfg = getConfig(type);

  // ---- Page publique ----
  router.get(`/${type === 'boutique' ? '' : type}`, (req, res) => {
    db.all('SELECT * FROM boutique_produits WHERE type_catalogue = ? ORDER BY cree_le DESC', [type], (err, rows) => {
      res.render('projets/boutique', {
        title: cfg.titre,
        produits: rows || [],
        typeCatalogue: type,
        itemLabel: cfg.itemLabel,
        isAdmin: !!(req.session && req.session[cfg.sessionKey])
      });
    });
  });

  // ---- Ajouter un item (admin) ----
  router.post(`/${type}/admin/produits`, requireAdmin(type), upload.single('image'), async (req, res) => {
    try {
      const { nom, description, prix, stock, whatsapp_numero } = req.body;
      let imageName = null;

      if (req.file) {
        imageName = `${type}_${Date.now()}.jpg`;
        await resizeAndSave(req.file.buffer, path.join(UPLOAD_DIR, imageName), 700, 75);
      }

      db.run(
        `INSERT INTO boutique_produits (type_catalogue, nom, description, prix, stock, image, whatsapp_numero) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [type, nom || '', description || '', parseFloat(prix) || 0, parseInt(stock) || 0, imageName, whatsapp_numero || ''],
        function (err) {
          if (err) { console.error(`[${type.toUpperCase()}] Erreur SQL :`, err); return res.status(500).json({ error: 'Erreur base de données.' }); }
          res.json({ success: true, id: this.lastID });
        }
      );
    } catch (err) {
      console.error(`[${type.toUpperCase()}] Erreur traitement image :`, err);
      res.status(500).json({ error: "Erreur lors du traitement de l'image." });
    }
  });

  // ---- Supprimer un item (admin) ----
  router.post(`/${type}/admin/produits/:id/supprimer`, requireAdmin(type), (req, res) => {
    db.get('SELECT image FROM boutique_produits WHERE id = ? AND type_catalogue = ?', [req.params.id, type], (err, row) => {
      if (row && row.image) {
        const filePath = path.join(UPLOAD_DIR, row.image);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      db.run('DELETE FROM boutique_produits WHERE id = ? AND type_catalogue = ?', [req.params.id, type], () => {
        res.json({ success: true });
      });
    });
  });

  // ---- Déconnexion admin ----
  router.post(`/${type}/admin/logout`, (req, res) => {
    req.session[cfg.sessionKey] = false;
    res.json({ success: true });
  });
}

['boutique', 'ecommerce', 'restaurant'].forEach(registerCatalogueRoutes);

// ============================================
// ACCÈS ADMIN CENTRALISÉ — URL secrète unique avec les 3 connexions
// ============================================
router.get('/gestion-privee-pibody', (req, res) => {
  res.render('projets/gestion-privee', { title: 'Gestion privée' });
});

router.post('/gestion-privee-pibody/connexion', express.json(), (req, res) => {
  const { type, password } = req.body;
  const cfg = getConfig(type);
  if (!cfg) return res.status(400).json({ error: 'Catalogue inconnu.' });

  const expected = process.env[cfg.passwordEnv] || process.env.ADMIN_PASSWORD || 'admin123';
  if (password === expected) {
    req.session[cfg.sessionKey] = true;
    return res.json({ success: true, redirect: type === 'boutique' ? '/projets/boutique' : `/projets/boutique/${type}` });
  }
  res.status(401).json({ success: false, error: 'Mot de passe incorrect.' });
});

module.exports = router;
