// ============================================
// ANIMATIONS AMBIANTES ALÉATOIRES — esprit "site vivant" 2050
// Tout est positionné pour ne JAMAIS chevaucher le texte lisible.
// ============================================

(function ambientModule() {
  const layer = document.createElement('div');
  layer.id = 'ambient-layer';
  layer.style.position = 'fixed';
  layer.style.inset = '0';
  layer.style.pointerEvents = 'none';
  layer.style.zIndex = '5';
  layer.style.overflow = 'hidden';
  document.body.appendChild(layer);

  const MARGIN_SAFE = 90; // marge en px depuis les bords gauche/droite, zone "sûre" pour ne pas gêner la lecture centrale

  function randomEdgeX() {
    // Position aléatoire dans les marges latérales uniquement (pas au centre où est le contenu)
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const offset = Math.random() * MARGIN_SAFE;
    return side === 'left' ? offset : window.innerWidth - offset - 20;
  }

  // ---- Gouttes qui tombent dans les marges ----
  function spawnDrop() {
    const drop = document.createElement('div');
    const x = randomEdgeX();
    drop.style.position = 'absolute';
    drop.style.left = x + 'px';
    drop.style.top = '-20px';
    drop.style.width = '3px';
    drop.style.height = '14px';
    drop.style.borderRadius = '50%';
    drop.style.background = 'linear-gradient(180deg, transparent, var(--accent))';
    drop.style.opacity = '0.5';
    drop.style.transition = `top ${4 + Math.random() * 3}s linear, opacity 1s ease`;
    layer.appendChild(drop);

    requestAnimationFrame(() => {
      drop.style.top = (window.innerHeight + 30) + 'px';
    });
    setTimeout(() => { drop.style.opacity = '0'; }, 5000);
    setTimeout(() => drop.remove(), 7500);
  }

  // ---- Petites pierres en cercle qui apparaissent et disparaissent ----
  function spawnCircleParticles() {
    const cx = randomEdgeX();
    const cy = Math.random() * window.innerHeight;
    const count = 6;
    const radius = 22;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dot = document.createElement('div');
      dot.style.position = 'absolute';
      dot.style.left = (cx + Math.cos(angle) * radius) + 'px';
      dot.style.top = (cy + Math.sin(angle) * radius) + 'px';
      dot.style.width = '5px';
      dot.style.height = '5px';
      dot.style.borderRadius = '50%';
      dot.style.background = 'var(--accent-2)';
      dot.style.opacity = '0';
      dot.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
      dot.style.transform = 'scale(0.3)';
      layer.appendChild(dot);

      requestAnimationFrame(() => {
        setTimeout(() => { dot.style.opacity = '0.6'; dot.style.transform = 'scale(1)'; }, i * 80);
      });
      setTimeout(() => { dot.style.opacity = '0'; dot.style.transform = 'scale(0.3)'; }, 2200 + i * 80);
      setTimeout(() => dot.remove(), 3600 + i * 80);
    }
  }

  // ---- Phrases contextuelles selon la section visible ----
  const phrasesBySection = {
    about: ['toujours rigoureux', 'passionné par le code', 'curieux par nature'],
    stack: ['en apprentissage continu', 'polyvalent par choix'],
    parcours: ['progression constante', 'un pas après l\'autre'],
    services: ['à votre écoute', 'qualité avant tout'],
    projets: ['17 preuves concrètes', 'du code, pas des promesses'],
    contact: ['réponse rapide garantie', 'discutons ensemble'],
  };

  let lastPhraseTime = 0;
  function maybeSpawnPhrase(sectionId) {
    const now = Date.now();
    if (now - lastPhraseTime < 6000) return; // pas plus d'une phrase toutes les 6s
    const phrases = phrasesBySection[sectionId];
    if (!phrases || Math.random() > 0.35) return; // probabilité, pas systématique
    lastPhraseTime = now;

    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const bubble = document.createElement('div');
    bubble.textContent = phrase;
    bubble.style.position = 'absolute';
    bubble.style.left = randomEdgeX() + 'px';
    bubble.style.top = (Math.random() * (window.innerHeight - 100) + 60) + 'px';
    bubble.style.padding = '8px 14px';
    bubble.style.borderRadius = '999px';
    bubble.style.background = 'var(--bg-glass-strong)';
    bubble.style.border = '1px solid var(--border-glass)';
    bubble.style.backdropFilter = 'blur(10px)';
    bubble.style.fontSize = '0.72rem';
    bubble.style.fontFamily = 'var(--font-mono)';
    bubble.style.color = 'var(--accent)';
    bubble.style.opacity = '0';
    bubble.style.transform = 'translateY(10px)';
    bubble.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    bubble.style.whiteSpace = 'nowrap';
    layer.appendChild(bubble);

    requestAnimationFrame(() => {
      bubble.style.opacity = '0.85';
      bubble.style.transform = 'translateY(0)';
    });
    setTimeout(() => { bubble.style.opacity = '0'; bubble.style.transform = 'translateY(-10px)'; }, 2800);
    setTimeout(() => bubble.remove(), 3500);
  }

  // ---- Observer les sections visibles pour déclencher les phrases ----
  Object.keys(phrasesBySection).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) maybeSpawnPhrase(id); });
    }, { threshold: 0.4 });
    obs.observe(el);
  });

  // Re-déclenche aussi pendant le scroll continu dans une section (pas juste à l'entrée)
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      Object.keys(phrasesBySection).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.7 && rect.bottom > window.innerHeight * 0.3) {
          maybeSpawnPhrase(id);
        }
      });
    }, 400);
  });

  // ---- Boucles d'animation ambiante en permanence ----
  setInterval(spawnDrop, 2200);
  setInterval(spawnCircleParticles, 4500);

  // Lancement initial léger pour ne pas surcharger au chargement
  setTimeout(spawnDrop, 1500);
  setTimeout(spawnCircleParticles, 3000);
})();
