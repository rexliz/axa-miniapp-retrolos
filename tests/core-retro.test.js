'use strict';
// Tests für core-retro.js – ausführen mit: node --test "tests/*.test.js"
const test = require('node:test');
const assert = require('node:assert/strict');
const R = require('../core-retro.js');

test('Formate: eindeutige Schlüssel, 1–5 Zonen mit Frage, Segelboot als Standard', () => {
  const keys = new Set();
  for (const f of R.FORMATS) {
    assert.match(f.key, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(!keys.has(f.key), f.key);
    keys.add(f.key);
    assert.ok(f.emoji && f.name && f.fitsFor, f.key);
    assert.ok(f.zones.length >= 1 && f.zones.length <= 5, f.key);
    const zk = new Set();
    f.zones.forEach((z) => {
      assert.ok(z.key && z.name && z.question && z.emoji, f.key + '.' + z.key);
      assert.ok(!zk.has(z.key));
      zk.add(z.key);
    });
  }
  assert.ok(R.FORMATS.length >= 10);
  assert.equal(R.createLog('2026-11-12').format, 'segelboot');
  assert.doesNotMatch(JSON.stringify(R.FORMATS), /ß/);
});

test('Notizen bleiben pro Format erhalten', () => {
  const log = R.createLog('2026-11-12');
  assert.equal(R.addCard(log, 'wind', '  Klare  Ziele '), true);
  assert.equal(R.addCard(log, 'rot', 'gehört nicht hierher'), false);
  assert.equal(R.setFormat(log, 'ampel'), true);
  assert.equal(R.setFormat(log, 'gibt-es-nicht'), false);
  assert.equal(R.addCard(log, 'rot', 'Meetings ohne Agenda'), true);
  assert.deepEqual(R.count(log), { rot: 1, gelb: 0, gruen: 0 });
  R.setFormat(log, 'segelboot');
  assert.deepEqual(R.zoneCards(log, 'wind'), ['Klare Ziele']);
  R.removeCard(log, 'wind', 0);
  assert.deepEqual(R.zoneCards(log, 'wind'), []);
});

test('Nächste Schritte: höchstens drei', () => {
  const log = R.createLog('2026-11-12');
  ['A', 'B', 'C'].forEach((t) => assert.equal(R.addAction(log, t, '2026-11-26'), true));
  assert.equal(R.addAction(log, 'D'), false);
  R.removeAction(log, 0);
  assert.equal(R.addAction(log, 'E', 'kein Datum'), true);
  assert.deepEqual(log.actions.map((a) => [a.what, a.due]), [['B', '2026-11-26'], ['C', '2026-11-26'], ['E', '']]);
});

test('Segelboot: Wind treibt an, Anker bremst', () => {
  const log = R.createLog('2026-11-12');
  assert.equal(R.course(log).label, 'Leinen los');
  R.addCard(log, 'wind', 'a');
  R.addCard(log, 'wind', 'b');
  const fair = R.course(log);
  assert.equal(fair.label, 'Rückenwind');
  R.addCard(log, 'anker', 'c');
  R.addCard(log, 'anker', 'd');
  assert.equal(R.course(log).label, 'Flaute');
  assert.ok(R.course(log).progress < fair.progress);
  R.addCard(log, 'anker', 'e');
  assert.equal(R.course(log).label, 'Vor Anker');
  for (let i = 0; i < 10; i++) R.addCard(log, 'wind', 'w' + i);
  assert.deepEqual([R.course(log).progress, R.course(log).label], [1, 'Land in Sicht']);
});

test('Gespeicherter Stand wird geprüft – auch der ältere Segelboot-Stand', () => {
  const old = R.normalize({ version: 2, title: 'Sprint 12', date: '2026-11-12', cards: { wind: ['ok', 3, ''], fremd: ['x'] }, actions: [{ what: 'A' }, {}, { what: 'B' }, { what: 'C' }, { what: 'D' }] });
  assert.equal(old.format, 'segelboot');
  assert.deepEqual(R.zoneCards(old, 'wind'), ['ok', '3']);
  assert.equal(old.actions.length, 3);
  const now = R.normalize({ version: 3, format: 'ampel', cards: { ampel: { rot: ['x'] }, segelboot: { wind: ['y'] }, nix: { a: ['b'] } } });
  assert.equal(now.format, 'ampel');
  assert.deepEqual(R.zoneCards(now, 'rot'), ['x']);
  assert.equal('nix' in now.cards, false);
  assert.equal(R.normalize('kaputt').format, 'segelboot');
  assert.equal(R.normalize({ format: 'gibt-es-nicht' }).format, 'segelboot');
});

test('Dateiname für das PDF', () => {
  const log = R.createLog('2026-11-12');
  R.setFormat(log, 'ampel');
  assert.equal(R.fileName(log), 'retro-ampel-2026-11-12');
});

test('Kurzfassung für Chat oder Mail', () => {
  const log = R.createLog('2026-11-12');
  R.addCard(log, 'wind', 'Klare Ziele');
  R.addAction(log, 'Fokuszeit');
  assert.equal(R.summaryText(log), '⛵ Retro – Segelboot · 12.11.2026 · Rückenwind\nWind: Klare Ziele\nNächste Schritte:\n1. Fokuszeit');
  R.setFormat(log, 'zauberstab');
  assert.match(R.summaryText(log), /^🪄 Retro – Zauberstab · 12\.11\.2026\nNächste Schritte:/);
});
