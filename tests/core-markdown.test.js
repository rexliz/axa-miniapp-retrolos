'use strict';
// Tests für core-markdown.js – Dateiformat siehe docs/dateiformat.md
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../config.js');
const md = require('../core-markdown.js');

const sample = {
  retroId: 'R-2026-11-12-sprint-12',
  format: 'segelboot',
  weather: '⛅',
  initials: '',
  created: '2026-11-11T16:20',
  suffix: 'k3f9',
  cards: {
    wind: ['Die Pair-Programming-Sessions haben uns schneller gemacht', 'Klare Ziele: «Release 2.0»'],
    anker: ['Zu viele spontane Meetings am Nachmittag'],
    felsen: ['Urlaub von zwei Personen im Dezember\nWissen ist nicht verteilt'],
    insel: [],
  },
};

test('Beitrag: Schreiben und wieder Lesen ergibt dieselben Daten', () => {
  const { filename, text } = md.writeContribution(sample, config);
  assert.equal(filename, 'retro-R-2026-11-12-sprint-12-beitrag-k3f9.md');
  const parsed = md.parseContribution(text, config);
  assert.equal(parsed.ok, true, parsed.error);
  assert.deepEqual(parsed.meta, {
    version: 1, retroId: sample.retroId, format: 'segelboot', weather: '⛅', initials: '', created: '2026-11-11T16:20',
  });
  assert.deepEqual(parsed.cards, sample.cards);
  assert.deepEqual(parsed.other, []);
  assert.equal(parsed.cardCount, 4);
});

test('Beitrag: Datei entspricht dem dokumentierten Format', () => {
  const { text } = md.writeContribution(sample, config);
  assert.match(text, /^---\nretrolos: 1\ntyp: beitrag\nretro_id: R-2026-11-12-sprint-12\nformat: segelboot\nwetter: "⛅"\nkuerzel: ""\s+# freiwillig\nerstellt: 2026-11-11T16:20\n---\n## Wind\n- Die Pair/);
  assert.match(text, /\n## Anker\n- Zu viele spontane Meetings am Nachmittag\n/);
  assert.match(text, /- Urlaub von zwei Personen im Dezember\n {4}Wissen ist nicht verteilt\n/);
});

test('Beitrag: Sonderzeichen in Kürzel und Karten überstehen den Rundweg', () => {
  const tricky = Object.assign({}, sample, {
    initials: 'A: "B" # c',
    cards: { wind: ['- beginnt mit Strich', '## keine Überschrift', 'Text mit | Pipe und # Raute'], anker: [], felsen: [], insel: [] },
  });
  const parsed = md.parseContribution(md.writeContribution(tricky, config).text, config);
  assert.equal(parsed.meta.initials, 'A: "B" # c');
  assert.deepEqual(parsed.cards.wind, tricky.cards.wind);
});

test('Import-Regel: unbekannte Spalten landen in «Sonstiges»', () => {
  const text = [
    '---', 'retrolos: 1', 'typ: beitrag', 'retro_id: R-2026-11-12-sprint-12', 'format: segelboot', '---',
    '## Wind (treibt uns an)', '- Rückenwind vom PO',
    '## anker', '* Lange Reviews',
    '## Leuchtturm', '- Ein Mentor für Neue',
    '## Sonstiges', '- Kaffee ist alle',
  ].join('\r\n');
  const parsed = md.parseContribution(text, config);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.cards.wind, ['Rückenwind vom PO']);
  assert.deepEqual(parsed.cards.anker, ['Lange Reviews']);
  assert.deepEqual(parsed.other, [{ text: 'Ein Mentor für Neue', origin: 'Leuchtturm' }, { text: 'Kaffee ist alle', origin: '' }]);
  assert.deepEqual(parsed.unknownHeadings, ['Leuchtturm']);
});

test('Import-Regel: unbekanntes Format → alles in «Sonstiges» mit Hinweis', () => {
  const text = '---\nretrolos: 1\ntyp: beitrag\nretro_id: R-1\nformat: gibt-es-nicht-xyz\n---\n## Gestern\n- A\n';
  const parsed = md.parseContribution(text, config);
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.other, [{ text: 'A', origin: 'Gestern' }]);
  assert.match(parsed.warnings.join(' '), /gibt-es-nicht-xyz/);
});

test('Import-Regel: kaputte oder fremde Dateien liefern eine verständliche Meldung statt Absturz', () => {
  const cases = [
    '',
    'Einfach nur Text',
    '# Notizen\n- a',
    '---\nretrolos: 1\ntyp: beitrag\nretro_id: R-1\n', // Kopf nicht geschlossen
    '---\ntitle: Blogpost\n---\nHallo', // fremdes Markdown
    '---\nretrolos: 1\ntyp: beitrag\n---\n## Wind\n- a', // ohne Retro-ID
    '---\nretrolos: 1\ntyp: beitrag\nretro_id: "R-1\n---\n', // Anführungszeichen offen
    '\u0000\u0001binär',
  ];
  for (const text of cases) {
    const parsed = md.parseContribution(text, config);
    assert.equal(parsed.ok, false, JSON.stringify(text));
    assert.ok(parsed.error.length > 15, parsed.error);
  }
  const protocol = md.writeProtocol({ retroId: 'R-1', mood: [], topics: [], actions: [], feedback: {} }).text;
  assert.match(md.parseContribution(protocol, config).error, /Protokoll/);
});

