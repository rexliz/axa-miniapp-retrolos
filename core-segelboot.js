/* ==========================================================================
   RetroLos! – Logik des Segeltörns (ohne DOM)
   Eine Person, ein Logbuch: Karten in vier Zonen, bis zu drei Schritte als
   Kurs, Export als Markdown. Läuft im Browser (RetroLos.segelboot) und in
   Node (require) für die Tests.
   ========================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.RetroLos = root.RetroLos || {};
    root.RetroLos.segelboot = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const ZONES = [
    { key: 'wind', name: 'Wind', question: 'Was treibt uns an?' },
    { key: 'anker', name: 'Anker', question: 'Was bremst uns?' },
    { key: 'felsen', name: 'Felsen', question: 'Welche Risiken sehen wir?' },
    { key: 'insel', name: 'Insel', question: 'Wo wollen wir hin?' },
  ];
  const MAX_ACTIONS = 3;
  const MAX_TEXT = 300;

  const pad = (n) => String(n).padStart(2, '0');

  function todayIso(now) {
    const d = now || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function cleanText(text) {
    return String(text === null || text === undefined ? '' : text)
      .replace(/\r\n?/g, '\n')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .join(' ')
      .slice(0, MAX_TEXT);
  }

  function createLog(date) {
    const cards = {};
    ZONES.forEach((z) => { cards[z.key] = []; });
    return { version: 2, title: '', date: date || todayIso(), cards, actions: [] };
  }

  // Gespeicherten Stand prüfen; alles Unbekannte wird verworfen.
  function normalize(raw) {
    const log = createLog(raw && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : undefined);
    if (!raw || typeof raw !== 'object') return log;
    log.title = cleanText(raw.title).slice(0, 60);
    ZONES.forEach((z) => {
      const list = raw.cards && raw.cards[z.key];
      if (Array.isArray(list)) log.cards[z.key] = list.map(cleanText).filter(Boolean);
    });
    if (Array.isArray(raw.actions)) {
      log.actions = raw.actions
        .filter((a) => a && cleanText(a.what))
        .slice(0, MAX_ACTIONS)
        .map((a) => ({ what: cleanText(a.what), due: /^\d{4}-\d{2}-\d{2}$/.test(a.due || '') ? a.due : '' }));
    }
    return log;
  }

  function addCard(log, zone, text) {
    const clean = cleanText(text);
    if (!clean || !log.cards[zone]) return false;
    log.cards[zone].push(clean);
    return true;
  }

  function removeCard(log, zone, index) {
    if (log.cards[zone]) log.cards[zone].splice(index, 1);
  }

  function addAction(log, what, due) {
    const clean = cleanText(what);
    if (!clean || log.actions.length >= MAX_ACTIONS) return false;
    log.actions.push({ what: clean, due: /^\d{4}-\d{2}-\d{2}$/.test(due || '') ? due : '' });
    return true;
  }

  function removeAction(log, index) {
    log.actions.splice(index, 1);
  }

  function count(log) {
    const c = {};
    ZONES.forEach((z) => { c[z.key] = log.cards[z.key].length; });
    return c;
  }

  // Wind schiebt das Boot zur Insel, Anker halten es zurück.
  // progress: 0 (Start) … 1 (Insel erreicht)
  function course(log) {
    const c = count(log);
    const drive = c.wind - c.anker * 0.6;
    const progress = Math.max(0, Math.min(1, drive / 6));
    let label = 'Leinen los';
    if (c.wind + c.anker > 0) {
      if (progress >= 1) label = 'Land in Sicht';
      else if (c.wind > c.anker) label = 'Rückenwind';
      else if (c.wind === c.anker) label = 'Flaute';
      else label = 'Vor Anker';
    }
    return { progress, label, knots: Math.max(0, Math.round(drive * 2)), counts: c };
  }

  function formatDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
  }

  function fileName(log) {
    return 'retro-segelboot-' + log.date + '.md';
  }

  // Logbuch als Markdown (für Teams-Ordner, OneNote, Mail …)
  function toMarkdown(log) {
    const title = log.title || 'Segeltörn';
    const lines = [
      '---',
      'retrolos: 2',
      'typ: segeltoern',
      'titel: ' + JSON.stringify(title),
      'datum: ' + log.date,
      '---',
      '# ' + title + ' – Retro-Logbuch vom ' + formatDate(log.date),
    ];
    ZONES.forEach((z) => {
      lines.push('', '## ' + z.name + ' – ' + z.question);
      log.cards[z.key].forEach((t) => lines.push('- ' + t));
    });
    lines.push('', '## Kurs – unsere nächsten Schritte');
    log.actions.forEach((a) => lines.push('- [ ] ' + a.what + (a.due ? ' (bis ' + formatDate(a.due) + ')' : '')));
    return lines.join('\n') + '\n';
  }

  // Kurzfassung zum Einfügen in einen Chat oder eine Mail
  function summaryText(log) {
    const c = course(log);
    const lines = ['⛵ ' + (log.title || 'Segeltörn') + ' – ' + formatDate(log.date) + ' · ' + c.label];
    ZONES.forEach((z) => {
      if (log.cards[z.key].length) lines.push(z.name + ': ' + log.cards[z.key].join(' · '));
    });
    if (log.actions.length) {
      lines.push('Kurs:');
      log.actions.forEach((a, i) => lines.push((i + 1) + '. ' + a.what + (a.due ? ' (bis ' + formatDate(a.due) + ')' : '')));
    }
    return lines.join('\n');
  }

  return {
    ZONES, MAX_ACTIONS, todayIso, cleanText, createLog, normalize, addCard, removeCard,
    addAction, removeAction, count, course, formatDate, fileName, toMarkdown, summaryText,
  };
});
