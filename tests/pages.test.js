'use strict';
// Prüft die HTML-Seiten statisch: Script-Reihenfolge, CSP, keine Inline-
// Scripts/-Styles, nur relative Pfade, alle lokalen Dateien vorhanden.
// Ohne ES-Module fällt ein fehlendes <script> sonst erst im Browser auf.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
const MODULE_FILES = {
  retro: 'core-retro.js',
  privacy: 'core-privacy.js',
  ui: 'ui.js',
  effects: 'effects.js',
};

// Welche RetroLos-Module nutzt eine Script-Datei?
function usedModules(js) {
  const used = new Set();
  const destructure = /const\s*\{([^}]*)\}\s*=\s*(?:app|window\.RetroLos|RetroLos)\b/g;
  let m;
  while ((m = destructure.exec(js))) {
    m[1].split(',').map((p) => p.split(':')[0].trim()).filter(Boolean).forEach((k) => used.add(k));
  }
  const access = /\b(?:app|RetroLos)\.(\w+)/g;
  while ((m = access.exec(js))) used.add(m[1]);
  return [...used].filter((k) => MODULE_FILES[k]);
}

for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)];

  test(`${page}: CSP, keine Inline-Scripts oder -Styles`, () => {
    assert.match(html, /<meta http-equiv="Content-Security-Policy" content="default-src 'self';/);
    scripts.forEach(([, attrs, body]) => {
      assert.match(attrs, /\bsrc="[^"]+"/, 'Inline-Script');
      assert.match(attrs, /\bdefer\b/, 'Script ohne defer');
      assert.doesNotMatch(attrs, /type="module"/);
      assert.equal(body.trim(), '');
    });
    assert.doesNotMatch(html, /\sstyle="/, 'Inline-Style');
    assert.doesNotMatch(html, /<style\b/, '<style>-Block');
    assert.doesNotMatch(html, /\son[a-z]+="/, 'Inline-Eventhandler');
  });

  test(`${page}: nur relative Pfade und alle lokalen Dateien vorhanden`, () => {
    for (const [, raw] of html.matchAll(/\b(?:href|src)="([^"#]+)/g)) {
      const url = raw.split('?')[0];
      if (/^https:\/\/github\.com\//.test(url)) continue; // Link zum Quellcode (Navigation, keine Anfrage)
      assert.doesNotMatch(url, /^(\/|https?:|\/\/)/, `${url} ist nicht relativ`);
      assert.ok(fs.existsSync(path.join(root, url)), `${url} fehlt`);
    }
  });

  test(`${page}: jedes Script findet seine Module (richtige Reihenfolge)`, () => {
    const files = scripts.map(([, attrs]) => /src="([^"?]+)/.exec(attrs)[1]);
    files.forEach((file, i) => {
      const js = fs.readFileSync(path.join(root, file), 'utf8');
      usedModules(js).forEach((mod) => {
        const needed = MODULE_FILES[mod];
        if (needed === file) return;
        const at = files.indexOf(needed);
        assert.ok(at >= 0, `${file} nutzt RetroLos.${mod}, aber ${page} lädt ${needed} nicht`);
        assert.ok(at < i, `${needed} muss in ${page} vor ${file} stehen`);
      });
    });
  });

  test(`${page}: Banner, eine h1, Sprache de-CH`, () => {
    assert.match(html, /<html lang="de-CH">/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /Hackathon-Prototyp<\/strong> – keine Kunden- oder Personendaten eingeben\./);
    assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g, ''), /ß/);
  });
}

test('index.html: Auswahlfeld enthält alle Formate (funktioniert auch bei altem Script im Cache)', () => {
  const R = require('../core-retro.js');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const keys = [...html.matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(keys, R.FORMATS.map((f) => f.key));
});

test('index.html: alle eigenen Scripts und Styles tragen dieselbe Versionsnummer', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const versions = [...html.matchAll(/(?:href|src)="[^"]+\.(?:js|css)\?v=(\d+)"/g)].map((m) => m[1]);
  assert.ok(versions.length >= 6);
  assert.equal(new Set(versions).size, 1);
});
