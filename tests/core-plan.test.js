'use strict';
// Tests für core-plan.js – ausführen mit: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const config = require('../config.js');
const plan = require('../core-plan.js');

test('Agenda: Summe ergibt immer die Gesamtzeit, alles in 5-Minuten-Schritten', () => {
  for (const total of [30, 45, 60, 90, 75, 120]) {
    const agenda = plan.computeAgenda(total, config.phases);
    assert.equal(agenda.length, 5);
    assert.equal(plan.sumMinutes(agenda), total, `Summe bei ${total} Minuten`);
    for (const row of agenda) {
      assert.equal(row.minutes % 5, 0, `${row.name} ist auf 5 Minuten gerundet`);
      assert.ok(row.minutes >= 5, `${row.name} hat mindestens 5 Minuten`);
    }
  }
});

test('Agenda: Richtwerte 10/30/25/25/10 % bei 60 und 90 Minuten', () => {
  assert.deepEqual(plan.computeAgenda(60, config.phases).map((r) => r.minutes), [5, 20, 15, 15, 5]);
  assert.deepEqual(plan.computeAgenda(90, config.phases).map((r) => r.minutes), [10, 25, 25, 20, 10]);
  assert.deepEqual(plan.computeAgenda(45, config.phases).map((r) => r.minutes), [5, 15, 10, 10, 5]);
  assert.deepEqual(plan.computeAgenda(30, config.phases).map((r) => r.minutes), [5, 10, 5, 5, 5]);
});

test('Agenda: ungerade Eingaben werden auf 5 Minuten gerundet, Minimum 25 Minuten', () => {
  assert.equal(plan.sumMinutes(plan.computeAgenda(62, config.phases)), 60);
  assert.equal(plan.sumMinutes(plan.computeAgenda(10, config.phases)), 25);
});

test('Agenda: Uhrzeiten ab Startzeit', () => {
  const timed = plan.addTimes(plan.computeAgenda(60, config.phases), '14:00');
  assert.equal(timed[0].from, '14:00');
  assert.equal(timed[0].to, '14:05');
  assert.equal(timed[4].to, '15:00');
  assert.equal(plan.addTimes(timed, '')[0].from, '');
});

test('Empfehlung: Startzuordnung aus der Konfiguration', () => {
  assert.equal(plan.recommendFormat({ mood: 'stressig' }, config).format.key, 'mad-sad-glad');
  assert.equal(plan.recommendFormat({ mood: 'normal' }, config).format.key, '4l');
  assert.equal(plan.recommendFormat({ mood: 'super' }, config).format.key, 'seestern');
  assert.equal(plan.recommendFormat({ mood: 'neues-team' }, config).format.key, 'start-stop-continue');
});

test('Empfehlung: Fokus und Abwechslung', () => {
  const tempo = plan.recommendFormat({ mood: 'stressig', focus: 'tempo' }, config);
  assert.equal(tempo.format.key, 'segelboot');
  assert.match(tempo.reason, /Tempo|bremst/);
  const repeat = plan.recommendFormat({ mood: 'stressig', lastFormat: 'mad-sad-glad' }, config);
  assert.equal(repeat.format.key, 'segelboot');
  assert.equal(repeat.avoided.key, 'mad-sad-glad');
  // Nur ein Kandidat: dann wird auch wiederholt
  assert.equal(plan.recommendFormat({ mood: 'neues-team', lastFormat: 'start-stop-continue' }, config).format.key, 'start-stop-continue');
});

test('Empfehlung: Begründung ist genau ein Satz mit dem Formatnamen', () => {
  for (const mood of config.moods) {
    const { format, reason } = plan.recommendFormat({ mood: mood.key }, config);
    assert.ok(reason.includes(format.name));
    assert.equal(reason.match(/[.!?](\s|$)/g).length, 1, reason);
  }
});

test('Überrasch mich: liefert ein anderes Format als das aktuelle', () => {
  for (let i = 0; i < 50; i++) {
    const f = plan.randomFormat(config, 'segelboot');
    assert.notEqual(f.key, 'segelboot');
  }
  assert.equal(plan.randomFormat(config, 'x', () => 0).key, config.formats[0].key);
  assert.equal(plan.randomFormat(config, 'x', () => 0.9999).key, config.formats.at(-1).key);
});

