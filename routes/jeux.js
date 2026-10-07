const express = require('express');
const router = express.Router();
const { db } = require('../data/db');

router.get('/', (req, res) => {
  res.render('projets/jeux', { title: 'Arcade' });
});

const jeuxList = ['neon-runner', 'reaction', 'memory', 'memory-xl', 'pattern', 'quickmath', 'snake'];
jeuxList.forEach(slug => {
  router.get(`/${slug}`, (req, res) => {
    res.render(`projets/jeux/${slug}`, { title: 'Arcade' });
  });
});

router.use('/quiz-ia', require('./quiz-ia'));

router.post('/score', express.json(), (req, res) => {
  const { jeu, pseudo, score } = req.body;
  if (!jeu || !pseudo || typeof score !== 'number') {
    return res.status(400).json({ error: 'Données invalides.' });
  }
  const pseudoClean = String(pseudo).slice(0, 20).replace(/[<>]/g, '');
  db.run('INSERT INTO jeux_scores (jeu, pseudo, score) VALUES (?, ?, ?)', [jeu, pseudoClean, Math.round(score)], function (err) {
    if (err) return res.status(500).json({ error: 'Erreur base de données.' });
    res.json({ success: true });
  });
});

router.get('/leaderboard/:jeu', (req, res) => {
  db.all('SELECT pseudo, score, cree_le FROM jeux_scores WHERE jeu = ? ORDER BY score DESC LIMIT 10', [req.params.jeu], (err, rows) => {
    res.json({ scores: rows || [] });
  });
});

module.exports = router;
