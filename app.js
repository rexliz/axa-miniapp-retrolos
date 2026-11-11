/* ==========================================================================
   RetroLos! – Oberfläche des Segeltörns (eine Person, ein Gerät)
   Speichert automatisch im Browser; die Logik steckt in core-segelboot.js.
   ========================================================================== */
(function () {
  'use strict';

  const app = window.RetroLos || {};
  const { segelboot: S, ui, effects } = app;
  if (!S || !ui) return;

  const $ = (id) => document.getElementById(id);
  let log = S.normalize(ui.storage.get('logbuch', null));
  const scene = effects ? effects.createSailboat($('scene')) : null;

  function save() {
    ui.storage.set('logbuch', log);
  }

  function renderZone(zone) {
    const list = $('cards-' + zone.key);
    list.replaceChildren(...log.cards[zone.key].map((text, i) => ui.el('li', { class: 'card' },
      ui.el('span', { class: 'card-text', text }),
      ui.el('button', {
        type: 'button',
        class: 'card-remove',
        'aria-label': 'Karte löschen: ' + text.slice(0, 40),
        onclick: () => {
          S.removeCard(log, zone.key, i);
          commit();
          $('neu-' + zone.key).focus();
        },
      }, '×'))));
    $('count-' + zone.key).textContent = String(log.cards[zone.key].length);
  }

  function renderActions() {
    $('actions').replaceChildren(...log.actions.map((a, i) => ui.el('li', { class: 'action' },
      ui.el('span', { class: 'card-text', text: a.what }),
      a.due ? ui.el('span', { class: 'action-due', text: 'bis ' + S.formatDate(a.due) }) : null,
      ui.el('button', {
        type: 'button',
        class: 'card-remove',
        'aria-label': 'Schritt löschen: ' + a.what.slice(0, 40),
        onclick: () => {
          S.removeAction(log, i);
          commit();
        },
      }, '×'))));
    $('action-form').hidden = log.actions.length >= S.MAX_ACTIONS;
  }

  function renderCourse() {
    const c = S.course(log);
    $('course-label').textContent = c.label;
    $('course-knots').textContent = c.knots + ' Knoten';
    if (scene) scene.update(c);
  }

  function render() {
    S.ZONES.forEach(renderZone);
    renderActions();
    renderCourse();
  }

  function commit() {
    save();
    render();
  }

  /* ---------- Eingaben ---------- */

  const title = $('trip-title');
  const date = $('trip-date');
  title.value = log.title;
  date.value = log.date;
  title.addEventListener('input', () => {
    log.title = S.cleanText(title.value).slice(0, 60);
    save();
  });
  date.addEventListener('input', () => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(date.value)) {
      log.date = date.value;
      save();
    }
  });

  document.querySelectorAll('.zone-add').forEach((form) => {
    const zone = form.dataset.zone;
    const input = form.querySelector('input');
    const guard = ui.attachPrivacyHint(input);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!S.addCard(log, zone, input.value)) {
        input.focus();
        return;
      }
      input.value = '';
      guard.run();
      commit();
      input.focus();
    });
  });

  const actionWhat = $('action-what');
  const actionGuard = ui.attachPrivacyHint(actionWhat);
  $('action-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!S.addAction(log, actionWhat.value, $('action-due').value)) {
      actionWhat.focus();
      return;
    }
    actionWhat.value = '';
    $('action-due').value = '';
    actionGuard.run();
    commit();
    if (log.actions.length >= S.MAX_ACTIONS) {
      ui.announce('Kurs gesetzt – drei Schritte reichen für den nächsten Sprint.', 'success');
      if (effects) effects.confetti();
    } else {
      actionWhat.focus();
    }
  });

  /* ---------- Logbuch ---------- */

  $('save').addEventListener('click', () => {
    ui.download(S.fileName(log), S.toMarkdown(log));
    ui.announce('Logbuch gespeichert: ' + S.fileName(log), 'success');
  });

  $('copy').addEventListener('click', async () => {
    const ok = await ui.copyText(S.summaryText(log));
    ui.announce(ok ? 'Text kopiert.' : 'Kopieren hat nicht geklappt.', ok ? 'success' : 'warning');
  });

  $('reset').addEventListener('click', () => {
    if (!window.confirm('Alles löschen und einen neuen Törn beginnen? Speichere vorher das Logbuch, wenn du es behalten willst.')) return;
    ui.storage.clearAll();
    log = S.createLog();
    title.value = '';
    date.value = log.date;
    commit();
    ui.announce('Neuer Törn – Leinen los!');
  });

  render();
})();
