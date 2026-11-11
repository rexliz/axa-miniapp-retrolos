/* ==========================================================================
   RetroLos! – Teilnehmen (Oberfläche)
   Liest die Einladung aus dem Hash, sammelt Wetter und Karten, hält einen
   Entwurf im Browser und erzeugt die Beitragsdatei mit core-markdown.js.
   ========================================================================== */
(function () {
  'use strict';

  const app = window.RetroLos || {};
  const { config, plan: core, markdown: md, ui, effects } = app;
  if (!config || !core || !md || !ui) return;

  const $ = (id) => document.getElementById(id);
  const noInvite = $('no-invite');
  const joinApp = $('join-app');

  /* ---------- Ohne Link: Link einfügen ---------- */

  const pasteForm = $('paste-form');
  pasteForm.hidden = false;
  pasteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = $('paste-link').value.trim();
    if (!value) return;
    const hashAt = value.indexOf('#');
    const hash = hashAt >= 0 ? value.slice(hashAt + 1) : value.startsWith('einladung=') ? value : 'einladung=' + value;
    window.location.hash = hash;
  });
  window.addEventListener('hashchange', () => window.location.reload());

  function showInviteError(message) {
    $('invite-error').hidden = false;
    $('invite-error-text').textContent = message;
  }

  const result = core.inviteFromHash(window.location.hash);
  if (!result) return;
  if (!result.ok) {
    showInviteError(result.error);
    return;
  }
  const invite = result.invite;
  const format = core.findFormat(config, invite.format);
  if (!format) {
    showInviteError('Das Format «' + invite.format + '» kennt diese Version von RetroLos! nicht. Bitte deinen Scrum Master um einen neuen Link.');
    return;
  }

  noInvite.hidden = true;
  joinApp.hidden = false;
  const title = invite.sprint || invite.retroId;
  document.title = 'Retro «' + title + '» – RetroLos!';

  /* ---------- Einladungskarte ---------- */

  $('retro-title').textContent = 'Retro «' + title + '»';
  $('fact-format').textContent = format.theme.emoji + ' ' + format.name;
  $('fact-date').textContent = invite.date ? core.formatDate(invite.date, { long: true }) : 'noch offen';
  $('fact-deadline').textContent = invite.deadline ? core.formatDateTime(invite.deadline) : 'vor der Retro';
  if (invite.deadline && new Date(invite.deadline).getTime() < Date.now()) $('deadline-note').hidden = false;
  $('format-explanation').textContent = format.explanation;

  /* ---------- Zustand und Entwurf ---------- */

  const draftKey = 'entwurf:' + invite.retroId;
  const state = { weather: '', initials: '', suffix: md.randomSuffix(), cards: {} };
  format.columns.forEach((c) => { state.cards[c.key] = []; });
  const draft = ui.storage.get(draftKey, null);
  let restored = false;
  if (draft && draft.format === format.key) {
    state.weather = typeof draft.weather === 'string' ? draft.weather : '';
    state.initials = typeof draft.initials === 'string' ? draft.initials : '';
    if (typeof draft.suffix === 'string' && /^[a-z0-9]{4}$/.test(draft.suffix)) state.suffix = draft.suffix;
    format.columns.forEach((c) => {
      const list = draft.cards && draft.cards[c.key];
      if (Array.isArray(list)) state.cards[c.key] = list.filter((t) => typeof t === 'string' && t.trim());
    });
    restored = true;
  }

  function saveDraft() {
    ui.storage.set(draftKey, {
      format: format.key,
      weather: state.weather,
      initials: state.initials,
      suffix: state.suffix,
      cards: state.cards,
      savedAt: new Date().toISOString(),
    });
  }

  function changed() {
    saveDraft();
    $('done').hidden = true;
    updateSummary();
    updateScene();
  }

  /* ---------- Wetter ---------- */

  const weatherBox = $('weather-choices');
  config.weather.forEach((w) => {
    const input = ui.el('input', { type: 'radio', name: 'weather', value: w.emoji, checked: state.weather === w.emoji });
    input.addEventListener('change', () => {
      state.weather = w.emoji;
      changed();
    });
    weatherBox.append(ui.el('label', { class: 'choice' }, input,
      ui.el('span', null, ui.el('span', { class: 'weather-emoji', 'aria-hidden': 'true', text: w.emoji }), w.label)));
  });

  /* ---------- Spalten und Karten ---------- */

  const columnsBox = $('join-columns');
  columnsBox.dataset.count = String(format.columns.length);
  const columnViews = {};

  function cardItem(column, index) {
    const text = state.cards[column.key][index];
    const li = ui.el('li', { class: 'note-card' });
    const view = () => {
      li.replaceChildren(
        ui.el('p', { class: 'note-text', text }),
        ui.el('div', { class: 'note-actions' },
          ui.el('button', { type: 'button', class: 'button button-ghost', onclick: edit, 'aria-label': 'Karte bearbeiten: ' + text.slice(0, 40) }, 'Bearbeiten'),
          ui.el('button', { type: 'button', class: 'button button-ghost', onclick: remove, 'aria-label': 'Karte löschen: ' + text.slice(0, 40) }, 'Löschen')));
    };
    function remove() {
      state.cards[column.key].splice(index, 1);
      renderColumn(column);
      changed();
      columnViews[column.key].input.focus();
      ui.announce('Karte gelöscht.');
    }
    function edit() {
      const area = ui.el('textarea', { rows: '3', 'aria-label': 'Karte bearbeiten' });
      area.value = text;
      const save = () => {
        const value = md.cleanText(area.value);
        if (!value) {
          remove();
          return;
        }
        state.cards[column.key][index] = value;
        renderColumn(column);
        changed();
        ui.announce('Karte geändert.');
      };
      area.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
          event.preventDefault();
          save();
        } else if (event.key === 'Escape') {
          event.preventDefault();
          renderColumn(column);
        }
      });
      li.replaceChildren(area, ui.el('div', { class: 'note-actions' },
        ui.el('button', { type: 'button', class: 'button button-secondary', onclick: save }, 'Speichern'),
        ui.el('button', { type: 'button', class: 'button button-ghost', onclick: () => renderColumn(column) }, 'Abbrechen')));
      area.focus();
    }
    view();
    return li;
  }

  function renderColumn(column) {
    const v = columnViews[column.key];
    v.list.replaceChildren(...state.cards[column.key].map((_, i) => cardItem(column, i)));
  }

  format.columns.forEach((column, i) => {
    const id = 'neu-' + column.key;
    const list = ui.el('ul', { class: 'card-list', 'aria-label': 'Karten in ' + column.name });
    const input = ui.el('textarea', { id, rows: '2', placeholder: 'Neue Karte …', maxlength: '500' });
    const form = ui.el('form', { class: 'add-card' },
      ui.el('label', { class: 'visually-hidden', for: id, text: 'Neue Karte für «' + column.name + '»' }),
      input,
      ui.el('button', { type: 'submit', class: 'button button-secondary' }, '+ Karte hinzufügen'));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const text = md.cleanText(input.value);
      if (!text) {
        ui.announce('Die Karte ist noch leer.', 'warning');
        input.focus();
        return;
      }
      state.cards[column.key].push(text);
      input.value = '';
      renderColumn(column);
      changed();
      input.focus();
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        form.requestSubmit();
      }
    });
    const section = ui.el('section', { class: 'join-column tone-' + ((i % 5) + 1), 'aria-labelledby': 'titel-' + column.key },
      ui.el('h3', { id: 'titel-' + column.key, text: column.name }),
      ui.el('p', { class: 'column-question', text: column.question }),
      list,
      form);
    columnsBox.append(section);
    columnViews[column.key] = { list, input, section };
    renderColumn(column);
  });

  /* ---------- Segelboot ---------- */

  let scene = null;
  if (format.theme.scene === 'segelboot' && effects && effects.createSailboat) {
    const host = $('scene-host');
    host.hidden = false;
    scene = effects.createSailboat(host);
  }

  function updateScene() {
    if (!scene) return;
    const counts = {};
    Object.keys(state.cards).forEach((k) => { counts[k] = state.cards[k].length; });
    scene.update(counts);
  }

  /* ---------- Kürzel ---------- */

  const initials = $('initials');
  initials.value = state.initials;
  initials.addEventListener('input', () => {
    state.initials = initials.value.trim().slice(0, 12);
    changed();
  });

  /* ---------- Zusammenfassung und Speichern ---------- */

  const totalCards = () => Object.values(state.cards).reduce((s, list) => s + list.length, 0);

  function updateSummary() {
    const total = totalCards();
    const filled = Object.values(state.cards).filter((l) => l.length).length;
    let text = total === 0
      ? 'Noch keine Karten. Schreib oben mindestens eine Karte.'
      : 'Du hast ' + total + (total === 1 ? ' Karte' : ' Karten') + ' in ' + filled + ' von ' + format.columns.length + ' Spalten geschrieben.';
    if (total > 0 && !state.weather) text += ' Tipp: Wähle oben noch dein Wetter.';
    $('save-summary').textContent = text;
  }

  function nowLocal() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  const dialog = $('preview-dialog');
  let pending = null;

  $('save-button').addEventListener('click', () => {
    if (totalCards() === 0) {
      ui.announce('Schreib zuerst mindestens eine Karte.', 'warning');
      columnViews[format.columns[0].key].input.focus();
      return;
    }
    pending = md.writeContribution({
      retroId: invite.retroId,
      format: format.key,
      weather: state.weather,
      initials: state.initials,
      created: nowLocal(),
      suffix: state.suffix,
      cards: state.cards,
    }, config);
    $('preview-filename').textContent = pending.filename;
    $('preview-text').textContent = pending.text;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    $('preview-save').focus();
  });

  $('preview-cancel').addEventListener('click', () => dialog.close());

  $('preview-save').addEventListener('click', () => {
    if (!pending) return;
    ui.download(pending.filename, pending.text);
    dialog.close();
    ui.storage.remove(draftKey);
    $('drop-hint').textContent = config.dropHint;
    $('done-filename').textContent = pending.filename;
    const done = $('done');
    done.hidden = false;
    done.focus();
    done.scrollIntoView({ behavior: effects && effects.motionOk() ? 'smooth' : 'auto', block: 'center' });
    if (effects) effects.confetti({ y: 0.5 });
    ui.announce('Datei gespeichert: ' + pending.filename, 'success');
  });

  updateSummary();
  updateScene();
  if (restored && totalCards() > 0) ui.announce('Dein Entwurf wurde wiederhergestellt.');
})();
