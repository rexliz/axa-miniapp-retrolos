/* ==========================================================================
   RetroLos! – Markdown lesen und schreiben (ohne DOM, ohne Bibliothek)
   Eigener, bewusst kleiner Frontmatter-Parser für das RetroLos!-Dateiformat.
   Spezifikation: docs/dateiformat.md
   ========================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.RetroLos = root.RetroLos || {};
    root.RetroLos.markdown = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const FORMAT_VERSION = 1;
  const SUFFIX_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

  /* ---------- Hilfen ---------- */

  function normalizeNewlines(text) {
    return String(text === null || text === undefined ? '' : text)
      .replace(/^﻿/, '')
      .replace(/\r\n?/g, '\n');
  }

  // Kartentext vereinheitlichen: Ränder weg, keine Leerzeilen innerhalb.
  function cleanText(text) {
    return normalizeNewlines(text)
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');
  }

  // Für den Vergleich von Überschriften und Spaltennamen.
  function normKey(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '');
  }

  function findFormat(config, key) {
    return (config && config.formats || []).find((f) => f.key === key) || null;
  }

  // FNV-1a (32 Bit) über den normalisierten Inhalt – erkennt doppelte Dateien.
  function contentHash(text) {
    const src = normalizeNewlines(text).trim();
    let hash = 0x811c9dc5;
    for (let i = 0; i < src.length; i++) {
      hash ^= src.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function randomSuffix(rand) {
    const r = typeof rand === 'function' ? rand : Math.random;
    let out = '';
    for (let i = 0; i < 4; i++) out += SUFFIX_CHARS[Math.floor(r() * SUFFIX_CHARS.length) % SUFFIX_CHARS.length];
    return out;
  }

  function safeId(retroId) {
    return String(retroId || 'retro').replace(/[^A-Za-z0-9-]+/g, '-');
  }

  function fileNameFor(retroId, kind, suffix) {
    return kind === 'protokoll'
      ? 'retro-' + safeId(retroId) + '-protokoll.md'
      : 'retro-' + safeId(retroId) + '-beitrag-' + (suffix || randomSuffix()) + '.md';
  }

  /* ---------- Frontmatter ---------- */

  function parseScalar(raw) {
    let v = raw.trim();
    if (v.startsWith('"')) {
      let i = 1;
      let escaped = false;
      for (; i < v.length; i++) {
        const c = v[i];
        if (escaped) { escaped = false; continue; }
        if (c === '\\') { escaped = true; continue; }
        if (c === '"') break;
      }
      if (i >= v.length) throw new Error('Anführungszeichen nicht geschlossen');
      return JSON.parse(v.slice(0, i + 1));
    }
    if (v.startsWith("'")) {
      let out = '';
      let i = 1;
      for (; i < v.length; i++) {
        if (v[i] === "'") {
          if (v[i + 1] === "'") { out += "'"; i++; continue; }
          break;
        }
        out += v[i];
      }
      if (i >= v.length) throw new Error('Anführungszeichen nicht geschlossen');
      return out;
    }
    const comment = v.search(/(^|\s)#/);
    if (comment >= 0) v = v.slice(0, comment).trim();
    if (/^-?\d+$/.test(v)) return Number(v);
    return v;
  }

  function formatScalar(value, forceQuote) {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    const s = String(value === null || value === undefined ? '' : value);
    const plain = !forceQuote
      && /^[A-Za-z0-9][\w.:/+-]*$/.test(s)
      && !/^-?\d+(\.\d+)?$/.test(s)
      && !/^(true|false|null|yes|no|on|off)$/i.test(s);
    return plain ? s : JSON.stringify(s);
  }

  // Liest den Kopfbereich zwischen den beiden «---»-Zeilen.
  function parseFrontmatter(text) {
    const lines = normalizeNewlines(text).split('\n');
    let start = 0;
    while (start < lines.length && !lines[start].trim()) start++;
    if (start >= lines.length || lines[start].trim() !== '---') {
      return { ok: false, error: 'Die Datei beginnt nicht mit einem Kopfbereich («---»). Ist es wirklich eine RetroLos!-Datei?' };
    }
    let end = start + 1;
    while (end < lines.length && lines[end].trim() !== '---') end++;
    if (end >= lines.length) {
      return { ok: false, error: 'Der Kopfbereich wird nicht mit «---» abgeschlossen – die Datei ist unvollständig.' };
    }
    const data = {};
    const warnings = [];
    for (const line of lines.slice(start + 1, end)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const m = /^([A-Za-z_][\w-]*)\s*:(.*)$/.exec(trimmed);
      if (!m) {
        warnings.push('Zeile im Kopfbereich nicht verstanden: «' + trimmed.slice(0, 40) + '»');
        continue;
      }
      try {
        data[m[1]] = parseScalar(m[2]);
      } catch (e) {
        return { ok: false, error: 'Im Kopfbereich ist die Angabe «' + m[1] + '» beschädigt (' + e.message + ').' };
      }
    }
    return { ok: true, data, body: lines.slice(end + 1).join('\n'), warnings };
  }

  // entries: [[schlüssel, wert, kommentar?, immerAnführungszeichen?], …]
  function writeFrontmatter(entries) {
    const lines = ['---'];
    entries.forEach(([key, value, comment, quote]) => {
      lines.push(key + ': ' + formatScalar(value, quote) + (comment ? '   # ' + comment : ''));
    });
    lines.push('---');
    return lines.join('\n');
  }

  /* ---------- Abschnitte ---------- */

  // Zerlegt den Text in «## Überschrift»-Abschnitte mit Aufzählungspunkten.
  // Nachsicht beim Lesen: auch «*»/«+», Fliesstext-Zeilen und eingerückte
  // Folgezeilen werden übernommen, damit von Hand bearbeitete Dateien gehen.
  function parseSections(body) {
    const sections = [];
    let current = null;
    let itemOpen = false;
    let blank = false;
    normalizeNewlines(body).split('\n').forEach((line) => {
      const heading = /^(#{2,6})\s+(.*?)\s*#*\s*$/.exec(line);
      if (heading) {
        current = { heading: heading[2].trim(), items: [], lines: [] };
        sections.push(current);
        itemOpen = false;
        blank = false;
        return;
      }
      if (/^#\s/.test(line) || !current) return;
      current.lines.push(line);
      if (!line.trim()) {
        blank = true;
        return;
      }
      if (/^\s*\|/.test(line)) {
        itemOpen = false;
        blank = false;
        return;
      }
      const bullet = /^ {0,3}[-*+]\s+(.*)$/.exec(line) || /^ {0,3}[-*+]$/.exec(line);
      if (bullet) {
        const text = (bullet[1] || '').trim();
        if (text) {
          current.items.push(text);
          itemOpen = true;
        } else {
          itemOpen = false;
        }
      } else if (itemOpen && (/^\s{2,}\S/.test(line) || !blank)) {
        current.items[current.items.length - 1] += '\n' + line.trim();
      } else {
        current.items.push(line.trim());
        itemOpen = true;
      }
      blank = false;
    });
    return sections;
  }

  function bullet(text) {
    const lines = cleanText(text).split('\n');
    return '- ' + lines[0] + lines.slice(1).map((l) => '\n    ' + l).join('');
  }

  // Ordnet Abschnitte den Spalten eines Formats zu (Name oder Schlüssel,
  // Gross-/Kleinschreibung, Umlaute und Klammerzusätze egal).
  // Unbekannte Überschriften landen in «Sonstiges» – es geht nichts verloren.
  function mapSections(sections, format, config) {
    const columns = (format && format.columns) || [];
    const otherKey = normKey(config && config.otherColumn ? config.otherColumn.name : 'Sonstiges');
    const cards = {};
    columns.forEach((c) => { cards[c.key] = []; });
    const other = [];
    const unknownHeadings = [];
    sections.forEach((section) => {
      const key = normKey(section.heading);
      const column = columns.find((c) => normKey(c.name) === key || normKey(c.key) === key);
      const items = section.items.map(cleanText).filter(Boolean);
      if (column) {
        cards[column.key].push(...items);
        return;
      }
      const isOther = key === otherKey;
      if (!isOther && items.length && !unknownHeadings.includes(section.heading)) unknownHeadings.push(section.heading);
      items.forEach((text) => other.push({ text, origin: isOther ? '' : section.heading }));
    });
    return { cards, other, unknownHeadings };
  }

  /* ---------- Beitrag ---------- */

  function writeContribution(data, config) {
    const format = findFormat(config, data.format);
    if (!format) throw new Error('Unbekanntes Format: ' + data.format);
    const parts = [writeFrontmatter([
      ['retrolos', FORMAT_VERSION],
      ['typ', 'beitrag'],
      ['retro_id', data.retroId],
      ['format', format.key],
      ['wetter', data.weather || '', '', true],
      ['kuerzel', data.initials || '', 'freiwillig', true],
      ['erstellt', data.created || ''],
    ])];
    format.columns.forEach((col, i) => {
      if (i > 0) parts.push('');
      parts.push('## ' + col.name);
      ((data.cards && data.cards[col.key]) || []).map(cleanText).filter(Boolean).forEach((t) => parts.push(bullet(t)));
    });
    return { filename: fileNameFor(data.retroId, 'beitrag', data.suffix), text: parts.join('\n') + '\n' };
  }

  function fail(error) {
    return { ok: false, error };
  }

  function checkHeader(fm, expectedType) {
    if (!fm.ok) return fm.error;
    const d = fm.data;
    if (d.retrolos === undefined) return 'Das ist keine RetroLos!-Datei – die Angabe «retrolos:» fehlt im Kopfbereich.';
    if (d.typ !== expectedType) {
      if (d.typ === 'protokoll') return 'Das ist ein Retro-Protokoll, kein Beitrag. Protokolle importierst du beim Planen der nächsten Retro.';
      if (d.typ === 'beitrag') return 'Das ist ein Beitrag, kein Protokoll. Beiträge importierst du auf der Seite «Moderieren».';
      return 'Unbekannter Dateityp «' + (d.typ || '–') + '».';
    }
    if (!d.retro_id) return 'In der Datei fehlt die Retro-ID («retro_id:»).';
    return '';
  }

  function versionWarning(d) {
    return Number(d.retrolos) > FORMAT_VERSION
      ? ['Die Datei stammt aus einer neueren RetroLos!-Version – einzelne Angaben könnten fehlen.']
      : [];
  }

  // targetFormat (optional): Spalten eines anderen Formats, z. B. des Boards.
  function parseContribution(text, config, targetFormat) {
    const fm = parseFrontmatter(text);
    const problem = checkHeader(fm, 'beitrag');
    if (problem) return fail(problem);
    const d = fm.data;
    const warnings = fm.warnings.concat(versionWarning(d));
    const own = findFormat(config, String(d.format || ''));
    const target = targetFormat ? findFormat(config, targetFormat) : null;
    const format = target || own;
    if (target && own && target.key !== own.key) {
      warnings.push('Die Datei nutzt das Format «' + own.name + '», das Board «' + target.name + '» – die Karten wurden nach Spaltennamen zugeordnet.');
    } else if (!format) {
      warnings.push('Das Format «' + (d.format || '–') + '» kennt diese App nicht – die Karten landen in «Sonstiges».');
    }
    const mapped = mapSections(parseSections(fm.body), format, config);
    const weather = String(d.wetter || '');
    const cardCount = Object.values(mapped.cards).reduce((s, list) => s + list.length, 0) + mapped.other.length;
    if (!cardCount) warnings.push('Die Datei enthält keine Karten.');
    return {
      ok: true,
      kind: 'beitrag',
      meta: {
        version: Number(d.retrolos) || 0,
        retroId: String(d.retro_id),
        format: String(d.format || ''),
        weather: weather.length <= 8 ? weather : '',
        initials: String(d.kuerzel || '').slice(0, 12),
        created: String(d.erstellt || ''),
      },
      cards: mapped.cards,
      other: mapped.other,
      unknownHeadings: mapped.unknownHeadings,
      cardCount,
      warnings,
    };
  }

  /* ---------- Protokoll ---------- */

  const cell = (text) => cleanText(text).replace(/\n/g, ' ').replace(/\|/g, '\\|');

  function table(header, rows) {
    return ['| ' + header.join(' | ') + ' |', '|' + header.map(() => '---').join('|') + '|']
      .concat(rows.map((r) => '| ' + r.map(cell).join(' | ') + ' |'))
      .join('\n');
  }

  function parseTable(lines) {
    const rows = lines
      .filter((l) => /^\s*\|/.test(l))
      .filter((l) => !/^\s*\|(\s*:?-{3,}:?\s*\|)+\s*$/.test(l))
      .map((l) => {
        const cells = l.trim().replace(/^\|/, '').replace(/(?<!\\)\|\s*$/, '').split(/(?<!\\)\|/);
        return cells.map((c) => c.trim().replace(/\\\|/g, '|'));
      });
    return rows.slice(1); // erste Zeile = Spaltenköpfe
  }

  const pointsLabel = (n) => n + (n === 1 ? ' Punkt' : ' Punkte');

  function writeProtocol(data) {
    const parts = [writeFrontmatter([
      ['retrolos', FORMAT_VERSION],
      ['typ', 'protokoll'],
      ['retro_id', data.retroId],
      ['sprint', data.sprint || '', '', true],
      ['format', data.format || ''],
      ['datum', data.date || ''],
      ['beitraege', Number(data.contributions) || 0],
    ])];
    parts.push('# Retro-Protokoll «' + (data.sprint || data.retroId) + '»');
    parts.push('');
    if (data.summary) {
      parts.push(cleanText(data.summary));
      parts.push('');
    }
    parts.push('## Stimmung');
    (data.mood || []).forEach((m) => parts.push('- ' + m.emoji + ' ' + (Number(m.count) || 0)));
    parts.push('');
    parts.push('## Top-Themen');
    (data.topics || []).forEach((t) => {
      parts.push('- (' + pointsLabel(Number(t.points) || 0) + ') ' + cleanText(t.text).replace(/\n/g, ' / ')
        + (t.column ? ' _(' + t.column + ')_' : ''));
    });
    parts.push('');
    parts.push('## Massnahmen');
    parts.push(table(['Was', 'Wer', 'Bis wann', 'Status'],
      (data.actions || []).map((a) => [a.what, a.who, a.due, a.status || 'offen'])));
    if (data.review && data.review.length) {
      parts.push('');
      parts.push('## Rückblick auf die letzten Massnahmen');
      parts.push(table(['Was', 'Wer', 'Bis wann', 'Status'],
        data.review.map((a) => [a.what, a.who, a.due, a.status])));
    }
    parts.push('');
    parts.push('## Feedback zur Retro');
    [5, 4, 3, 2, 1].forEach((n) => parts.push('- ' + n + ' von 5: ' + (Number((data.feedback || {})[n]) || 0)));
    return { filename: fileNameFor(data.retroId, 'protokoll'), text: parts.join('\n') + '\n' };
  }

  function parseProtocol(text) {
    const fm = parseFrontmatter(text);
    const problem = checkHeader(fm, 'protokoll');
    if (problem) return fail(problem);
    const d = fm.data;
    const result = {
      ok: true,
      kind: 'protokoll',
      meta: {
        version: Number(d.retrolos) || 0,
        retroId: String(d.retro_id),
        sprint: String(d.sprint || ''),
        format: String(d.format || ''),
        date: String(d.datum || ''),
        contributions: Number(d.beitraege) || 0,
      },
      mood: [],
      topics: [],
      actions: [],
      review: [],
      feedback: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      warnings: fm.warnings.concat(versionWarning(d)),
    };
    const toAction = (r) => ({ what: r[0] || '', who: r[1] || '', due: r[2] || '', status: (r[3] || 'offen').toLowerCase() });
    parseSections(fm.body).forEach((section) => {
      const key = normKey(section.heading);
      if (key === 'stimmung') {
        section.items.forEach((item) => {
          const m = /^(\S+)\s+(\d+)/.exec(item);
          if (m) result.mood.push({ emoji: m[1], count: Number(m[2]) });
        });
      } else if (key === 'topthemen') {
        section.items.forEach((item) => {
          const m = /^\((\d+)\s+Punkte?\)\s+([\s\S]*?)(?:\s+_\(([^)]*)\)_)?$/.exec(item.replace(/\n/g, ' '));
          if (m) result.topics.push({ points: Number(m[1]), text: m[2], column: m[3] || '' });
          else result.topics.push({ points: 0, text: item, column: '' });
        });
      } else if (key === 'massnahmen') {
        result.actions = parseTable(section.lines).map(toAction).filter((a) => a.what);
      } else if (key.startsWith('rueckblick')) {
        result.review = parseTable(section.lines).map(toAction).filter((a) => a.what);
      } else if (key.startsWith('feedback')) {
        section.items.forEach((item) => {
          const m = /^([1-5])\s+von\s+5:\s*(\d+)/.exec(item);
          if (m) result.feedback[m[1]] = Number(m[2]);
        });
      }
    });
    return result;
  }

  // Massnahmen, die bei der nächsten Retro noch einmal angeschaut werden.
  function openActions(protocol) {
    const done = ['erledigt', 'umgesetzt', 'ja', 'verworfen'];
    return (protocol.actions || []).filter((a) => !done.includes(a.status));
  }

  // Erkennt den Typ einer Datei, ohne sie ganz zu prüfen.
  function detectType(text) {
    const fm = parseFrontmatter(text);
    if (!fm.ok || fm.data.retrolos === undefined) return null;
    return fm.data.typ === 'beitrag' || fm.data.typ === 'protokoll' ? fm.data.typ : null;
  }

  return {
    FORMAT_VERSION,
    normalizeNewlines,
    cleanText,
    normKey,
    contentHash,
    randomSuffix,
    fileNameFor,
    parseFrontmatter,
    writeFrontmatter,
    parseSections,
    mapSections,
    writeContribution,
    parseContribution,
    writeProtocol,
    parseProtocol,
    openActions,
    detectType,
  };
});
