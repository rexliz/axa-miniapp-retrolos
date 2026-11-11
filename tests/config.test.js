'use strict';
// Prüft, dass die Konfiguration in sich stimmig ist – damit ein neues Format
// allein über config.js hinzukommen kann, ohne etwas kaputt zu machen.
const test = require('node:test');
const assert = require('node:assert/strict');
const config = require('../config.js');

test('Formate: eindeutige Schlüssel, 2–6 Spalten mit Name und Leitfrage', () => {
  const keys = new Set();
  for (const f of config.formats) {
    assert.match(f.key, /^[a-z0-9]+(-[a-z0-9]+)*$/, `Schlüssel ${f.key}`);
    assert.ok(!keys.has(f.key), `Schlüssel ${f.key} doppelt`);
    keys.add(f.key);
    for (const field of ['name', 'explanation', 'fitsWhen']) assert.ok(f[field], `${f.key}.${field}`);
    assert.ok(f.theme && f.theme.emoji, `${f.key}.theme.emoji`);
    assert.ok(f.columns.length >= 2 && f.columns.length <= 6, `${f.key}: Anzahl Spalten`);
    const colKeys = new Set();
    const colNames = new Set();
    for (const c of f.columns) {
      assert.ok(c.key && c.name && c.question, `${f.key}: Spalte unvollständig`);
      assert.notEqual(c.key, config.otherColumn.key, `${f.key}: «sonstiges» ist reserviert`);
      assert.ok(!colKeys.has(c.key) && !colNames.has(c.name.toLowerCase()), `${f.key}: Spalte doppelt`);
      colKeys.add(c.key);
      colNames.add(c.name.toLowerCase());
    }
  }
});

test('Die sechs verlangten Formate sind vorhanden', () => {
  const keys = config.formats.map((f) => f.key);
  for (const k of ['start-stop-continue', 'mad-sad-glad', '4l', 'segelboot', 'seestern', 'kalm']) {
    assert.ok(keys.includes(k), k);
  }
  const boat = config.formats.find((f) => f.key === 'segelboot');
  assert.deepEqual(boat.columns.map((c) => c.name), ['Wind', 'Anker', 'Felsen', 'Insel']);
});

test('Stimmungen verweisen nur auf existierende Formate, Begründung enthält {format}', () => {
  const keys = new Set(config.formats.map((f) => f.key));
  for (const m of config.moods) {
    assert.ok(m.formats.length > 0, m.key);
    m.formats.forEach((k) => assert.ok(keys.has(k), `${m.key} → ${k}`));
    assert.ok(m.reason.includes('{format}'), m.key);
  }
});

test('Agenda-Anteile ergeben 100 %, 15 Check-in-Fragen, 4 Wetter', () => {
  const sum = config.phases.reduce((s, p) => s + p.share, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
  assert.equal(config.phases.length, 5);
  assert.ok(config.checkinQuestions.length >= 15);
  assert.deepEqual(config.weather.map((w) => w.emoji), ['☀️', '⛅', '🌧️', '⛈️']);
});

test('Texte in Schweizer Rechtschreibung (kein ß)', () => {
  assert.doesNotMatch(JSON.stringify(config), /ß/);
});
