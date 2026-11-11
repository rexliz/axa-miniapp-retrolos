'use strict';
// Tests für core-board.js: Import-Regeln und Zusammenführen der Beiträge
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../config.js');
const md = require('../core-markdown.js');
const B = require('../core-board.js');

const dir = path.join(__dirname, '..', 'docs', 'beispiele');
const examples = fs.readdirSync(dir)
  .filter((f) => /beitrag-.*\.md$/.test(f))
  .map((name) => ({ name, text: fs.readFileSync(path.join(dir, name), 'utf8') }));
const ID = 'R-2026-11-12-sprint-12';

function contribution(retroId, cards, extra) {
  return md.writeContribution(Object.assign({
    retroId, format: 'segelboot', weather: '☀️', initials: '', created: '2026-11-11T10:00', suffix: 'test',
    cards: Object.assign({ wind: [], anker: [], felsen: [], insel: [] }, cards),
  }, extra || {}), config);
}

test('Zusammenführen: vier Beispiel-Beiträge ergeben ein Board', () => {
  const board = B.createBoard({ retroId: ID, format: 'segelboot' });
  const report = B.importFiles(board, examples, config);
  assert.equal(report.added.length, 4);
  assert.equal(report.errors.length, 0);
  assert.equal(board.contributions.length, 4);
  const counts = B.columnCounts(board);
  assert.equal(counts.wind, 6);
  assert.equal(counts.anker, 7);
  assert.equal(counts.felsen, 3);
  assert.equal(counts.insel, 3);
  assert.equal(counts.sonstiges, 1, '«Leuchtturm» landet in Sonstiges');
  assert.equal(board.cards.find((c) => c.column === 'sonstiges').origin, 'Leuchtturm');
  assert.deepEqual(B.columnsFor(board, config).map((c) => c.key), ['wind', 'anker', 'felsen', 'insel', 'sonstiges']);
  const weather = Object.fromEntries(B.weatherCounts(board, config).map((w) => [w.emoji, w.count]));
  assert.deepEqual(weather, { '☀️': 1, '⛅': 2, '🌧️': 1, '⛈️': 0 });
  assert.equal(board.cards.filter((c) => c.initials === 'LR').length, 5);
});

test('Import-Regel: dieselbe Datei zweimal wird nur einmal übernommen (auch mit anderen Zeilenenden)', () => {
  const board = B.createBoard({ retroId: ID, format: 'segelboot' });
  const file = examples[0];
  B.importFiles(board, [file], config);
  const again = B.importFiles(board, [file, { name: 'kopie.md', text: file.text.replace(/\n/g, '\r\n') }], config);
  assert.deepEqual(again.duplicates, [file.name, 'kopie.md']);
  assert.equal(again.added.length, 0);
  assert.equal(board.contributions.length, 1);
});

test('Import-Regel: fremde Retro-ID wird erkannt und erst nach Rückfrage übernommen', () => {
  const board = B.createBoard({ retroId: ID, format: 'segelboot' });
  const foreign = contribution('R-2026-10-29-sprint-11', { wind: ['Alt'] });
  const first = B.importFiles(board, [{ name: foreign.filename, text: foreign.text }], config);
  assert.deepEqual(first.foreign, [{ name: foreign.filename, retroId: 'R-2026-10-29-sprint-11' }]);
  assert.equal(board.cards.length, 0);
  const second = B.importFiles(board, [{ name: foreign.filename, text: foreign.text }], config, { acceptRetroIds: ['R-2026-10-29-sprint-11'] });
  assert.equal(second.added.length, 1);
  assert.equal(board.cards.length, 1);
});

test('Import-Regel: kaputte Datei, Protokoll und fremde Dateitypen führen zu Meldungen', () => {
  const board = B.createBoard({ retroId: ID, format: 'segelboot' });
  const protocol = md.writeProtocol({ retroId: ID, mood: [], topics: [], actions: [], feedback: {} });
  const report = B.importFiles(board, [
    { name: 'kaputt.md', text: '---\nretrolos: 1\ntyp: beitrag\n' },
    { name: 'notizen.md', text: '# Einkaufsliste\n- Milch' },
    { name: protocol.filename, text: protocol.text },
    { name: 'bild.png', text: '' },
    examples[1],
  ], config);
  assert.equal(report.errors.length, 2);
  report.errors.forEach((e) => assert.ok(e.error.length > 15));
  assert.deepEqual(report.protocols, [protocol.filename]);
  assert.deepEqual(report.ignored, ['bild.png']);
  assert.equal(report.added.length, 1, 'gültige Dateien kommen trotzdem durch');
});