test('Frontmatter: Kommentare, Zahlen, Anführungszeichen', () => {
  const fm = md.parseFrontmatter('﻿---\n# Kommentar\nretrolos: 1\nkuerzel: ""            # freiwillig\nname: \'O\'\'Neil\'\nx: a # b\n---\nRest');
  assert.equal(fm.ok, true);
  assert.deepEqual(fm.data, { retrolos: 1, kuerzel: '', name: "O'Neil", x: 'a' });
  assert.equal(fm.body, 'Rest');
});

const protocolSample = {
  retroId: 'R-2026-11-12-sprint-12',
  sprint: 'Sprint 12',
  format: 'segelboot',
  date: '2026-11-12',
  contributions: 5,
  mood: [{ emoji: '☀️', count: 1 }, { emoji: '⛅', count: 3 }, { emoji: '🌧️', count: 1 }, { emoji: '⛈️', count: 0 }],
  topics: [
    { points: 5, text: 'Zu viele spontane Meetings am Nachmittag', column: 'Anker' },
    { points: 1, text: 'Pair-Programming', column: 'Wind' },
    { points: 3, text: 'Ohne Spalte', column: '' },
  ],
  actions: [
    { what: 'Fokuszeit 13–16 Uhr ohne Meetings', who: 'SM', due: '2026-11-26', status: 'offen' },
    { what: 'Review-Regel: max. 1 Tag | dann eskalieren', who: 'Dev-Team', due: '2026-11-19', status: 'offen' },
  ],
  review: [{ what: 'Daily auf 15 Minuten begrenzen', who: 'SM', due: '2026-11-12', status: 'teilweise' }],
  feedback: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 2 },
};

test('Protokoll: Schreiben und wieder Lesen ergibt dieselben Daten', () => {
  const { filename, text } = md.writeProtocol(protocolSample);
  assert.equal(filename, 'retro-R-2026-11-12-sprint-12-protokoll.md');
  const p = md.parseProtocol(text);
  assert.equal(p.ok, true, p.error);
  assert.deepEqual(p.meta, { version: 1, retroId: protocolSample.retroId, sprint: 'Sprint 12', format: 'segelboot', date: '2026-11-12', contributions: 5 });
  assert.deepEqual(p.mood, protocolSample.mood);
  assert.deepEqual(p.topics, protocolSample.topics);
  assert.deepEqual(p.actions, protocolSample.actions);
  assert.deepEqual(p.review, protocolSample.review);
  assert.deepEqual(p.feedback, protocolSample.feedback);
});

test('Protokoll: Abschnitte und offene Massnahmen', () => {
  const { text } = md.writeProtocol(protocolSample);
  for (const h of ['## Stimmung', '## Top-Themen', '## Massnahmen', '## Feedback zur Retro']) assert.ok(text.includes(h), h);
  assert.match(text, /\| Was \| Wer \| Bis wann \| Status \|/);
  assert.match(text, /- \(1 Punkt\) Pair-Programming _\(Wind\)_/);
  const p = md.parseProtocol(text);
  assert.equal(md.openActions(p).length, 2);
  assert.equal(md.openActions({ actions: [{ status: 'erledigt' }, { status: 'offen' }] }).length, 1);
});

test('Dateityp erkennen und Inhalts-Hash', () => {
  assert.equal(md.detectType(md.writeContribution(sample, config).text), 'beitrag');
  assert.equal(md.detectType(md.writeProtocol(protocolSample).text), 'protokoll');
  assert.equal(md.detectType('# nur Text'), null);
  const a = md.writeContribution(sample, config).text;
  assert.equal(md.contentHash(a), md.contentHash(a.replace(/\n/g, '\r\n')));
  assert.notEqual(md.contentHash(a), md.contentHash(a + 'x'));
  assert.match(md.contentHash(''), /^[0-9a-f]{8}$/);
  assert.match(md.randomSuffix(), /^[a-z2-9]{4}$/);
});

test('Beispieldateien in docs/beispiele/ sind gültig', () => {
  const dir = path.join(__dirname, '..', 'docs', 'beispiele');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f.startsWith('retro-'));
  assert.ok(files.length >= 5, 'mindestens 4 Beiträge und 1 Protokoll');
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    assert.match(text, /Fiktives Beispiel/, `${f} ist als Beispiel markiert`);
    const type = md.detectType(text);
    const parsed = type === 'protokoll' ? md.parseProtocol(text) : md.parseContribution(text, config);
    assert.equal(parsed.ok, true, `${f}: ${parsed.error}`);
  }
});
