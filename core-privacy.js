/* ==========================================================================
   RetroLos! – Datenschutz-Wächter (ohne DOM)
   Einfache Muster für Daten, die nicht in eine Retro gehören. Das ist ein
   freundlicher Hinweis, KEIN vollständiger Schutz: Namen oder umschriebene
   Kundendaten erkennt er nicht.
   ========================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.RetroLos = root.RetroLos || {};
    root.RetroLos.privacy = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MESSAGE = 'Sieht nach Kunden- oder Personendaten aus. Bitte nur über die Zusammenarbeit schreiben, ohne Namen und Nummern.';

  const DATE_LIKE = /^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})$/;

  const RULES = [
    { type: 'email', label: 'E-Mail-Adresse', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g },
    { type: 'ahv', label: 'AHV-Nummer', re: /\b756[.\s]?\d{4}[.\s]?\d{4}[.\s]?\d{2}\b/g },
    { type: 'iban', label: 'IBAN', re: /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}(?:\s?[A-Z0-9]{1,3})?\b/g },
    { type: 'phone', label: 'Telefonnummer', re: /(?:\+|\b00)\d{2}[\s./-]?\(?0?\)?\d{2,3}[\s./-]?\d{3}[\s./-]?\d{2}[\s./-]?\d{2}\b|\b0\d{2}[\s./-]?\d{3}[\s./-]?\d{2}[\s./-]?\d{2}\b/g },
    {
      type: 'number',
      label: 'lange Nummer (z. B. Police oder Schadenfall)',
      re: /\d[\d.\s/-]{4,}\d/g,
      // ≥ 6 Ziffern am Stück oder ≥ 8 Ziffern mit Trennzeichen; Daten zählen nicht
      accept: (m) => {
        const trimmed = m.trim();
        if (DATE_LIKE.test(trimmed)) return false;
        if (/\d{6,}/.test(trimmed)) return true;
        return trimmed.replace(/\D/g, '').length >= 8 && !/\s\d{1,2}$/.test(trimmed) && !/\s/.test(trimmed);
      },
    },
  ];

  // Liefert alle Treffer: [{ type, label, match }]. Leeres Array = unauffällig.
  function check(text) {
    const src = String(text || '');
    if (!src.trim()) return [];
    const found = [];
    let rest = src;
    RULES.forEach((rule) => {
      rule.re.lastIndex = 0;
      rest = rest.replace(rule.re, (m) => {
        if (rule.accept && !rule.accept(m)) return m;
        found.push({ type: rule.type, label: rule.label, match: m });
        return ' '.repeat(m.length); // nicht doppelt als «lange Nummer» melden
      });
    });
    return found;
  }

  function describe(hits) {
    if (!hits || !hits.length) return '';
    const labels = [...new Set(hits.map((h) => h.label))];
    return MESSAGE + ' (Erkannt: ' + labels.join(', ') + '.)';
  }

  return { MESSAGE, check, describe };
});
