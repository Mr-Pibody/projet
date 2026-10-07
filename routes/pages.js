const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Accueil', isHome: true });
});

// ---- Projets simples (calcul client-side, pas de BDD) ----
const simpleProjects = [
  { slug: 'algo-executeur', view: 'projets/algo-executeur', title: "Exécuteur d'algorithmes" },
  { slug: 'carte', view: 'projets/carte', title: 'Carte interactive' },
  { slug: 'panorama-web', view: 'projets/panorama-web', title: 'Panorama mondial des sites web' },
  { slug: 'cv-generator', view: 'projets/cv-generator', title: 'Générateur de CV' },
  { slug: 'convertisseur', view: 'projets/convertisseur', title: 'Convertisseur de fichiers' },
  { slug: 'markdown', view: 'projets/markdown', title: 'Markdown vers PDF' },
  { slug: 'pomodoro', view: 'projets/pomodoro', title: 'Time Tracker / Pomodoro' },
  { slug: 'qrcode', view: 'projets/qrcode', title: 'QR Code carte de contact' },
  { slug: 'horloge', view: 'projets/horloge', title: 'Horloge / Alarme / Minuteur' },
  { slug: 'calculatrice', view: 'projets/calculatrice', title: 'Calculatrice scientifique' },
  { slug: 'facture', view: 'projets/facture', title: 'Facture / Devis' },
];

simpleProjects.forEach(p => {
  router.get(`/projets/${p.slug}`, (req, res) => {
    res.render(p.view, { title: p.title });
  });
});

module.exports = router;
