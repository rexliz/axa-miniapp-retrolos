/* ==========================================================================
   RetroLos! – Effekte (selbst gebaut, ohne Bibliothek)
   Würfel, Konfetti, Segelboot. Alle respektieren prefers-reduced-motion.
   ========================================================================== */
(function (root) {
  'use strict';

  const motionOk = () => !(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- Würfel ---------- */

  // Augen-Positionen im 3×3-Raster (0 = oben links, 8 = unten rechts)
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

  function showFace(svg, n) {
    svg.querySelectorAll('.dice-pip').forEach((pip, i) => pip.classList.toggle('is-on', PIPS[n].includes(i)));
  }

  // Lässt den Würfel rollen; onTick wird bei jedem Augenwechsel aufgerufen.
  function rollDice(svg, options) {
    const opts = options || {};
    const duration = opts.duration || 900;
    const final = 1 + Math.floor(Math.random() * 6);
    return new Promise((resolve) => {
      if (!motionOk()) {
        showFace(svg, final);
        resolve(final);
        return;
      }
      svg.classList.remove('is-rolling');
      svg.getBoundingClientRect(); // Animation neu starten
      svg.classList.add('is-rolling');
      const start = performance.now();
      const tick = () => {
        const elapsed = performance.now() - start;
        if (elapsed >= duration) {
          showFace(svg, final);
          svg.classList.remove('is-rolling');
          resolve(final);
          return;
        }
        showFace(svg, 1 + Math.floor(Math.random() * 6));
        if (opts.onTick) opts.onTick();
        setTimeout(tick, 60 + elapsed / 8);
      };
      tick();
    });
  }

  root.RetroLos = root.RetroLos || {};
  root.RetroLos.effects = Object.assign(root.RetroLos.effects || {}, { motionOk, showFace, rollDice });
})(globalThis);