test('Retro-ID aus Datum und Sprint', () => {
  assert.equal(plan.makeRetroId('2026-11-12', 'Sprint 12'), 'R-2026-11-12-sprint-12');
  assert.equal(plan.makeRetroId('2026-11-12', '12'), 'R-2026-11-12-sprint-12');
  assert.equal(plan.makeRetroId('2026-11-12', 'Größte Änderung ü'), 'R-2026-11-12-groesste-aenderung-ue');
  assert.equal(plan.makeRetroId('2026-11-12', ''), 'R-2026-11-12');
});

test('Einladungslink: Kodieren und Dekodieren ergibt dieselben Daten', () => {
  const invite = {
    retroId: 'R-2026-11-12-sprint-12',
    sprint: 'Sprint 12 – «Zürich» 🚀',
    format: 'segelboot',
    date: '2026-11-12',
    deadline: '2026-11-11T17:00',
  };
  const decoded = plan.decodeInvite(plan.encodeInvite(invite));
  assert.equal(decoded.ok, true);
  assert.deepEqual(decoded.invite, invite);
});

test('Einladungslink: vollständige URL und Hash', () => {
  const invite = { retroId: 'R-2026-11-12-x', sprint: 'X', format: '4l', date: '', deadline: '' };
  const url = plan.buildInviteUrl('https://example.github.io/repo/planen.html?x=1#alt', invite);
  assert.match(url, /^https:\/\/example\.github\.io\/repo\/teilnehmen\.html#einladung=[A-Za-z0-9_-]+$/);
  const result = plan.inviteFromHash(new URL(url).hash);
  assert.deepEqual(result.invite, invite);
  const local = plan.buildInviteUrl('file:///Users/a/retro/planen.html', invite);
  assert.match(local, /^file:\/\/\/Users\/a\/retro\/teilnehmen\.html#einladung=/);
});

test('Einladungslink: kaputte Links liefern eine verständliche Meldung', () => {
  assert.equal(plan.inviteFromHash(''), null);
  assert.equal(plan.inviteFromHash('#etwas-anderes'), null);
  for (const bad of ['%%%', 'abc', plan.encodeInvite({ retroId: 'falsch', format: '4l' })]) {
    const r = plan.decodeInvite(bad);
    assert.equal(r.ok, false);
    assert.ok(r.error.length > 10);
  }
  const otherVersion = Buffer.from(JSON.stringify({ v: 99, id: 'R-1', f: '4l' })).toString('base64url');
  assert.match(plan.decodeInvite(otherVersion).error, /Version/);
});

test('Datum im Schweizer Format', () => {
  assert.equal(plan.formatDate('2026-11-12'), 'Do, 12.11.2026');
  assert.equal(plan.formatDate('2026-11-12', { long: true }), 'Donnerstag, 12.11.2026');
  assert.equal(plan.formatDateTime('2026-11-11T17:00'), 'Mi, 11.11.2026, 17:00 Uhr');
  assert.equal(plan.formatDate(''), '');
});

test('Einladungstext enthält Abgabetermin, Link und Datenschutz-Hinweis', () => {
  const text = plan.inviteText(
    { sprint: 'Sprint 12', date: '2026-11-12', deadline: '2026-11-11T17:00', formatName: 'Segelboot' },
    'https://x.test/teilnehmen.html#einladung=abc'
  );
  assert.match(text, /Bitte bis Mi, 11\.11\.2026, 17:00 Uhr deine Karten über diesen Link abgeben:/);
  assert.match(text, /https:\/\/x\.test\/teilnehmen\.html#einladung=abc/);
  assert.match(text, /keine Kunden- oder Personendaten/);
  assert.doesNotMatch(text, /ß/);
});

test('Agenda als Text', () => {
  const agenda = plan.computeAgenda(60, config.phases);
  const text = plan.agendaText({ sprint: 'Sprint 12', date: '2026-11-12', start: '14:00' }, agenda,
    plan.findFormat(config, 'segelboot'), 'Beschreibe den Sprint in einem Emoji.');
  assert.match(text, /Retro «Sprint 12» – Donnerstag, 12\.11\.2026, 14:00 Uhr \(60 Min\.\)/);
  assert.match(text, /Format: Segelboot – Wind · Anker · Felsen · Insel/);
  assert.match(text, /5\. Abschliessen – 5 Min\. \(14:55–15:00\)/);
});
