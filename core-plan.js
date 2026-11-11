/* ==========================================================================
   RetroLos! – Planungslogik (ohne DOM)
   Agenda, Format-Empfehlung, Retro-ID, Einladungslink und Texte.
   Läuft im Browser (RetroLos.plan) und in Node (require) für die Tests.
   ========================================================================== */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.RetroLos = root.RetroLos || {};
    root.RetroLos.plan = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const STEP = 5;
  const INVITE_VERSION = 1;
  const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  const WEEKDAYS_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

  const pad = (n) => String(n).padStart(2, '0');
  const str = (v) => (typeof v === 'string' ? v : '');

  /* ---------- Agenda ---------- */

  // Verteilt die Gesamtzeit nach den Anteilen der Phasen, gerundet auf 5 Minuten.
  // Die Summe ergibt immer die Gesamtzeit, jede Phase hat mindestens 5 Minuten
  // (Verfahren der grössten Reste auf 5-Minuten-Einheiten).
  function computeAgenda(totalMinutes, phases) {
    const minTotal = STEP * phases.length;
    const total = Math.max(minTotal, Math.round((Number(totalMinutes) || 0) / STEP) * STEP);
    const units = total / STEP;
    const shareSum = phases.reduce((sum, p) => sum + p.share, 0) || 1;
    const rows = phases.map((p, index) => {
      const exact = Math.round(((units * p.share) / shareSum) * 1e9) / 1e9;
      return { index, exact, units: Math.floor(exact) };
    });
    let rest = units - rows.reduce((sum, r) => sum + r.units, 0);
    const byRemainder = [...rows].sort(
      (a, b) => (b.exact - b.units) - (a.exact - a.units) || a.index - b.index
    );
    for (let i = 0; rest > 0; i = (i + 1) % byRemainder.length) {
      byRemainder[i].units += 1;
      rest -= 1;
    }
    rows.forEach((row) => {
      while (row.units < 1) {
        const donor = rows.reduce((max, r) => (r.units > max.units ? r : max));
        donor.units -= 1;
        row.units += 1;
      }
    });
    return phases.map((p, i) => ({ key: p.key, name: p.name, minutes: rows[i].units * STEP }));
  }

  function sumMinutes(agenda) {
    return agenda.reduce((sum, row) => sum + (Number(row.minutes) || 0), 0);
  }

  function hhmm(totalMinutes) {
    const h = Math.floor(totalMinutes / 60) % 24;
    return pad(h) + ':' + pad(totalMinutes % 60);
  }

  // Ergänzt Uhrzeiten «von–bis», falls eine Startzeit (HH:MM) bekannt ist.
  function addTimes(agenda, start) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(start || '');
    if (!m) return agenda.map((row) => Object.assign({}, row, { from: '', to: '' }));
    let t = Number(m[1]) * 60 + Number(m[2]);
    return agenda.map((row) => {
      const from = t;
      t += Number(row.minutes) || 0;
      return Object.assign({}, row, { from: hhmm(from), to: hhmm(t) });
    });
  }

  /* ---------- Formate ---------- */

  function findFormat(config, key) {
    return config.formats.find((f) => f.key === key) || null;
  }

  // Empfiehlt ein Format zur Teamstimmung, bevorzugt eines zum Fokus und
  // wiederholt das zuletzt genutzte Format nur, wenn es keine Alternative gibt.
  function recommendFormat(input, config) {
    const opts = input || {};
    const mood = config.moods.find((m) => m.key === opts.mood) || config.moods[0];
    let candidates = mood.formats.map((k) => findFormat(config, k)).filter(Boolean);
    if (!candidates.length) candidates = [config.formats[0]];
    const fresh = candidates.filter((f) => f.key !== opts.lastFormat);
    const pool = fresh.length ? fresh : candidates;
    const focus = config.focuses.find((f) => f.key === opts.focus) || null;
    const byFocus = focus ? pool.find((f) => (f.focus || []).includes(focus.key)) : null;
    const format = byFocus || pool[0];
    let reason = mood.reason.replace('{format}', format.name);
    if (byFocus) reason += ' – und es lenkt den Blick auf ' + focus.phrase;
    reason += '.';
    const avoided = fresh.length > 0 && fresh.length < candidates.length ? findFormat(config, opts.lastFormat) : null;
    return { format, reason, avoided };
  }

  function pickRandom(list, rand) {
    const r = typeof rand === 'function' ? rand() : Math.random();
    return list[Math.min(list.length - 1, Math.floor(r * list.length))];
  }

  function randomFormat(config, excludeKey, rand) {
    const pool = config.formats.filter((f) => f.key !== excludeKey);
    return pickRandom(pool.length ? pool : config.formats, rand);
  }

  function randomQuestion(config, exclude, rand) {
    const pool = config.checkinQuestions.filter((q) => q !== exclude);
    return pickRandom(pool.length ? pool : config.checkinQuestions, rand);
  }

  /* ---------- Retro-ID ---------- */

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40)
      .replace(/-+$/, '');
  }

  function todayIso(now) {
    const d = now || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function makeRetroId(dateIso, sprint) {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateIso || '') ? dateIso : todayIso();
    let slug = slugify(sprint);
    if (/^\d+$/.test(slug)) slug = 'sprint-' + slug;
    return 'R-' + date + (slug ? '-' + slug : '');
  }

  /* ---------- Einladungslink ---------- */

  function toBase64Url(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function fromBase64Url(code) {
    let b64 = code.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  }

  // Kurze Schlüssel halten den Link kurz. Enthält keine Personendaten.
  function encodeInvite(invite) {
    return toBase64Url(JSON.stringify({
      v: INVITE_VERSION,
      id: invite.retroId,
      s: invite.sprint || '',
      f: invite.format,
      d: invite.date || '',
      a: invite.deadline || '',
    }));
  }

  function decodeInvite(code) {
    let data;
    try {
      data = JSON.parse(fromBase64Url(String(code || '').trim()));
    } catch (e) {
      return { ok: false, error: 'Der Einladungslink ist unvollständig oder beschädigt. Kopiere ihn bitte nochmals ganz.' };
    }
    if (!data || typeof data !== 'object') {
      return { ok: false, error: 'Der Einladungslink ist unvollständig oder beschädigt. Kopiere ihn bitte nochmals ganz.' };
    }
    if (data.v !== INVITE_VERSION) {
      return { ok: false, error: 'Dieser Einladungslink stammt aus einer anderen Version von RetroLos!. Bitte deinen Scrum Master um einen neuen Link.' };
    }
    if (typeof data.id !== 'string' || !/^R-/.test(data.id) || typeof data.f !== 'string' || !data.f) {
      return { ok: false, error: 'Im Einladungslink fehlen Angaben. Bitte deinen Scrum Master um einen neuen Link.' };
    }
    return {
      ok: true,
      invite: { retroId: data.id, sprint: str(data.s), format: data.f, date: str(data.d), deadline: str(data.a) },
    };
  }

  // Liest «#einladung=…» aus dem Hash-Teil der Adresse. null = kein Link.
  function inviteFromHash(hash) {
    const m = /(?:^#|&)einladung=([^&]*)/.exec(hash || '');
    if (!m) return null;
    let code = m[1];
    try { code = decodeURIComponent(code); } catch (e) { /* Rohwert verwenden */ }
    return decodeInvite(code);
  }

  function buildInviteUrl(baseUrl, invite) {
    const url = new URL('teilnehmen.html', baseUrl);
    url.hash = 'einladung=' + encodeInvite(invite);
    return url.href;
  }

  /* ---------- Datum ---------- */

  function formatDate(iso, options) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return '';
    const day = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]))).getUTCDay();
    const names = options && options.long ? WEEKDAYS_LONG : WEEKDAYS;
    return names[day] + ', ' + m[3] + '.' + m[2] + '.' + m[1];
  }

  function formatDateTime(iso) {
    const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(iso || '');
    if (!m) return formatDate(iso);
    return formatDate(m[1]) + ', ' + m[2] + ':' + m[3] + ' Uhr';
  }

  /* ---------- Texte ---------- */

  function inviteText(plan, url) {
    const when = plan.date ? ' am ' + formatDate(plan.date, { long: true }) : '';
    const lines = [
      'Hallo Team 👋',
      '',
      'Unsere Retro zu «' + (plan.sprint || 'diesem Sprint') + '» findet' + when + ' statt. Format: ' + plan.formatName + '.',
      plan.deadline
        ? 'Bitte bis ' + formatDateTime(plan.deadline) + ' deine Karten über diesen Link abgeben:'
        : 'Bitte vor der Retro deine Karten über diesen Link abgeben:',
      url,
      '',
      'So geht’s: Link öffnen → Wetter wählen → Karten schreiben → «Meine Karten als .md speichern» → Datei in unseren Teams-Kanal legen.',
      'Deine Karten sind anonym, ein Kürzel ist freiwillig. Bitte keine Kunden- oder Personendaten.',
      'Danke! 🙌',
    ];
    return lines.join('\n');
  }

  function agendaText(plan, agenda, format, question) {
    const timed = addTimes(agenda, plan.start);
    const total = sumMinutes(agenda);
    const head = 'Retro «' + (plan.sprint || 'Sprint') + '»'
      + (plan.date ? ' – ' + formatDate(plan.date, { long: true }) : '')
      + (plan.start ? ', ' + plan.start + ' Uhr' : '')
      + ' (' + total + ' Min.)';
    const lines = [head];
    if (format) lines.push('Format: ' + format.name + ' – ' + format.columns.map((c) => c.name).join(' · '));
    if (question) lines.push('Check-in-Frage: ' + question);
    lines.push('');
    timed.forEach((row, i) => {
      lines.push((i + 1) + '. ' + row.name + ' – ' + row.minutes + ' Min.' + (row.from ? ' (' + row.from + '–' + row.to + ')' : ''));
    });
    lines.push('');
    lines.push('Ziel: 1–3 Massnahmen, jede mit Wer und Bis wann.');
    return lines.join('\n');
  }

  return {
    STEP,
    computeAgenda,
    sumMinutes,
    addTimes,
    findFormat,
    recommendFormat,
    randomFormat,
    randomQuestion,
    slugify,
    todayIso,
    makeRetroId,
    encodeInvite,
    decodeInvite,
    inviteFromHash,
    buildInviteUrl,
    formatDate,
    formatDateTime,
    inviteText,
    agendaText,
  };
});
