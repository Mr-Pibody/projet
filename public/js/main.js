// ============================================
// THEME TOGGLE (orbe + transition iris)
// ============================================
(function themeModule() {
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if (saved) root.setAttribute('data-theme', saved);

  function applyOrbState() {
    const isLight = root.getAttribute('data-theme') === 'light';
    document.querySelectorAll('.theme-orb').forEach(orb => {
      orb.setAttribute('aria-pressed', isLight);
    });
  }
  applyOrbState();

  document.addEventListener('click', (e) => {
    const orb = e.target.closest('.theme-orb');
    if (!orb) return;

    const rect = orb.getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

    let iris = document.querySelector('.theme-iris');
    if (!iris) {
      iris = document.createElement('div');
      iris.className = 'theme-iris';
      iris.innerHTML = '<img src="/images/emoji-face.jpg" class="theme-iris-face" alt="">';
      document.body.appendChild(iris);
    }
    iris.style.setProperty('--iris-x', x + '%');
    iris.style.setProperty('--iris-y', y + '%');
    iris.classList.add('active');

    setTimeout(() => {
      const current = root.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      if (next === 'light') root.setAttribute('data-theme', 'light');
      else root.removeAttribute('data-theme');
      localStorage.setItem('theme', next);
      applyOrbState();
    }, 280);

    setTimeout(() => { iris.classList.remove('active'); }, 650);
  });
})();

// ============================================
// NAVBAR MOBILE BURGER
// ============================================
(function navbarModule() {
  const burger = document.querySelector('.nav-burger');
  const navbar = document.querySelector('.navbar');
  if (!burger || !navbar) return;
  burger.addEventListener('click', () => navbar.classList.toggle('menu-open'));
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => navbar.classList.remove('menu-open'));
  });
})();

// ============================================
// SCROLL REVEAL (IntersectionObserver, léger, pas de lib externe)
// ============================================
(function revealModule() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => obs.observe(t));

  // Titres révélés mot par mot
  document.querySelectorAll('[data-reveal-words]').forEach(el => {
    const text = el.textContent;
    el.innerHTML = text.split(' ').map(w => `<span class="reveal-word">${w}</span>`).join(' ');
    const words = el.querySelectorAll('.reveal-word');
    const wObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          words.forEach((w, i) => setTimeout(() => w.classList.add('is-visible'), i * 60));
          wObs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    wObs.observe(el);
  });
})();

// ============================================
// COMPTEURS ANIMÉS (stats)
// ============================================
(function countersModule() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
})();

// ============================================
// FAQ ACCORDÉON
// ============================================
(function faqModule() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
})();

// ============================================
// FILTRE PROJETS (grille)
// ============================================
(function filterModule() {
  const chips = document.querySelectorAll('.filter-chip');
  const cards = document.querySelectorAll('.project-card');
  if (!chips.length) return;
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.dataset.cat;
      cards.forEach(card => {
        const show = cat === 'tous' || card.dataset.cat === cat;
        card.style.display = show ? '' : 'none';
      });
    });
  });
})();

// ============================================
// PARTICULES HERO (canvas léger, pas de lib)
// ============================================
(function particlesModule() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = window.innerWidth < 768 ? 30 : 60;
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    });
  }

  function getAccent() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00f0c0';
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const color = getAccent();
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.5;
      ctx.fill();
    });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ============================================
// FORMULAIRE DE CONTACT (AJAX vers /api/contact)
// ============================================
(function contactFormModule() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const statusBox = document.getElementById('contact-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Envoi en cours...';
    submitBtn.disabled = true;

    const payload = {
      nom: form.nom.value,
      email: form.email.value,
      message: form.message.value
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      statusBox.className = 'form-status show ' + (data.success ? 'success' : 'error');
      statusBox.innerHTML = data.success
        ? '<i class="fa-solid fa-circle-check"></i> Message envoyé ! Je reviens vers vous rapidement.'
        : '<i class="fa-solid fa-circle-exclamation"></i> ' + (data.error || 'Une erreur est survenue.');
      if (data.success) form.reset();
    } catch (err) {
      statusBox.className = 'form-status show error';
      statusBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Erreur réseau, réessaie plus tard.';
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
})();
