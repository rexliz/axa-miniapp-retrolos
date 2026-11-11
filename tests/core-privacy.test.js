'use strict';
// Datenschutz-Wächter: Treffer und Nicht-Treffer
const test = require('node:test');
const assert = require('node:assert/strict');
const privacy = require('../core-privacy.js');

const types = (text) => privacy.check(text).map((h) => h.type);

test('Treffer: E-Mail, Telefon, IBAN, AHV, lange Nummern', () => {
  assert.deepEqual(types('Bitte an max.muster@example.ch schreiben'), ['email']);
  assert.deepEqual(types('Kunde hat angerufen (079 123 45 67)'), ['phone']);
  assert.deepEqual(types('Rückruf unter +41 79 123 45 67'), ['phone']);
  assert.deepEqual(types('Tel. 044/123.45.67'), ['phone']);
  assert.deepEqual(types('Zahlung auf CH93 0076 2011 6238 5295 7'), ['iban']);
  assert.deepEqual(types('IBAN CH9300762011623852957'), ['iban']);
  assert.deepEqual(types('AHV 756.1234.5678.97 fehlt'), ['ahv']);
  assert.deepEqual(types('Police 12345678 war falsch erfasst'), ['number']);
  assert.deepEqual(types('Schadenfall 2026-445-221-9 hängt'), ['number']);
  assert.deepEqual(types('Schaden-Nr. 1234567'), ['number']);
});

test('Nicht-Treffer: normale Retro-Karten', () => {
  for (const text of [
    'Zu viele spontane Meetings am Nachmittag',
    'Der neue Build läuft in 4 statt 12 Minuten',
    'Release 2.0 bis 26.11.2026',
    'Retro am 2026-11-12 um 14:00',
    'Sprint 12, Story 345 ist fertig',
    'Wir hatten 3 von 5 Reviews in 2 Tagen',
    'Version 1.2.3 ausgerollt',
    'Kaffee @ Team-Event war super',
    '',
  ]) {
    assert.deepEqual(privacy.check(text), [], text);
  }
});

test('Hinweistext nennt die Art des Treffers', () => {
  const msg = privacy.describe(privacy.check('mail an a@b.ch oder 079 123 45 67'));
  assert.match(msg, /^Sieht nach Kunden- oder Personendaten aus\. Bitte nur über die Zusammenarbeit schreiben, ohne Namen und Nummern\./);
  assert.match(msg, /E-Mail-Adresse/);
  assert.match(msg, /Telefonnummer/);
  assert.equal(privacy.describe([]), '');
});
