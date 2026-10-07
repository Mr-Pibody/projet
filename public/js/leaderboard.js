// ============================================
// LEADERBOARD PARTAGÉ - utilisé par les 5 jeux
// ============================================

async function submitScore(jeu, pseudo, score) {
  try {
    await fetch('/projets/jeux/score', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jeu, pseudo, score })
    });
  } catch (e) { console.warn('Score non sauvegardé', e); }
}

async function loadLeaderboard(jeu, containerId) {
  try {
    const res = await fetch(`/projets/jeux/leaderboard/${jeu}`);
    const data = await res.json();
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = data.scores.length
      ? data.scores.map((s, i) => `<tr><td>#${i+1}</td><td>${s.pseudo}</td><td><strong>${s.score}</strong></td></tr>`).join('')
      : '<tr><td colspan="3" style="color:var(--text-muted);">Aucun score encore. Soyez le premier !</td></tr>';
  } catch (e) { console.warn('Leaderboard indisponible', e); }
}

function askPseudoAndSubmit(jeu, score) {
  const pseudo = localStorage.getItem('arcadePseudo') || 'Anonyme';
  submitScore(jeu, pseudo, score);
}

// ---- Demande du pseudo AVANT le début de la partie (overlay propre, pas de prompt() natif) ----
function ensurePseudoThenStart(onReady) {
  const existing = localStorage.getItem('arcadePseudo');
  if (existing) { onReady(existing); return; }

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.7)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '2000';
  overlay.innerHTML = `
    <div class="projet-panel glass" style="max-width:360px; text-align:center; padding:32px;">
      <h3 style="margin-bottom:16px;">Choisis ton pseudo</h3>
      <input type="text" id="pseudoOverlayInput" placeholder="Ton pseudo" maxlength="20" style="width:100%; padding:12px; border-radius:10px; border:1px solid var(--border-glass); background:var(--bg-secondary); color:var(--text-primary); margin-bottom:14px; text-align:center;">
      <button class="btn btn-primary btn-block" id="pseudoOverlayBtn">Jouer</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = overlay.querySelector('#pseudoOverlayInput');
  const btn = overlay.querySelector('#pseudoOverlayBtn');
  input.focus();

  function confirmPseudo() {
    const pseudo = input.value.trim() || 'Anonyme';
    localStorage.setItem('arcadePseudo', pseudo);
    overlay.remove();
    onReady(pseudo);
  }

  btn.addEventListener('click', confirmPseudo);
  input.addEventListener('keypress', (e) => { if (e.key === 'Enter') confirmPseudo(); });
}
