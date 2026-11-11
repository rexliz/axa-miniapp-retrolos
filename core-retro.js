/* ==========================================================================
   RetroLos! – Logik der Retro (ohne DOM)
   Eine Person, ein Logbuch: Format wählen, Notizen pro Zone, bis zu drei
   nächste Schritte, Export als PDF oder Text. Neue Formate kommen nur in FORMATS
   dazu. Läuft im Browser (RetroLos.retro) und in Node (require) für Tests.
   ========================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.RetroLos = root.RetroLos || {};
    root.RetroLos.retro = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // key: technischer Schlüssel (nie ändern) · scene: 'segelboot' zeigt das Boot
  const FORMATS = [
    {
      key: 'segelboot', emoji: '⛵', name: 'Segelboot', fitsFor: 'Hindernisse und Risiken', scene: 'segelboot',
      zones: [
        { key: 'wind', emoji: '💨', name: 'Wind', question: 'Was gibt uns Rückenwind?' },
        { key: 'anker', emoji: '⚓', name: 'Anker', question: 'Was bremst uns?' },
        { key: 'felsen', emoji: '🪨', name: 'Felsen', question: 'Welche Klippen und Risiken liegen vor uns?' },
        { key: 'insel', emoji: '🏝️', name: 'Insel', question: 'Wo wollen wir hin?' },
      ],
    },
    {
      key: 'ampel', emoji: '🚦', name: 'Ampel', fitsFor: 'Allrounder',
      zones: [
        { key: 'rot', emoji: '🔴', name: 'Rot', question: 'Was müssen wir stoppen?' },
        { key: 'gelb', emoji: '🟡', name: 'Gelb', question: 'Wo müssen wir aufpassen?' },
        { key: 'gruen', emoji: '🟢', name: 'Grün', question: 'Was sollten wir unbedingt fortsetzen?' },
      ],
    },
    {
      key: 'heissluftballon', emoji: '🎈', name: 'Heissluftballon', fitsFor: 'Motivation und Blocker',
      zones: [
        { key: 'auftrieb', emoji: '🔥', name: 'Auftrieb', question: 'Was lässt uns abheben?' },
        { key: 'ballast', emoji: '🧱', name: 'Ballast', question: 'Welcher Ballast hält uns unten?' },
      ],
    },
    {
      key: 'mad-sad-glad', emoji: '😤', name: 'Mad – Sad – Glad', fitsFor: 'Stimmung im Team',
      zones: [
        { key: 'mad', emoji: '😤', name: 'Mad', question: 'Was hat genervt?' },
        { key: 'sad', emoji: '😢', name: 'Sad', question: 'Was hat enttäuscht?' },
        { key: 'glad', emoji: '😊', name: 'Glad', question: 'Was hat gefreut?' },
      ],
    },
    {
      key: 'start-stop-continue', emoji: '⭐', name: 'Start – Stop – Continue', fitsFor: 'sehr handlungsorientiert',
      zones: [
        { key: 'start', emoji: '▶️', name: 'Start', question: 'Was sollten wir anfangen?' },
        { key: 'stop', emoji: '⏹️', name: 'Stop', question: 'Was sollten wir aufhören?' },
        { key: 'continue', emoji: '🔁', name: 'Continue', question: 'Was sollten wir beibehalten?' },
      ],
    },
    {
      key: 'zombie-scrum', emoji: '🧟', name: 'Zombie-Scrum', fitsFor: 'eingefahrene Teams',
      zones: [
        { key: 'gewohnheit', emoji: '🧟', name: 'Zombie', question: 'Was machen wir nur noch, weil «wir es schon immer so gemacht haben»?' },
        { key: 'leben', emoji: '💚', name: 'Wiederbeleben', question: 'Was würde wieder Leben hineinbringen?' },
      ],
    },
    {
      key: 'kill-one-thing', emoji: '🗑️', name: 'Kill one thing', fitsFor: 'Prozesse entschlacken',
      zones: [
        { key: 'kill', emoji: '🗑️', name: 'Weg damit', question: 'Wenn wir eine Sache aus unserem Sprint-Prozess entfernen dürften, welche wäre es?' },
      ],
    },
    {
      key: 'zauberstab', emoji: '🪄', name: 'Zauberstab', fitsFor: 'Wünsche sichtbar machen',
      zones: [
        { key: 'wunsch', emoji: '🪄', name: 'Zauber', question: 'Du kannst über Nacht genau eine Sache im Team verbessern. Was ist morgen anders?' },
      ],
    },
    {
      key: 'sprint-awards', emoji: '🏆', name: 'Sprint Awards', fitsFor: 'lockerer Einstieg',
      zones: [
        { key: 'erfolg', emoji: '🏆', name: 'Grösster Erfolg', question: 'Was war unser grösster Erfolg?' },
        { key: 'ueberraschung', emoji: '🎉', name: 'Überraschung', question: 'Was hat uns überrascht?' },
        { key: 'blocker', emoji: '🧱', name: 'Nervigster Blocker', question: 'Was hat am meisten genervt?' },
        { key: 'zusammenarbeit', emoji: '🤝', name: 'Beste Zusammenarbeit', question: 'Wo haben wir am besten zusammengearbeitet?' },
      ],
    },
    {
      key: 'sherlock', emoji: '🕵️', name: 'Sherlock Retro', fitsFor: 'tiefere Ursachenanalyse',
      zones: [
        { key: 'hinweise', emoji: '🔍', name: 'Hinweise', question: 'Welche Hinweise zeigen, dass etwas nicht optimal läuft?' },
        { key: 'ursache', emoji: '🧩', name: 'Ursache', question: 'Was ist Ursache statt Symptom?' },
      ],
    },
    {
      key: 'film', emoji: '🎬', name: 'Unser Sprint als Film', fitsFor: 'kreativer Einstieg',
      zones: [
        { key: 'titel', emoji: '🎬', name: 'Filmtitel', question: 'Wie heisst der Film zu unserem Sprint?' },
        { key: 'genre', emoji: '🎭', name: 'Genre', question: 'Welches Genre war es?' },
        { key: 'beste-szene', emoji: '🌟', name: 'Beste Szene', question: 'Welche Szene war die beste?' },
        { key: 'schnitt', emoji: '✂️', name: 'Rausschneiden', question: 'Welche Szene gehört rausgeschnitten?' },
        { key: 'fortsetzung', emoji: '🍿', name: 'Fortsetzung', question: 'Wie soll die Fortsetzung aussehen?' },
      ],
    },
    {
      key: 'sterne', emoji: '🌟', name: '1 Stern / 5 Sterne', fitsFor: 'kleine Verbesserungen finden',
      zones: [
        { key: 'bewertung', emoji: '⭐', name: 'Bewertung', question: 'Wie viele von 5 Sternen bekommt unser letzter Sprint?' },
        { key: 'weniger', emoji: '➖', name: 'Ein Stern weniger?', question: 'Warum nicht einen Stern weniger?' },
        { key: 'mehr', emoji: '➕', name: 'Ein Stern mehr', question: 'Was fehlt für einen Stern mehr?' },
      ],
    },
    {
      key: 'breaking-news', emoji: '📰', name: 'Breaking News', fitsFor: 'Themen auf den Punkt bringen',
      zones: [
        { key: 'schlagzeile', emoji: '📰', name: 'Schlagzeile', question: 'Welche fiktive Schlagzeile passt zu unserem Sprint?' },
        { key: 'dahinter', emoji: '🔎', name: 'Dahinter', question: 'Was steckt hinter dieser Schlagzeile?' },
      ],
    },
  ];
  const DEFAULT_FORMAT = 'segelboot';
  const MAX_ACTIONS = 3;
  const MAX_TEXT = 300;
  const ISO = /^\d{4}-\d{2}-\d{2}$/;

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
      .replace(/\s+/g, ' ')
      .slice(0, MAX_TEXT);
  }

  function findFormat(key) {
    return FORMATS.find((f) => f.key === key) || null;
  }

  function format(log) {
    return findFormat(log.format) || findFormat(DEFAULT_FORMAT);
  }

  // Notizen liegen pro Format: cards[format][zone] – ein Wechsel löscht nichts.
  function createLog(date) {
    return { version: 3, format: DEFAULT_FORMAT, title: '', date: date || todayIso(), cards: {}, actions: [] };
  }

  function zoneCards(log, zone) {
    const f = format(log);
    if (!f.zones.some((z) => z.key === zone)) return null;
    log.cards[f.key] = log.cards[f.key] || {};
    log.cards[f.key][zone] = log.cards[f.key][zone] || [];
    return log.cards[f.key][zone];
  }

  // Gespeicherten Stand prüfen; Unbekanntes wird verworfen. Liest auch den
  // älteren Stand (Version 2, nur Segelboot).
  function normalize(raw) {
    const log = createLog(raw && ISO.test(raw.date) ? raw.date : undefined);
    if (!raw || typeof raw !== 'object') return log;
    log.title = cleanText(raw.title).slice(0, 60);
    if (findFormat(raw.format)) log.format = raw.format;
    const source = raw.cards && typeof raw.cards === 'object' ? raw.cards : {};
    const byFormat = raw.version === 2 || !raw.format ? { segelboot: source } : source;
    FORMATS.forEach((f) => {
      const zones = byFormat[f.key];
      if (!zones || typeof zones !== 'object') return;
      f.zones.forEach((z) => {
        if (Array.isArray(zones[z.key])) {
          const list = zones[z.key].map(cleanText).filter(Boolean);
          if (list.length) {
            log.cards[f.key] = log.cards[f.key] || {};
            log.cards[f.key][z.key] = list;
          }
        }
      });
    });
    if (Array.isArray(raw.actions)) {
      log.actions = raw.actions
        .filter((a) => a && cleanText(a.what))
        .slice(0, MAX_ACTIONS)
        .map((a) => ({ what: cleanText(a.what), due: ISO.test(a.due || '') ? a.due : '' }));
    }
    return log;
  }

  function setFormat(log, key) {
    if (!findFormat(key)) return false;
    log.format = key;
    return true;
  }

  function addCard(log, zone, text) {
    const clean = cleanText(text);
    const list = zoneCards(log, zone);
    if (!clean || !list) return false;
    list.push(clean);
    return true;
  }

  function removeCard(log, zone, index) {
    const list = zoneCards(log, zone);
    if (list) list.splice(index, 1);
  }

  function addAction(log, what, due) {
    const clean = cleanText(what);
    if (!clean || log.actions.length >= MAX_ACTIONS) return false;
    log.actions.push({ what: clean, due: ISO.test(due || '') ? due : '' });
    return true;
  }

  function removeAction(log, index) {
    log.actions.splice(index, 1);
  }

  function count(log) {
    const c = {};
    format(log).zones.forEach((z) => { c[z.key] = zoneCards(log, z.key).length; });
    return c;
  }

  // Nur Segelboot: Wind schiebt das Boot zur Insel, Anker halten es zurück.
  function course(log) {
    const c = count(log);
    const wind = c.wind || 0;
    const anker = c.anker || 0;
    const drive = wind - anker * 0.6;
    const progress = Math.max(0, Math.min(1, drive / 6));
    let label = 'Leinen los';
    if (wind + anker > 0) {
      if (progress >= 1) label = 'Land in Sicht';
      else if (wind > anker) label = 'Rückenwind';
      else if (wind === anker) label = 'Flaute';
      else label = 'Vor Anker';
    }
    return { progress, label, knots: Math.max(0, Math.round(drive * 2)), counts: c };
  }

  function formatDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
  }

  // Name für die PDF-Datei (der Browser übernimmt den Seitentitel)
  function fileName(log) {
    return 'retro-' + format(log).key + '-' + log.date;
  }

  function summaryText(log) {
    const f = format(log);
    const head = f.emoji + ' ' + (log.title || 'Retro') + ' – ' + f.name + ' · ' + formatDate(log.date);
    const lines = [f.scene === 'segelboot' ? head + ' · ' + course(log).label : head];
    f.zones.forEach((z) => {
      const list = zoneCards(log, z.key);
      if (list.length) lines.push(z.name + ': ' + list.join(' · '));
    });
    if (log.actions.length) {
      lines.push('Nächste Schritte:');
      log.actions.forEach((a, i) => lines.push((i + 1) + '. ' + a.what + (a.due ? ' (bis ' + formatDate(a.due) + ')' : '')));
    }
    return lines.join('\n');
  }

  return {
    FORMATS, DEFAULT_FORMAT, MAX_ACTIONS, todayIso, cleanText, findFormat, format, createLog, normalize,
    setFormat, zoneCards, addCard, removeCard, addAction, removeAction, count, course, formatDate,
    fileName, summaryText,
  };
});
