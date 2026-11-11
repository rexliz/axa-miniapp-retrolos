/* ==========================================================================
   RetroLos! – Effekte (selbst gebaut, ohne Bibliothek)
   Segelboot-Szene (SVG) und Konfetti (Canvas); beide respektieren
   prefers-reduced-motion.
   ========================================================================== */
(function (root) {
  'use strict';

  const motionOk = () => !(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
    return d + ' L ' + to + ' 260 L ' + from + ' 260 Z';
  }

  /* ---------- Segelboot-Szene ---------- */

  // update({ progress: 0…1, counts: { wind, anker, felsen, insel } })
  function createSailboat(container) {
    const W = 800;
    const travel = 440;
    const rocks = [
      svg('path', { class: 'scene-rock', d: 'M470 196 l16 -34 l14 10 l12 24 z' }),
      svg('path', { class: 'scene-rock', d: 'M516 198 l11 -24 l10 7 l9 17 z' }),
      svg('path', { class: 'scene-rock', d: 'M440 200 l9 -20 l11 6 l7 14 z' }),
    ];
    const windLines = svg('g', { class: 'scene-wind' }, [
      svg('path', { d: 'M-130 -60 q 32 -10 64 0' }),
      svg('path', { d: 'M-150 -34 q 36 -10 74 0' }),
      svg('path', { d: 'M-126 -8 q 28 -8 56 0' }),
    ]);
    const anchor = svg('g', { class: 'scene-anchor' }, [
      svg('path', { class: 'scene-rope', d: 'M-22 14 C -26 36, -18 52, -22 72' }),
      svg('path', { class: 'scene-anchor-shape', d: 'M-22 70 v14 M-30 80 q8 10 16 0 M-27 72 h10' }),
    ]);
    const boat = svg('g', { class: 'scene-boat' }, [
      svg('g', { transform: 'translate(110 176)' }, [
        windLines,
        svg('g', { class: 'scene-boat-bob' }, [
          anchor,
          svg('path', { class: 'scene-hull', d: 'M-54 0 L54 0 L40 20 L-40 20 Z' }),
          svg('path', { class: 'scene-mast', d: 'M2 0 V-88' }),
          svg('path', { class: 'scene-sail', d: 'M6 -84 L6 -6 L52 -6 Z' }),
          svg('path', { class: 'scene-sail-stripe', d: 'M6 -40 L32 -40 L38 -30 L6 -30 Z' }),
          svg('path', { class: 'scene-sail', d: 'M-2 -74 L-2 -8 L-38 -8 Z' }),
          svg('path', { class: 'scene-flag', d: 'M2 -88 L20 -82 L2 -76 Z' }),
        ]),
      ]),
    ]);
    const islandFlag = svg('path', { class: 'scene-island-flag', d: 'M742 128 v-30 l18 7 l-18 7' });
    const scene = svg('svg', { class: 'scene', viewBox: '0 0 ' + W + ' 250', 'aria-hidden': 'true', focusable: 'false' }, [
      svg('rect', { class: 'scene-sky', width: W, height: 250 }),
      svg('circle', { class: 'scene-sun', cx: 90, cy: 60, r: 28 }),
      svg('g', { class: 'scene-cloud' }, [
        svg('ellipse', { cx: 260, cy: 54, rx: 40, ry: 13 }),
        svg('ellipse', { cx: 290, cy: 45, rx: 26, ry: 13 }),
      ]),
      svg('g', { class: 'scene-cloud scene-cloud-slow' }, [
        svg('ellipse', { cx: 540, cy: 36, rx: 32, ry: 11 }),
        svg('ellipse', { cx: 562, cy: 29, rx: 20, ry: 10 }),
      ]),
      svg('g', { class: 'scene-island' }, [
        svg('ellipse', { class: 'scene-sand', cx: 720, cy: 196, rx: 100, ry: 30 }),
        svg('path', { class: 'scene-trunk', d: 'M722 190 q -9 -46 7 -84' }),
        svg('path', { class: 'scene-leaf', d: 'M729 106 q -34 -16 -52 7 q 27 -5 52 -7 z' }),
        svg('path', { class: 'scene-leaf', d: 'M729 106 q 32 -20 54 2 q -27 -4 -54 -2 z' }),
        svg('path', { class: 'scene-leaf', d: 'M729 106 q -7 -30 20 -38 q -11 18 -20 38 z' }),
        islandFlag,
      ]),
      svg('g', { class: 'scene-rocks' }, rocks),
      svg('path', { class: 'scene-wave scene-wave-back', d: wavePath(190, 6, 80, -80, W + 80) }),
      boat,
      svg('path', { class: 'scene-wave scene-wave-front', d: wavePath(204, 7, 80, -80, W + 80) }),
    ]);
    container.replaceChildren(scene);

    let lastWind = 0;
    function update(state) {
      const s = state || {};
      const c = s.counts || {};
      boat.style.setProperty('--boat-x', Math.round((s.progress || 0) * travel) + 'px');
      boat.classList.toggle('is-anchored', (c.anker || 0) > 0);
      boat.classList.toggle('has-wind', (c.wind || 0) > 0);
      rocks.forEach((r, i) => r.classList.toggle('is-visible', i < (c.felsen || 0)));
      islandFlag.classList.toggle('is-visible', (c.insel || 0) > 0);
      if ((c.wind || 0) > lastWind) {
        boat.classList.remove('is-gust');
        boat.getBoundingClientRect(); // Animation neu starten
        boat.classList.add('is-gust');
      }
      lastWind = c.wind || 0;
    }
    update({});
    return { update };
  }

  /* ---------- Konfetti ---------- */

  function confetti() {
    if (!motionOk()) return;
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
    const colors = ['--color-primary', '--color-red', '--color-sea', '--color-sand']
      .map((v) => css.getPropertyValue(v).trim()).filter(Boolean);
    const parts = Array.from({ length: 140 }, () => ({
      x: w / 2, y: h * 0.45,
      vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 15 - 4,
      size: 6 + Math.random() * 7, rot: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.35,
      color: colors[Math.floor(Math.random() * colors.length)] || '#00008f',
    }));
    const start = performance.now();
    const frame = (now) => {
      const t = now - start;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = Math.max(0, 1 - t / 2600);
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
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (t < 2600) requestAnimationFrame(frame);
      else canvas.remove();
    };
    requestAnimationFrame(frame);
  }

  root.RetroLos = root.RetroLos || {};
  root.RetroLos.effects = { motionOk, createSailboat, confetti };
})(globalThis);
