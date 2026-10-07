const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../data/db');

router.get('/', (req, res) => {
  res.render('projets/sondage', { title: "Questionnaire d'enquête" });
});

router.get('/repondre/:code', (req, res) => {
  db.get('SELECT * FROM sondages WHERE code = ?', [req.params.code], (err, sondage) => {
    if (!sondage) return res.status(404).render('404', { title: 'Sondage introuvable' });
    res.render('projets/sondage-repondre', { title: sondage.titre, sondage: { ...sondage, questions: JSON.parse(sondage.questions_json) } });
  });
});

router.get('/resultats/:code', (req, res) => {
  db.get('SELECT * FROM sondages WHERE code = ?', [req.params.code], (err, sondage) => {
    if (!sondage) return res.status(404).render('404', { title: 'Sondage introuvable' });
    res.render('projets/sondage-resultats', { title: sondage.titre, sondage: { ...sondage, questions: JSON.parse(sondage.questions_json) } });
  });
});

router.post('/creer', express.json(), (req, res) => {
  const { titre, questions } = req.body;
  if (!titre || !Array.isArray(questions) || !questions.length) {
    return res.status(400).json({ error: 'Titre et au moins une question requis.' });
  }
  const code = uuidv4().slice(0, 8);
  db.run('INSERT INTO sondages (titre, code, questions_json) VALUES (?, ?, ?)', [titre, code, JSON.stringify(questions)], function (err) {
    if (err) return res.status(500).json({ error: 'Erreur base de données.' });
    res.json({ success: true, code });
  });
});

router.post('/repondre/:code', express.json(), (req, res) => {
  const { reponses } = req.body;
  db.get('SELECT id FROM sondages WHERE code = ?', [req.params.code], (err, sondage) => {
    if (!sondage) return res.status(404).json({ error: 'Sondage introuvable.' });
    db.run('INSERT INTO sondages_reponses (sondage_id, reponses_json) VALUES (?, ?)', [sondage.id, JSON.stringify(reponses)], function (err2) {
      if (err2) return res.status(500).json({ error: 'Erreur lors de l\'enregistrement.' });
      const io = req.app.get('io');
      io.to(`sondage-${req.params.code}`).emit('nouvelle-reponse');
      res.json({ success: true });
    });
  });
});

router.get('/api/resultats/:code', (req, res) => {
  db.get('SELECT id, questions_json FROM sondages WHERE code = ?', [req.params.code], (err, sondage) => {
    if (!sondage) return res.status(404).json({ error: 'introuvable' });
    db.all('SELECT reponses_json FROM sondages_reponses WHERE sondage_id = ?', [sondage.id], (err2, rows) => {
      const questions = JSON.parse(sondage.questions_json);
      const toutesReponses = (rows || []).map(r => JSON.parse(r.reponses_json));

      const resultats = questions.map((q, qIdx) => {
        if (q.type === 'texte') {
          return { question: q.texte, type: 'texte', reponses: toutesReponses.map(r => r[qIdx]).filter(Boolean) };
        }
        const counts = {};
        (q.options || []).forEach(opt => counts[opt] = 0);
        toutesReponses.forEach(r => { if (counts[r[qIdx]] !== undefined) counts[r[qIdx]]++; });
        return { question: q.texte, type: q.type, counts };
      });

      res.json({ totalReponses: toutesReponses.length, resultats });
    });
  });
});

module.exports = router;
