/* ==========================================================================
   RetroLos! – Board-Logik (ohne DOM)
   Import mit Prüfregeln, Zusammenführen der Beiträge, Karten, Gruppen,
   Punkte, Massnahmen, Feedback. Das Board ist ein einfaches Objekt, das die
   Oberfläche in localStorage ablegt.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./core-markdown.js'));
  } else {
    root.RetroLos = root.RetroLos || {};
    root.RetroLos.board = factory(root.RetroLos.markdown);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (md) {
  'use strict';

  const MAX_FILE_SIZE = 300000;

  function findFormat(config, key) {
    return config.formats.find((f) => f.key === key) || null;
  }

  function createBoard(opts) {
    const o = opts || {};
    return {
      version: 1,
      retroId: o.retroId || '',
      format: o.format || '',
      sprint: o.sprint || '',
      date: o.date || '',
      question: o.question || '',
      agenda: Array.isArray(o.agenda) ? o.agenda : null,
      cards: [],
      contributions: [],
      actions: [],
      review: Array.isArray(o.review) ? o.review : [],
      feedback: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      phase: 0,
      showInitials: false,
      sound: false,
      finished: false,
      nextId: 1,
    };
  }

  // Spalten des Boards; «Sonstiges» nur, wenn dort Karten liegen.
  function columnsFor(board, config) {
    const format = findFormat(config, board.format);
    const cols = format ? format.columns.slice() : [];
    if (!format || board.cards.some((c) => c.column === config.otherColumn.key)) cols.push(config.otherColumn);
    return cols;
  }

  function columnName(board, config, key) {
    const col = columnsFor(board, config).find((c) => c.key === key);
    return col ? col.name : key;
  }

  function makeCard(board, data) {
    const card = {
      id: 'k' + board.nextId++,
      column: data.column,
      text: md.cleanText(data.text),
      origin: data.origin || '',
      initials: data.initials || '',
      source: data.source || 'manuell',
      votes: 0,
      members: [],
      groupedInto: '',
      flagged: Boolean(data.flagged),
    };
    board.cards.push(card);
    return card;
  }

  /* ---------- Import ---------- */

  // files: [{ name, text }]. options.acceptRetroIds: fremde Retro-IDs, die
  // der Scrum Master ausdrücklich übernehmen will. options.flag(text) → bool
  // markiert Karten (Datenschutz-Wächter).
  function importFiles(board, files, config, options) {
    const opts = options || {};
    const accept = new Set(opts.acceptRetroIds || []);
    const report = { added: [], duplicates: [], foreign: [], errors: [], protocols: [], warnings: [], ignored: [], flagged: 0 };
    const seen = new Set(board.contributions.map((c) => c.hash));

    files.forEach((file) => {
      const name = String(file.name || 'Datei');
      if (!/\.(md|markdown|txt)$/i.test(name)) {
        report.ignored.push(name);
        return;
      }
      const text = typeof file.text === 'string' ? file.text : '';
      if (text.length > MAX_FILE_SIZE) {
        report.errors.push({ name, error: 'Die Datei ist zu gross für einen Retro-Beitrag.' });
        return;
      }
      if (md.detectType(text) === 'protokoll') {
        report.protocols.push(name);
        return;
      }
      const hash = md.contentHash(text);
      if (seen.has(hash)) {
        report.duplicates.push(name);
        return;
      }
      const parsed = md.parseContribution(text, config, board.format || undefined);
      if (!parsed.ok) {
        report.errors.push({ name, error: parsed.error });
        return;
      }
      if (!board.retroId) board.retroId = parsed.meta.retroId;
      if (!board.format && findFormat(config, parsed.meta.format)) board.format = parsed.meta.format;
      if (parsed.meta.retroId !== board.retroId && !accept.has(parsed.meta.retroId)) {
        report.foreign.push({ name, retroId: parsed.meta.retroId });
        return;
      }
      seen.add(hash);
      let count = 0;
      const add = (column, text, origin) => {
        const flagged = typeof opts.flag === 'function' ? Boolean(opts.flag(text)) : false;
        if (flagged) report.flagged++;
        makeCard(board, { column, text, origin, initials: parsed.meta.initials, source: hash, flagged });
        count++;
      };
      Object.keys(parsed.cards).forEach((col) => parsed.cards[col].forEach((t) => add(col, t, '')));
      parsed.other.forEach((o) => add(config.otherColumn.key, o.text, o.origin));
      board.contributions.push({
        hash,
        name,
        retroId: parsed.meta.retroId,
        weather: parsed.meta.weather,
        initials: parsed.meta.initials,
        created: parsed.meta.created,
        cards: count,
      });
      report.added.push({ name, cards: count, retroId: parsed.meta.retroId });
      if (parsed.warnings.length) report.warnings.push({ name, messages: parsed.warnings });
    });
    return report;
  }

  /* ---------- Karten ---------- */

  function getCard(board, id) {
    return board.cards.find((c) => c.id === id) || null;
  }

  // Karten, die auf dem Board sichtbar sind (nicht in einer Gruppe versteckt).
  function visibleCards(board, column) {
    return board.cards.filter((c) => !c.groupedInto && (column === undefined || c.column === column));
  }

  function addCard(board, column, text, extra) {
    const clean = md.cleanText(text);
    if (!clean) return null;
    return makeCard(board, Object.assign({ column, text: clean, source: 'manuell' }, extra || {}));
  }

  function updateCard(board, id, text) {
    const card = getCard(board, id);
    const clean = md.cleanText(text);
    if (!card || !clean) return null;
    card.text = clean;
    return card;
  }

  function ungroup(board, leadId) {
    const lead = getCard(board, leadId);
    if (!lead) return;
    lead.members.forEach((mid) => {
      const m = getCard(board, mid);
      if (m) m.groupedInto = '';
    });
    lead.members = [];
  }

  function deleteCard(board, id) {
    const card = getCard(board, id);
    if (!card) return;
    if (card.members.length) ungroup(board, id);
    if (card.groupedInto) {
      const lead = getCard(board, card.groupedInto);
      if (lead) lead.members = lead.members.filter((m) => m !== id);
    }
    board.cards = board.cards.filter((c) => c.id !== id);
  }

  function moveCard(board, id, column) {
    const card = getCard(board, id);
    if (!card) return;
    card.column = column;
    card.members.forEach((mid) => {
      const m = getCard(board, mid);
      if (m) m.column = column;
    });
  }

  function vote(board, id, delta) {
    const card = getCard(board, id);
    if (!card) return 0;
    card.votes = Math.max(0, card.votes + delta);
    return card.votes;
  }

  // Fasst Karten zusammen: Die erste (älteste) wird zur Gruppe, die anderen
  // verschwinden in ihr. Punkte werden addiert.
  function groupCards(board, ids) {
    const cards = board.cards.filter((c) => ids.includes(c.id) && !c.groupedInto);
    if (cards.length < 2) return null;
    const [lead, ...rest] = cards;
    rest.forEach((c) => {
      lead.members.push(c.id, ...c.members);
      lead.votes += c.votes;
      c.votes = 0;
      c.members.forEach((mid) => {
        const m = getCard(board, mid);
        if (m) m.groupedInto = lead.id;
      });
      c.members = [];
      c.groupedInto = lead.id;
    });
    lead.members.forEach((mid) => {
      const m = getCard(board, mid);
      if (m) m.column = lead.column;
    });
    return lead;
  }

  function memberCards(board, card) {
    return card.members.map((id) => getCard(board, id)).filter(Boolean);
  }

  // Stabil absteigend nach Punkten sortieren.
  function sortByVotes(cards) {
    return cards
      .map((c, i) => ({ c, i }))
      .sort((a, b) => b.c.votes - a.c.votes || a.i - b.i)
      .map((x) => x.c);
  }

  function topTopics(board, config, limit) {
    return sortByVotes(visibleCards(board))
      .slice(0, limit || 5)
      .map((c) => ({
        id: c.id,
        points: c.votes,
        text: [c.text].concat(memberCards(board, c).map((m) => m.text)).join(' / '),
        column: columnName(board, config, c.column),
      }));
  }

  function columnCounts(board) {
    const counts = {};
    board.cards.forEach((c) => { counts[c.column] = (counts[c.column] || 0) + 1; });
    return counts;
  }

  function weatherCounts(board, config) {
    return config.weather.map((w) => ({
      emoji: w.emoji,
      label: w.label,
      count: board.contributions.filter((c) => c.weather === w.emoji).length,
    }));
  }

  /* ---------- Massnahmen und Feedback ---------- */

  function addAction(board, data) {
    const what = md.cleanText(data && data.what).replace(/\n/g, ' ');
    if (!what) return null;
    const action = {
      id: 'm' + board.nextId++,
      what,
      who: md.cleanText(data.who || '').replace(/\n/g, ' '),
      due: data.due || '',
      status: 'offen',
    };
    board.actions.push(action);
    return action;
  }

  function updateAction(board, id, data) {
    const action = board.actions.find((a) => a.id === id);
    if (!action) return null;
    ['what', 'who', 'due', 'status'].forEach((k) => {
      if (data[k] !== undefined) action[k] = md.cleanText(data[k]).replace(/\n/g, ' ');
    });
    return action;
  }

  function removeAction(board, id) {
    board.actions = board.actions.filter((a) => a.id !== id);
  }

  function addFeedback(board, score, delta) {
    const key = String(score);
    if (!(key in board.feedback)) return;
    board.feedback[key] = Math.max(0, (board.feedback[key] || 0) + (delta === undefined ? 1 : delta));
  }

  function feedbackStats(board) {
    let votes = 0;
    let sum = 0;
    Object.keys(board.feedback).forEach((k) => {
      votes += board.feedback[k];
      sum += Number(k) * board.feedback[k];
    });
    return { votes, average: votes ? Math.round((sum / votes) * 10) / 10 : 0 };
  }

  /* ---------- Protokoll und Zusammenfassung ---------- */

  const REVIEW_LABELS = { umgesetzt: 'umgesetzt', teilweise: 'teilweise', 'nicht umgesetzt': 'nicht umgesetzt' };

  // Daten für md.writeProtocol(). Top-Themen: alle Karten mit Punkten,
  // sonst die ersten fünf.
  function buildProtocol(board, config) {
    const all = topTopics(board, config, board.cards.length || 1);
    const voted = all.filter((t) => t.points > 0);
    const topics = (voted.length ? voted : all.slice(0, 5)).map((t) => ({ points: t.points, text: t.text, column: t.column }));
    return {
      retroId: board.retroId,
      sprint: board.sprint,
      format: board.format,
      date: board.date,
      contributions: board.contributions.length,
      mood: weatherCounts(board, config).map((w) => ({ emoji: w.emoji, count: w.count })),
      topics,
      actions: board.actions.map((a) => ({ what: a.what, who: a.who, due: a.due, status: a.status || 'offen' })),
      review: (board.review || [])
        .filter((r) => REVIEW_LABELS[r.status])
        .map((r) => ({ what: r.what, who: r.who, due: r.due, status: r.status })),
      feedback: Object.assign({}, board.feedback),
    };
  }

  function formatDay(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!m) return iso || '';
    const day = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay();
    return ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][day] + ', ' + m[3] + '.' + m[2] + '.' + m[1];
  }

  // Kompakte Zusammenfassung zum Einfügen in den Teams-Chat.
  function summaryText(board, config) {
    const format = findFormat(config, board.format);
    const p = buildProtocol(board, config);
    const stats = feedbackStats(board);
    const lines = [];
    lines.push('🔁 Retro «' + (board.sprint || board.retroId) + '»' + (board.date ? ' – ' + formatDay(board.date) : '') + (format ? ' · Format: ' + format.name : ''));
    lines.push('Stimmung: ' + p.mood.map((m) => m.emoji + ' ' + m.count).join(' · ') + ' (' + p.contributions + (p.contributions === 1 ? ' Beitrag)' : ' Beiträge)'));
    lines.push('');
    lines.push('Top-Themen:');
    if (p.topics.length) p.topics.slice(0, 3).forEach((t, i) => lines.push((i + 1) + '. ' + t.text + ' (' + t.points + (t.points === 1 ? ' Punkt)' : ' Punkte)')));
    else lines.push('– keine –');
    lines.push('');
    lines.push('Massnahmen:');
    if (p.actions.length) p.actions.forEach((a) => lines.push('• ' + a.what + (a.who ? ' – ' + a.who : '') + (a.due ? ', bis ' + formatDay(a.due) : '')));
    else lines.push('– keine –');
    if (p.review.length) {
      lines.push('');
      lines.push('Rückblick letzte Retro: ' + p.review.map((r) => r.what + ' (' + r.status + ')').join('; '));
    }
    if (stats.votes) {
      lines.push('');
      lines.push('Feedback zur Retro: Ø ' + String(stats.average).replace('.', ',') + ' von 5 (' + stats.votes + (stats.votes === 1 ? ' Stimme)' : ' Stimmen)'));
    }
    lines.push('');
    lines.push('Danke fürs Mitmachen! 🙌');
    return lines.join('\n');
  }

  return {
    buildProtocol,
    summaryText,
    createBoard,
    columnsFor,
    columnName,
    importFiles,
    getCard,
    visibleCards,
    addCard,
    updateCard,
    deleteCard,
    moveCard,
    vote,
    groupCards,
    ungroup,
    memberCards,
    sortByVotes,
    topTopics,
    columnCounts,
    weatherCounts,
    addAction,
    updateAction,
    removeAction,
    addFeedback,
    feedbackStats,
  };
});
