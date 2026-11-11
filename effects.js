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

  /* ---------- Konfetti (Canvas) ---------- */

  function confetti(options) {
    if (!motionOk()) return;
    const opts = options || {};
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      return;
    }
    const dpr = root.devicePixelRatio || 1;
    const w = root.innerWidth;
    const h = root.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const css = getComputedStyle(document.documentElement);
    const colors = ['--color-highlight', '--color-accent', '--color-note-4', '--color-success', '--color-sea', '--color-danger']
      .map((v) => css.getPropertyValue(v).trim())
      .filter(Boolean);
    const ox = (opts.x === undefined ? 0.5 : opts.x) * w;
    const oy = (opts.y === undefined ? 0.4 : opts.y) * h;
    const parts = Array.from({ length: opts.count || 150 }, () => ({
      x: ox,
      y: oy,
      vx: (Math.random() - 0.5) * 16,
      vy: -Math.random() * 15 - 4,
      size: 6 + Math.random() * 7,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.35,
      color: colors[Math.floor(Math.random() * colors.length)] || '#ffb703',
      round: Math.random() < 0.35,
    }));
    const duration = opts.duration || 2800;
    const start = performance.now();
    const frame = (now) => {
      const t = now - start;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, 1 - t / duration);
      parts.forEach((p) => {
        p.vy += 0.38;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      });
      if (t < duration) requestAnimationFrame(frame);
      else canvas.remove();
    };
    requestAnimationFrame(frame);
  }

  /* ---------- Segelboot-Szene (SVG) ---------- */

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function svg(tag, attrs, children) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, String(v)));
    (children || []).forEach((c) => node.append(c));
    return node;
  }

  function wavePath(baseY, amplitude, period, from, to) {
    let d = 'M' + from + ' ' + baseY;
    for (let x = from; x < to; x += period) {
      d += ' q ' + period / 4 + ' ' + -amplitude + ' ' + period / 2 + ' 0 t ' + period / 2 + ' 0';
    }
    return d + ' L ' + to + ' 240 L ' + from + ' 240 Z';
  }

  // Baut die Szene in container. update({ wind, anker, felsen, insel }) bewegt
  // das Boot pro Wind-Karte ein Stück Richtung Insel, zeigt Anker und Felsen.
  function createSailboat(container, options) {
    const opts = options || {};
    const W = 640;
    const travel = 360;
    const maxSteps = opts.maxSteps || 8;
    const rocks = [
      svg('path', { class: 'scene-rock', d: 'M398 170 l14 -30 l12 9 l10 21 z' }),
      svg('path', { class: 'scene-rock', d: 'M436 172 l10 -22 l9 7 l8 15 z' }),
      svg('path', { class: 'scene-rock', d: 'M372 174 l8 -18 l10 5 l6 13 z' }),
    ];
    const anchor = svg('g', { class: 'scene-anchor' }, [
      svg('path', { class: 'scene-rope', d: 'M-20 14 C -24 34, -16 48, -20 66' }),
      svg('path', { class: 'scene-anchor-shape', d: 'M-20 64 v14 M-28 74 q8 10 16 0 M-25 66 h10' }),
    ]);
    const windLines = svg('g', { class: 'scene-wind' }, [
      svg('path', { d: 'M-120 -54 q 30 -10 60 0' }),
      svg('path', { d: 'M-140 -30 q 34 -10 70 0' }),
      svg('path', { d: 'M-118 -6 q 26 -8 52 0' }),
    ]);
    const boat = svg('g', { class: 'scene-boat' }, [
      svg('g', { transform: 'translate(96 150)' }, [
        windLines,
        svg('g', { class: 'scene-boat-bob' }, [
          anchor,
          svg('path', { class: 'scene-hull', d: 'M-48 0 L48 0 L36 18 L-36 18 Z' }),
          svg('path', { class: 'scene-mast', d: 'M2 0 V-78' }),
          svg('path', { class: 'scene-sail', d: 'M6 -74 L6 -6 L46 -6 Z' }),
          svg('path', { class: 'scene-sail', d: 'M-2 -66 L-2 -8 L-34 -8 Z' }),
          svg('path', { class: 'scene-flag', d: 'M2 -78 L18 -73 L2 -68 Z' }),
        ]),
      ]),
    ]);
    const islandFlag = svg('path', { class: 'scene-island-flag', d: 'M600 108 v-26 l16 6 l-16 6' });
    const scene = svg('svg', { class: 'scene', viewBox: '0 0 ' + W + ' 220', 'aria-hidden': 'true', focusable: 'false' }, [
      svg('rect', { class: 'scene-sky', width: W, height: 220 }),
      svg('circle', { class: 'scene-sun', cx: 70, cy: 52, r: 24 }),
      svg('g', { class: 'scene-cloud' }, [
        svg('ellipse', { cx: 210, cy: 46, rx: 34, ry: 12 }),
        svg('ellipse', { cx: 236, cy: 38, rx: 22, ry: 12 }),
      ]),
      svg('g', { class: 'scene-cloud scene-cloud-slow' }, [
        svg('ellipse', { cx: 430, cy: 30, rx: 28, ry: 10 }),
        svg('ellipse', { cx: 450, cy: 24, rx: 18, ry: 9 }),
      ]),
      svg('g', { class: 'scene-island' }, [
        svg('ellipse', { class: 'scene-sand', cx: 580, cy: 172, rx: 84, ry: 26 }),
        svg('path', { class: 'scene-trunk', d: 'M582 166 q -8 -40 6 -74' }),
        svg('path', { class: 'scene-leaf', d: 'M588 92 q -30 -14 -46 6 q 24 -4 46 -6 z' }),
        svg('path', { class: 'scene-leaf', d: 'M588 92 q 28 -18 48 2 q -24 -4 -48 -2 z' }),
        svg('path', { class: 'scene-leaf', d: 'M588 92 q -6 -26 18 -34 q -10 16 -18 34 z' }),
        islandFlag,
      ]),
      svg('g', { class: 'scene-rocks' }, rocks),
      svg('path', { class: 'scene-wave scene-wave-back', d: wavePath(166, 6, 80, -80, W + 80) }),
      boat,
      svg('path', { class: 'scene-wave scene-wave-front', d: wavePath(178, 7, 80, -80, W + 80) }),
    ]);
    const caption = document.createElement('p');
    caption.className = 'scene-caption';
    container.replaceChildren(scene, caption);

    let lastWind = 0;
    function update(counts) {
      const c = counts || {};
      const wind = Number(c.wind) || 0;
      const steps = Math.min(wind, maxSteps);
      boat.style.setProperty('--boat-x', Math.round((steps / maxSteps) * travel) + 'px');
      boat.classList.toggle('is-anchored', (Number(c.anker) || 0) > 0);
      boat.classList.toggle('has-wind', wind > 0);
      rocks.forEach((r, i) => r.classList.toggle('is-visible', i < (Number(c.felsen) || 0)));
      islandFlag.classList.toggle('is-visible', (Number(c.insel) || 0) > 0);
      if (wind > lastWind) {
        boat.classList.remove('is-gust');
        boat.getBoundingClientRect();
        boat.classList.add('is-gust');
      }
      lastWind = wind;
      caption.textContent = steps >= maxSteps
        ? '⛵ Land in Sicht! Der Wind trägt euch bis zur Insel.'
        : '⛵ Jede Wind-Karte bringt das Boot ein Stück näher zur Insel (' + wind + ' Wind · ' + (Number(c.anker) || 0) + ' Anker · ' + (Number(c.felsen) || 0) + ' Felsen).';
    }
    update({});
    return { update, element: scene };
  }

  root.RetroLos = root.RetroLos || {};
  root.RetroLos.effects = Object.assign(root.RetroLos.effects || {}, { motionOk, showFace, rollDice, confetti, createSailboat });
})(globalThis);
