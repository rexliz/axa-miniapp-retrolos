/* ==========================================================================
   RetroLos! – Oberfläche der Mini-Retro (eine Person, ein Gerät)
   Format wählen, Notizen sammeln, nächste Schritte festlegen. Speichert
   automatisch im Browser; die Logik steckt in core-retro.js.
   ========================================================================== */
(function () {
  'use strict';

  const app = window.RetroLos || {};
  const { retro: R, ui, effects } = app;
  if (!R || !ui) return;

  const $ = (id) => document.getElementById(id);
  let log = R.normalize(ui.storage.get('logbuch', null));
  let scene = null;

  function save() {
    ui.storage.set('logbuch', log);
  }

  /* ---------- Zonen ---------- */

  function renderCards(zone) {
    const cards = R.zoneCards(log, zone.key);
    $('cards-' + zone.key).replaceChildren(...cards.map((text, i) => ui.el('li', { class: 'card' },
      ui.el('span', { class: 'card-text', text }),
      ui.el('button', {
        type: 'button',
        class: 'card-remove',
        'aria-label': 'Notiz löschen: ' + text.slice(0, 40),
        onclick: () => {
          R.removeCard(log, zone.key, i);
          save();
          renderCards(zone);
          renderCourse();
          $('neu-' + zone.key).focus();
        },
      }, '×'))));
    $('count-' + zone.key).textContent = String(cards.length);
  }

  function buildZones() {
    const f = R.format(log);
    const box = $('zones');
    box.dataset.count = String(f.zones.length);
    box.replaceChildren(...f.zones.map((zone) => {
      const input = ui.el('input', { id: 'neu-' + zone.key, type: 'text', maxlength: '300', placeholder: 'Notiz hinzufügen', autocomplete: 'off' });
      const form = ui.el('form', { class: 'zone-add' },
        ui.el('label', { class: 'visually-hidden', for: 'neu-' + zone.key, text: 'Neue Notiz für ' + zone.name }),
        input,
        ui.el('button', { type: 'submit', class: 'button button-icon', 'aria-label': 'Notiz zu ' + zone.name + ' hinzufügen' }, '+'));
      const section = ui.el('section', { class: 'zone', 'aria-labelledby': 'titel-' + zone.key },
        ui.el('div', { class: 'zone-head' },
          ui.el('span', { class: 'zone-emoji', 'aria-hidden': 'true', text: zone.emoji }),
          ui.el('h2', { id: 'titel-' + zone.key, text: zone.name }),
          ui.el('span', { class: 'zone-count', id: 'count-' + zone.key, text: '0' })),
        ui.el('p', { class: 'zone-question', text: zone.question }),
        ui.el('ul', { class: 'zone-cards', id: 'cards-' + zone.key }),
        form);
      const guard = ui.attachPrivacyHint(input);
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!R.addCard(log, zone.key, input.value)) {
          input.focus();
          return;
        }
        input.value = '';
        guard.run();
        save();
        renderCards(zone);
        renderCourse();
        input.focus();
      });
      return section;
    }));
    f.zones.forEach(renderCards);
  }

  /* ---------- Format und Segelboot ---------- */

  function renderFormat() {
    const f = R.format(log);
    $('format').value = f.key;
    $('format-fit').replaceChildren(ui.el('strong', { text: f.emoji + ' ' + f.name }), ' – gut geeignet für ' + f.fitsFor + '.');
    const boat = f.scene === 'segelboot' && effects;
    $('sea').hidden = !boat;
    if (boat && !scene) scene = effects.createSailboat($('scene'));
    buildZones();
    renderCourse();
  }

  function renderCourse() {
    if (!scene || $('sea').hidden) return;
    const c = R.course(log);
    $('course-label').textContent = c.label;
    $('course-knots').textContent = c.knots + ' Knoten';
    scene.update(c);
  }

  // Die Optionen stehen im HTML; nur falls eine fehlt, wird sie ergänzt.
  const select = $('format');
  R.FORMATS.forEach((f) => {
    if (!select.querySelector('option[value="' + f.key + '"]')) select.append(ui.el('option', { value: f.key, text: f.emoji + ' ' + f.name }));
  });
  const onFormat = () => {
    if (select.value !== log.format && R.setFormat(log, select.value)) {
      save();
      renderFormat();
    }
  };
  select.addEventListener('change', onFormat);
  select.addEventListener('input', onFormat);

  /* ---------- Törn ---------- */

  const title = $('trip-title');
  const date = $('trip-date');
  title.value = log.title;
  date.value = log.date;
  title.addEventListener('input', () => {
    log.title = R.cleanText(title.value).slice(0, 60);
    save();
  });
  date.addEventListener('input', () => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date.value)) {
      log.date = date.value;
      save();
    }
  });

  /* ---------- Nächste Schritte ---------- */

  function renderActions() {
    $('actions').replaceChildren(...log.actions.map((a, i) => ui.el('li', { class: 'action' },
      ui.el('span', { class: 'card-text', text: a.what }),
      a.due ? ui.el('span', { class: 'action-due', text: 'bis ' + R.formatDate(a.due) }) : null,
      ui.el('button', {
        type: 'button',
        class: 'card-remove',
        'aria-label': 'Schritt löschen: ' + a.what.slice(0, 40),
        onclick: () => {
          R.removeAction(log, i);
          save();
          renderActions();
        },
      }, '×'))));
    $('action-form').hidden = log.actions.length >= R.MAX_ACTIONS;
  }

  const actionWhat = $('action-what');
  const actionGuard = ui.attachPrivacyHint(actionWhat);
  $('action-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!R.addAction(log, actionWhat.value, $('action-due').value)) {
      actionWhat.focus();
      return;
    }
    actionWhat.value = '';
    $('action-due').value = '';
    actionGuard.run();
    save();
    renderActions();
    if (log.actions.length >= R.MAX_ACTIONS) {
      ui.announce('Drei Schritte – das reicht für den nächsten Sprint.', 'success');
      if (effects) effects.confetti();
    } else {
      actionWhat.focus();
    }
  });

  /* ---------- Ergebnis sichern ---------- */

  // PDF über den Druckdialog des Browsers («Als PDF speichern») – ohne Bibliothek.
  $('pdf').addEventListener('click', () => {
    const f = R.format(log);
    $('print-title').textContent = f.emoji + ' ' + (log.title || 'Retro') + ' – ' + f.name + ' · ' + R.formatDate(log.date);
    document.title = R.fileName(log);
    ui.announce('Im Druckdialog «Als PDF speichern» wählen.');
    window.print();
    document.title = 'RetroLos! – Mini-Retro';
  });

  $('copy').addEventListener('click', async () => {
    const ok = await ui.copyText(R.summaryText(log));
    ui.announce(ok ? 'Text kopiert.' : 'Kopieren hat nicht geklappt.', ok ? 'success' : 'warning');
  });

  $('reset').addEventListener('click', () => {
    if (!window.confirm('Alles löschen und neu beginnen? Speichere vorher ein PDF, wenn du das Ergebnis behalten willst.')) return;
    ui.storage.clearAll();
    const keep = log.format;
    log = R.createLog();
    R.setFormat(log, keep);
    title.value = '';
    date.value = log.date;
    save();
    renderFormat();
    renderActions();
    ui.announce('Neu beginnen – los gehts!');
  });

  renderFormat();
  renderActions();
})();
