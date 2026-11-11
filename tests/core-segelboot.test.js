'use strict';
// Tests für core-segelboot.js – ausführen mit: node --test "tests/*.test.js"
const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('../core-segelboot.js');

test('Neues Logbuch hat vier leere Zonen', () => {
  const log = S.createLog('2026-11-12');
  assert.deepEqual(Object.keys(log.cards), ['wind', 'anker', 'felsen', 'insel']);
  assert.equal(log.actions.length, 0);
});

test('Karten: Text wird bereinigt, leere Karten abgelehnt', () => {
  const log = S.createLog('2026-11-12');
  assert.equal(S.addCard(log, 'wind', '  Pair-Programming\n hilft  '), true);
  assert.equal(S.addCard(log, 'wind', '   '), false);
  assert.equal(S.addCard(log, 'nebel', 'x'), false);
  assert.deepEqual(log.cards.wind, ['Pair-Programming hilft']);
  S.removeCard(log, 'wind', 0);
  assert.deepEqual(log.cards.wind, []);
});

test('Kurs: höchstens drei Schritte', () => {
  const log = S.createLog('2026-11-12');
  ['A', 'B', 'C'].forEach((t) => assert.equal(S.addAction(log, t, '2026-11-26'), true));
  assert.equal(S.addAction(log, 'D'), false);
  assert.equal(S.addAction(log, ' '), false);
  S.removeAction(log, 0);
  assert.deepEqual(log.actions.map((a) => a.what), ['B', 'C']);
  assert.equal(S.addAction(log, 'E', 'kein Datum'), true);
  assert.equal(log.actions[2].due, '');
});

test('Kurs des Boots: Wind treibt an, Anker bremst', () => {
  const log = S.createLog('2026-11-12');
  assert.deepEqual([S.course(log).progress, S.course(log).label], [0, 'Leinen los']);
  S.addCard(log, 'wind', 'a');
  S.addCard(log, 'wind', 'b');
  const fair = S.course(log);
  assert.equal(fair.label, 'Rückenwind');
  assert.ok(fair.progress > 0);
  S.addCard(log, 'anker', 'c');
  S.addCard(log, 'anker', 'd');
  assert.equal(S.course(log).label, 'Flaute');
  assert.ok(S.course(log).progress < fair.progress);
  S.addCard(log, 'anker', 'e');
  assert.equal(S.course(log).label, 'Vor Anker');
  for (let i = 0; i < 10; i++) S.addCard(log, 'wind', 'w' + i);
  assert.equal(S.course(log).progress, 1);
  assert.equal(S.course(log).label, 'Land in Sicht');
});

test('Gespeicherter Stand wird geprüft (normalize)', () => {
  const log = S.normalize({ title: 'Sprint 12', date: '2026-11-12', cards: { wind: ['ok', 3, ''], fremd: ['x'] }, actions: [{ what: 'A' }, {}, { what: 'B' }, { what: 'C' }, { what: 'D' }] });
  assert.equal(log.title, 'Sprint 12');
  assert.deepEqual(log.cards.wind, ['ok', '3']);
  assert.equal('fremd' in log.cards, false);
  assert.equal(log.actions.length, 3);
  assert.deepEqual(S.normalize(null).cards.anker, []);
  assert.deepEqual(S.normalize('kaputt').actions, []);
});

test('Markdown-Logbuch', () => {
  const log = S.createLog('2026-11-12');
  log.title = 'Sprint 12';
  S.addCard(log, 'wind', 'Klare Ziele');
  S.addCard(log, 'anker', 'Zu viele Meetings');
  S.addAction(log, 'Fokuszeit am Nachmittag', '2026-11-26');
  const md = S.toMarkdown(log);
  assert.equal(S.fileName(log), 'retro-segelboot-2026-11-12.md');
  assert.match(md, /^---\nretrolos: 2\ntyp: segeltoern\ntitel: "Sprint 12"\ndatum: 2026-11-12\n---\n# Sprint 12 – Retro-Logbuch vom 12\.11\.2026\n/);
  assert.match(md, /## Wind – Was treibt uns an\?\n- Klare Ziele\n/);
  assert.match(md, /## Kurs – unsere nächsten Schritte\n- \[ \] Fokuszeit am Nachmittag \(bis 26\.11\.2026\)\n$/);
  assert.doesNotMatch(md, /ß/);
});

test('Kurzfassung für Chat oder Mail', () => {
  const log = S.createLog('2026-11-12');
  S.addCard(log, 'wind', 'Klare Ziele');
  S.addAction(log, 'Fokuszeit');
  const text = S.summaryText(log);
  assert.match(text, /^⛵ Segeltörn – 12\.11\.2026 · Rückenwind\nWind: Klare Ziele\nKurs:\n1\. Fokuszeit$/);
});