test('Import-Regel: unbekannte Spalte → «Sonstiges»; anderes Format → nach Namen zugeordnet', () => {
  const board = B.createBoard({ retroId: ID, format: 'segelboot' });
  const other = md.writeContribution({ retroId: ID, format: 'kalm', weather: '', initials: '', created: '', suffix: 'kalm',
    cards: { beibehalten: ['A'], hinzufuegen: [], weniger: ['B'], mehr: [] } }, config);
  const report = B.importFiles(board, [{ name: other.filename, text: other.text }], config);
  assert.equal(report.added[0].cards, 2);
  assert.ok(board.cards.every((c) => c.column === 'sonstiges'));
  assert.match(report.warnings[0].messages.join(' '), /KALM/);
});

test('Board ohne Planung übernimmt Retro-ID und Format aus der ersten Datei', () => {
  const board = B.createBoard({});
  B.importFiles(board, examples, config);
  assert.equal(board.retroId, ID);
  assert.equal(board.format, 'segelboot');
  assert.equal(board.contributions.length, 4);
});

test('Datenschutz-Markierung beim Import (Callback)', () => {
  const board = B.createBoard({ retroId: ID, format: 'segelboot' });
  const report = B.importFiles(board, examples, config, { flag: (t) => /\d{3} \d{3} \d{2} \d{2}/.test(t) });
  assert.equal(report.flagged, 1);
  assert.equal(board.cards.filter((c) => c.flagged).length, 1);
});

test('Karten: hinzufügen, bearbeiten, verschieben, löschen', () => {
  const board = B.createBoard({ retroId: ID, format: 'segelboot' });
  const a = B.addCard(board, 'wind', '  Neue Karte  ');
  assert.equal(a.text, 'Neue Karte');
  assert.equal(B.addCard(board, 'wind', '   '), null);
  B.updateCard(board, a.id, 'Geändert');
  B.moveCard(board, a.id, 'anker');
  assert.equal(B.getCard(board, a.id).column, 'anker');
  B.deleteCard(board, a.id);
  assert.equal(board.cards.length, 0);
});

test('Gruppieren, Punkte und Sortierung', () => {
  const board = B.createBoard({ retroId: ID, format: 'segelboot' });
  const a = B.addCard(board, 'anker', 'Meetings am Nachmittag');
  const b = B.addCard(board, 'anker', 'Spontane Meetings');
  const c = B.addCard(board, 'wind', 'Pair-Programming');
  B.vote(board, a.id, 2);
  B.vote(board, b.id, 1);
  B.vote(board, c.id, 2);
  B.vote(board, c.id, -5);
  assert.equal(c.votes, 0, 'nie negativ');
  const lead = B.groupCards(board, [a.id, b.id]);
  assert.equal(lead.id, a.id);
  assert.equal(lead.votes, 3);
  assert.deepEqual(B.visibleCards(board).map((x) => x.id), [a.id, c.id]);
  B.vote(board, c.id, 4);
  const top = B.topTopics(board, config, 5);
  assert.deepEqual(top.map((t) => [t.points, t.text, t.column]), [
    [4, 'Pair-Programming', 'Wind'],
    [3, 'Meetings am Nachmittag / Spontane Meetings', 'Anker'],
  ]);
  B.ungroup(board, a.id);
  assert.equal(B.visibleCards(board).length, 3);
  B.groupCards(board, [a.id, c.id]);
  B.deleteCard(board, a.id);
  assert.deepEqual(B.visibleCards(board).map((x) => x.id), [b.id, c.id], 'Löschen der Gruppe gibt Mitglieder frei');
});

test('Massnahmen und Feedback', () => {
  const board = B.createBoard({ retroId: ID });
  const m = B.addAction(board, { what: 'Fokuszeit', who: 'SM', due: '2026-11-26' });
  assert.equal(m.status, 'offen');
  assert.equal(B.addAction(board, { what: ' ' }), null);
  B.updateAction(board, m.id, { who: 'PO' });
  assert.equal(board.actions[0].who, 'PO');
  B.removeAction(board, m.id);
  assert.equal(board.actions.length, 0);
  B.addFeedback(board, 5);
  B.addFeedback(board, 4);
  B.addFeedback(board, 4);
  B.addFeedback(board, 3, -1);
  assert.deepEqual(board.feedback, { 1: 0, 2: 0, 3: 0, 4: 2, 5: 1 });
  assert.deepEqual(B.feedbackStats(board), { votes: 3, average: 4.3 });
});
