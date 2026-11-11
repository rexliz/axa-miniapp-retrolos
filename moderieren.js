/* ==========================================================================
   RetroLos! – Importieren und Moderieren (Oberfläche)
   Alle Regeln stecken in core-board.js; hier wird nur dargestellt, gespeichert
   und auf Eingaben reagiert.
   ========================================================================== */
(function () {
  'use strict';

  const app = window.RetroLos || {};
  const { config, plan: core, markdown: md, board: B, ui, effects } = app;
  if (!config || !core || !md || !B || !ui) return;

  const $ = (id) => document.getElementById(id);
  const motion = () => !effects || effects.motionOk();

  const PHASE_HINTS = [
    'Alle kommen an: Die Check-in-Frage beantwortet jede Person in einem Satz. Unten seht ihr das Wetter aus allen Beiträgen.',
    'Die Karten erscheinen der Reihe nach. Lest sie gemeinsam, ergänzt Fehlendes und verschiebt Karten in die passende Spalte.',
    'Ähnliche Karten zusammenfassen, dann Punkte vergeben: Was ist uns am wichtigsten? Die Karten sortieren sich nach Punkten.',
    'Aus den wichtigsten Themen 1–3 konkrete Massnahmen machen – jede mit Wer (Rolle oder Kürzel) und Bis wann.',
    'Kurzes Feedback zur Retro, dann Danke ans Team. Am Schluss speicherst du das Protokoll.',
  ];
  const FEEDBACK_EMOJI = { 1: '😞', 2: '🙁', 3: '😐', 4: '🙂', 5: '🤩' };

  /* ---------- Board laden ---------- */

  const plan = ui.storage.get('plan', null);
  const planBoard = () => B.createBoard(plan ? {
    retroId: plan.retroId, format: plan.format, sprint: plan.sprint, date: plan.date, question: plan.question, agenda: plan.agenda,
  } : {});

  let board = ui.storage.get('board', null);
  if (!board || board.version !== 1 || !Array.isArray(board.cards)) board = planBoard();
  let mismatch = Boolean(plan && board.retroId && plan.retroId !== board.retroId);
  if (mismatch && board.cards.length === 0 && board.contributions.length === 0) {
    board = planBoard();
    mismatch = false;
  }
  if (plan && plan.retroId === board.retroId) {
    // Planung wurde evtl. nachträglich angepasst
    board.agenda = plan.agenda;
    board.question = board.question || plan.question;
    board.sprint = plan.sprint || board.sprint;
    board.date = plan.date || board.date;
  }

  const selected = new Set();
  const pendingForeign = new Map();
  let freshIds = new Set();
  let sortTimer = null;

  function save() {
    ui.storage.set('board', board);
  }

  function format() {
    return core.findFormat(config, board.format);
  }

  /* ---------- Kontext und Import ---------- */

  function renderContext() {
    const f = format();
    const parts = [];
    if (board.sprint) parts.push('Retro «' + board.sprint + '»');
    if (f) parts.push(f.theme.emoji + ' ' + f.name);
    if (board.date) parts.push(core.formatDate(board.date));
    if (board.retroId) parts.push(board.retroId);
    $('retro-context').textContent = parts.length
      ? parts.join(' · ')
      : 'Noch keine Retro geplant. Das Board übernimmt Retro-ID und Format aus der ersten Datei – oder lege unten ein Board ohne Planung an.';
    const box = $('board-mismatch');
    box.hidden = !mismatch;
    if (mismatch) {
      $('board-mismatch-text').textContent = 'Auf diesem Gerät liegt noch das Board der Retro ' + board.retroId + ' (' + board.cards.length
        + ' Karten). Geplant ist aber ' + plan.retroId + '. Womit willst du weitermachen?';
    }
    const n = board.contributions.length;
    const cards = board.cards.length;
    $('board-stats').textContent = n || cards
      ? 'Auf dem Board: ' + n + (n === 1 ? ' Beitrag' : ' Beiträge') + ' · ' + cards + (cards === 1 ? ' Karte' : ' Karten')
      : '';
  }

  $('board-keep').addEventListener('click', () => {
    mismatch = false;
    renderContext();
  });
  $('board-new').addEventListener('click', () => {
    if (!window.confirm('Das alte Board wird in diesem Browser gelöscht. Hast du das Protokoll gespeichert? Fortfahren?')) return;
    board = planBoard();
    mismatch = false;
    commit();
    ui.announce('Neues Board für ' + board.retroId + ' angelegt.');
  });

  // Datenschutz-Wächter (Phase 5) markiert verdächtige Karten.
  const flag = (text) => Boolean(app.privacy && app.privacy.check(text).length);

  async function readFiles(fileList) {
    return Promise.all(Array.from(fileList).map(async (file) => {
      const readable = /\.(md|markdown|txt)$/i.test(file.name) && file.size <= 1000000;
      let text = '';
      if (readable) {
        try {
          text = await file.text();
        } catch (e) {
          text = '';
        }
      }
      return { name: file.name, text };
    }));
  }

  async function handleFiles(fileList, fromFolder) {
    if (!fileList || !fileList.length) return;
    const files = await readFiles(fileList);
    const before = new Set(board.cards.map((c) => c.id));
    const report = B.importFiles(board, files, config, { flag });
    report.foreign.forEach((f) => {
      const list = pendingForeign.get(f.retroId) || [];
      list.push(files.find((x) => x.name === f.name));
      pendingForeign.set(f.retroId, list);
    });
    if (fromFolder) report.ignoredCount = report.ignored.length;
    finishImport(report, before);
  }

  function finishImport(report, before) {
    freshIds = new Set(board.cards.filter((c) => !before.has(c.id)).map((c) => c.id));
    if (board.phase !== 1) freshIds = new Set();
    commit();
    renderReport(report);
    const added = report.added.length;
    ui.announce(added
      ? added + (added === 1 ? ' Beitrag' : ' Beiträge') + ' importiert.'
      : 'Keine neuen Beiträge übernommen – Details stehen im Import-Bericht.', added ? 'success' : 'warning');
  }

  function reportItem(kind, title, lines, extra) {
    return ui.el('li', { class: 'report-item report-' + kind },
      ui.el('p', null, title),
      lines && lines.length ? ui.el('ul', null, lines.map((l) => ui.el('li', null, l))) : null,
      extra || null);
  }

  function renderReport(r) {
    const items = [];
    const cards = r.added.reduce((s, a) => s + a.cards, 0);
    if (r.added.length) {
      items.push(reportItem('ok', '✅ ' + r.added.length + (r.added.length === 1 ? ' Beitrag' : ' Beiträge') + ' übernommen (' + cards + ' Karten).',
        r.added.map((a) => a.name + ' – ' + a.cards + ' Karten')));
    }
    if (r.duplicates.length) {
      items.push(reportItem('info', '♻️ ' + r.duplicates.length + ' Duplikat' + (r.duplicates.length === 1 ? '' : 'e') + ' übersprungen – diese Dateien waren schon importiert.', r.duplicates));
    }
    const foreignIds = [...new Set(r.foreign.map((f) => f.retroId))];
    foreignIds.forEach((id) => {
      const names = r.foreign.filter((f) => f.retroId === id).map((f) => f.name);
      const accept = ui.el('button', { type: 'button', class: 'button button-secondary' }, 'Trotzdem übernehmen');
      const ignore = ui.el('button', { type: 'button', class: 'button button-ghost' }, 'Ignorieren');
      const li = reportItem('foreign', '❓ ' + names.length + (names.length === 1 ? ' Datei gehört' : ' Dateien gehören') + ' zu einer anderen Retro (' + id + '), nicht zu ' + board.retroId + '. Übernehmen?',
        names, ui.el('div', { class: 'button-row' }, accept, ignore));
      accept.addEventListener('click', () => {
        const files = (pendingForeign.get(id) || []).filter(Boolean);
        pendingForeign.delete(id);
        const before = new Set(board.cards.map((c) => c.id));
        const again = B.importFiles(board, files, config, { acceptRetroIds: [id], flag });
        finishImport(again, before);
      });
      ignore.addEventListener('click', () => {
        pendingForeign.delete(id);
        li.remove();
      });
      items.push(li);
    });
    if (r.errors.length) {
      items.push(reportItem('error', '⚠️ ' + r.errors.length + (r.errors.length === 1 ? ' Datei konnte' : ' Dateien konnten') + ' nicht gelesen werden:',
        r.errors.map((e) => e.name + ': ' + e.error)));
    }
    if (r.protocols.length) {
      items.push(reportItem('info', '📋 Protokoll erkannt. Protokolle der letzten Retro importierst du beim Planen (Seite «Planen»).', r.protocols));
    }
    r.warnings.forEach((w) => items.push(reportItem('warn', 'ℹ️ Hinweis zu ' + w.name + ':', w.messages)));
    if (r.flagged) {
      items.push(reportItem('warn', '🛡️ ' + r.flagged + (r.flagged === 1 ? ' Karte sieht' : ' Karten sehen') + ' nach Kunden- oder Personendaten aus und ' + (r.flagged === 1 ? 'ist' : 'sind') + ' markiert. Bitte vor dem Teilen anpassen oder löschen.'));
    }
    if (r.ignored.length) {
      items.push(reportItem('info', r.ignored.length + ' andere Datei' + (r.ignored.length === 1 ? '' : 'en') + ' ignoriert (keine .md-Datei).', r.ignoredCount ? [] : r.ignored));
    }
    $('import-report').replaceChildren(items.length ? ui.el('ul', { class: 'report-list' }, items) : '');
  }

  const fileInput = $('file-input');
  const folderInput = $('folder-input');
  $('pick-files').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files, false);
    fileInput.value = '';
  });
  if ('webkitdirectory' in HTMLInputElement.prototype && !/iPhone|iPad|Android/i.test(navigator.userAgent)) {
    $('pick-folder').hidden = false;
    $('folder-hint').hidden = false;
    $('pick-folder').addEventListener('click', () => folderInput.click());
    folderInput.addEventListener('change', () => {
      handleFiles(folderInput.files, true);
      folderInput.value = '';
    });
  }
  const zone = $('dropzone');
  ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (event) => {
    if (!event.dataTransfer || !Array.from(event.dataTransfer.types || []).includes('Files')) return;
    event.preventDefault();
    zone.classList.add('is-over');
  }));
  ['dragleave', 'drop'].forEach((type) => zone.addEventListener(type, () => zone.classList.remove('is-over')));
  zone.addEventListener('drop', (event) => {
    if (!event.dataTransfer || !event.dataTransfer.files.length) return;
    event.preventDefault();
    handleFiles(event.dataTransfer.files, false);
  });

  /* ---------- Board ohne Planung ---------- */

  const setupFormat = $('setup-format');
  config.formats.forEach((f) => setupFormat.append(ui.el('option', { value: f.key, text: f.theme.emoji + ' ' + f.name })));
  $('setup-date').value = core.todayIso();
  $('setup-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (board.cards.length && !window.confirm('Das aktuelle Board wird in diesem Browser ersetzt. Fortfahren?')) return;
    const sprint = $('setup-sprint').value.trim();
    const date = $('setup-date').value;
    board = B.createBoard({
      retroId: core.makeRetroId(date, sprint),
      format: setupFormat.value,
      sprint,
      date,
      question: core.randomQuestion(config),
    });
    mismatch = false;
    commit();
    ui.announce('Neues Board angelegt: ' + board.retroId);
  });

  /* ---------- Phasen ---------- */

  const stepper = $('stepper');
  const stepButtons = config.phases.map((phase, i) => {
    const button = ui.el('button', { type: 'button' },
      ui.el('span', { class: 'stepper-num', 'aria-hidden': 'true', text: String(i + 1) }),
      ui.el('span', { text: phase.name }),
      ui.el('span', { class: 'stepper-time' }));
    button.addEventListener('click', () => goTo(i));
    stepper.append(ui.el('li', null, button));
    return button;
  });

  function phaseMinutes(i) {
    const agenda = Array.isArray(board.agenda) && board.agenda.length === config.phases.length
      ? board.agenda
      : core.computeAgenda(config.defaultDuration, config.phases);
    return Number(agenda[i] && agenda[i].minutes) || 5;
  }

  function goTo(i) {
    const next = Math.max(0, Math.min(config.phases.length - 1, i));
    if (next === board.phase) return;
    if (next === 1 && !board.revealed) {
      freshIds = new Set(B.visibleCards(board).map((c) => c.id));
      board.revealed = true;
    }
    board.phase = next;
    selected.clear();
    timerReset();
    commit();
  }

  $('prev').addEventListener('click', () => goTo(board.phase - 1));
  $('next').addEventListener('click', () => goTo(board.phase + 1));
  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const t = event.target;
    if (t && (t.closest('input, textarea, select, [contenteditable="true"], dialog') || t.tagName === 'SUMMARY')) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(board.phase + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(board.phase - 1);
    }
  });

  function renderPhase() {
    const i = board.phase;
    stepButtons.forEach((b, k) => {
      if (k === i) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
      b.classList.toggle('is-done', k < i);
      b.querySelector('.stepper-time').textContent = phaseMinutes(k) + ' Min.';
    });
    $('phase-kicker').textContent = 'Phase ' + (i + 1) + ' von ' + config.phases.length;
    $('phase-title').textContent = config.phases[i].name;
    $('phase-hint').textContent = PHASE_HINTS[i];
    $('prev').disabled = i === 0;
    $('next').disabled = i === config.phases.length - 1;
    $('panel-checkin').hidden = i !== 0;
    $('panel-board').hidden = i !== 1 && i !== 2;
    $('panel-decide').hidden = i !== 3;
    $('panel-close').hidden = i !== 4;
    $('show-initials').checked = Boolean(board.showInitials);
    $('sound').checked = Boolean(board.sound);
  }

  /* ---------- Einstimmen ---------- */

  function renderCheckin() {
    if (!board.question) board.question = core.randomQuestion(config);
    $('checkin-big').textContent = board.question;
    const counts = B.weatherCounts(board, config);
    const total = counts.reduce((s, c) => s + c.count, 0);
    $('mood-empty').hidden = board.contributions.length > 0;
    $('mood-total').textContent = board.contributions.length ? '(' + total + ' von ' + board.contributions.length + ' Beiträgen mit Wetter)' : '';
    const max = Math.max(1, ...counts.map((c) => c.count));
    const bars = counts.map((c) => {
      const fill = ui.el('span', { class: 'mood-fill' });
      const li = ui.el('li', { class: 'mood-bar' },
        ui.el('span', { class: 'mood-emoji', 'aria-hidden': 'true', text: c.emoji }),
        ui.el('span', { class: 'mood-track' }, fill),
        ui.el('span', { class: 'mood-count', text: String(c.count) }),
        ui.el('span', { class: 'visually-hidden', text: c.label + ': ' + c.count }));
      li.dataset.width = String(Math.round((c.count / max) * 100));
      return li;
    });
    $('mood-bars').replaceChildren(...bars);
    $('mood-bars').hidden = board.contributions.length === 0;
    // Balken nach dem Einfügen wachsen lassen (Breite per CSSOM, CSP-konform)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bars.forEach((li) => { li.querySelector('.mood-fill').style.width = li.dataset.width + '%'; });
    }));
  }

  $('checkin-other').addEventListener('click', () => {
    board.question = core.randomQuestion(config, board.question);
    commit();
  });

  /* ---------- Board ---------- */

  let scene = null;
  function ensureScene() {
    const f = format();
    const host = $('board-scene');
    const wanted = Boolean(board.phase === 1 && f && f.theme.scene === 'segelboot' && effects && effects.createSailboat);
    host.hidden = !wanted;
    if (wanted && !scene) scene = effects.createSailboat(host);
    if (!wanted) scene = null;
  }

  function updateScene(counts) {
    if (scene) scene.update(counts || B.columnCounts(board));
  }

  // Boot fährt während des Einblendens Karte für Karte mit.
  function revealScene(cards) {
    if (!scene) return;
    if (!motion()) {
      updateScene();
      return;
    }
    const counts = {};
    updateScene(counts);
    cards.forEach((card, i) => {
      setTimeout(() => {
        counts[card.column] = (counts[card.column] || 0) + 1;
        updateScene(Object.assign({}, counts));
      }, Math.min(i, 20) * 140 + 200);
    });
    setTimeout(() => updateScene(), Math.min(cards.length, 21) * 140 + 400);
  }

  function cardMenu(card, columns) {
    const body = ui.el('div', { class: 'card-menu-body' });
    const details = ui.el('details', { class: 'card-menu' },
      ui.el('summary', { 'aria-label': 'Aktionen für die Karte «' + card.text.slice(0, 30) + '»' }, '⋯'), body);
    body.append(
      ui.el('button', { type: 'button', class: 'button button-ghost', onclick: () => editCard(card) }, '✏️ Bearbeiten'),
      ui.el('button', {
        type: 'button',
        class: 'button button-ghost',
        onclick: () => {
          if (!window.confirm('Karte «' + card.text.slice(0, 60) + '» löschen?')) return;
          B.deleteCard(board, card.id);
          commit();
          ui.announce('Karte gelöscht.');
        },
      }, '🗑️ Löschen'));
    if (card.members.length) {
      body.append(ui.el('button', {
        type: 'button',
        class: 'button button-ghost',
        onclick: () => {
          B.ungroup(board, card.id);
          commit();
          ui.announce('Gruppe aufgelöst.');
        },
      }, '✂️ Gruppe auflösen'));
    }
    const targets = columns.filter((c) => c.key !== card.column);
    if (targets.length) {
      body.append(ui.el('p', { class: 'card-menu-label', text: 'Verschieben nach:' }));
      targets.forEach((c) => body.append(ui.el('button', {
        type: 'button',
        class: 'button button-ghost',
        onclick: () => {
          B.moveCard(board, card.id, c.key);
          commit();
          ui.announce('Karte nach «' + c.name + '» verschoben.');
        },
      }, '→ ' + c.name)));
    }
    return details;
  }

  function editCard(card) {
    const li = document.querySelector('.board-card[data-id="' + card.id + '"]');
    if (!li) return;
    const area = ui.el('textarea', { rows: '3', 'aria-label': 'Karte bearbeiten' });
    area.value = card.text;
    const saveEdit = () => {
      if (B.updateCard(board, card.id, area.value)) {
        card.flagged = flag(card.text);
        commit();
        ui.announce('Karte geändert.');
      } else {
        render();
      }
    };
    area.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
        event.preventDefault();
        saveEdit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        render();
      }
    });
    li.replaceChildren(area, ui.el('div', { class: 'button-row' },
      ui.el('button', { type: 'button', class: 'button button-primary', onclick: saveEdit }, 'Speichern'),
      ui.el('button', { type: 'button', class: 'button button-ghost', onclick: render }, 'Abbrechen')));
    li.draggable = false;
    area.focus();
  }

  function cardElement(card, columns, understand, index) {
    const li = ui.el('li', { class: 'board-card', 'data-id': card.id, draggable: 'true' });
    if (freshIds.has(card.id)) {
      li.classList.add('is-new');
      li.style.setProperty('--i', String(Math.min(index, 20)));
    }
    if (card.flagged) li.classList.add('is-flagged');
    if (selected.has(card.id)) li.classList.add('is-selected');
    if (understand) {
      const box = ui.el('input', { type: 'checkbox', checked: selected.has(card.id) });
      box.addEventListener('change', () => {
        if (box.checked) selected.add(card.id);
        else selected.delete(card.id);
        li.classList.toggle('is-selected', box.checked);
        updateGroupButton();
      });
      li.append(ui.el('label', { class: 'card-select' }, box, 'Auswählen'));
    }
    li.append(ui.el('p', { class: 'board-card-text', text: card.text }));
    const members = B.memberCards(board, card);
    if (members.length) li.append(ui.el('ul', { class: 'group-members', 'aria-label': 'Zusammengefasste Karten' }, members.map((m) => ui.el('li', { text: m.text }))));
    const meta = ui.el('div', { class: 'board-card-meta' });
    if (members.length) meta.append(ui.el('span', { class: 'badge badge-group', text: 'Gruppe · ' + (members.length + 1) + ' Karten' }));
    if (board.showInitials && card.initials) meta.append(ui.el('span', { class: 'badge', text: card.initials }));
    if (card.origin) meta.append(ui.el('span', { class: 'badge', text: 'aus «' + card.origin + '»' }));
    if (card.flagged) meta.append(ui.el('span', { class: 'badge badge-warn', text: '🛡️ Personendaten? Bitte prüfen' }));
    li.append(meta);
    if (understand) {
      const count = ui.el('span', { class: 'vote-count', 'aria-live': 'polite', text: String(card.votes) });
      const setVotes = (delta) => {
        B.vote(board, card.id, delta);
        count.textContent = String(card.votes);
        count.classList.remove('is-bumped');
        void count.offsetWidth;
        count.classList.add('is-bumped');
        save();
        scheduleSort();
      };
      li.append(ui.el('div', { class: 'votes' },
        ui.el('button', { type: 'button', class: 'vote-button', 'aria-label': 'Punkt abziehen', onclick: () => setVotes(-1) }, '−'),
        count,
        ui.el('span', { class: 'visually-hidden', text: 'Punkte' }),
        ui.el('button', { type: 'button', class: 'vote-button', 'aria-label': 'Punkt geben', onclick: () => setVotes(1) }, '+')));
    }
    li.append(cardMenu(card, columns));
    li.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', card.id);
      event.dataTransfer.effectAllowed = 'move';
      li.classList.add('is-dragging');
    });
    li.addEventListener('dragend', () => li.classList.remove('is-dragging'));
    return li;
  }

  function columnElement(col, index, columns, understand) {
    let cards = B.visibleCards(board, col.key);
    if (understand) cards = B.sortByVotes(cards);
    const list = ui.el('ul', { class: 'board-cards', 'aria-label': 'Karten in ' + col.name });
    cards.forEach((card) => list.append(cardElement(card, columns, understand, freshOrder.get(card.id) || 0)));
    const section = ui.el('section', { class: 'board-column tone-' + ((index % 5) + 1), 'data-column': col.key, 'aria-labelledby': 'spalte-' + col.key },
      ui.el('div', { class: 'board-column-head' },
        ui.el('h4', { id: 'spalte-' + col.key, text: col.name }),
        ui.el('span', { class: 'board-column-count', 'aria-label': cards.length + ' Karten', text: String(cards.length) })),
      ui.el('p', { class: 'column-question', text: col.question }),
      list);
    if (!understand) {
      const id = 'sm-neu-' + col.key;
      const input = ui.el('textarea', { id, rows: '2', placeholder: 'Karte ergänzen …', maxlength: '500' });
      const form = ui.el('form', { class: 'add-card no-print' },
        ui.el('label', { class: 'visually-hidden', for: id, text: 'Karte ergänzen in «' + col.name + '»' }),
        input,
        ui.el('button', { type: 'submit', class: 'button button-secondary' }, '+ Karte'));
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const card = B.addCard(board, col.key, input.value, { flagged: flag(input.value) });
        if (!card) return;
        freshIds = new Set([card.id]);
        commit();
        const again = document.getElementById(id);
        if (again) again.focus();
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
          event.preventDefault();
          form.requestSubmit();
        }
      });
      section.append(form);
    }
    section.addEventListener('dragover', (event) => {
      if (!Array.from(event.dataTransfer.types || []).includes('text/plain')) return;
      event.preventDefault();
      section.classList.add('is-over');
    });
    section.addEventListener('dragleave', (event) => {
      if (!section.contains(event.relatedTarget)) section.classList.remove('is-over');
    });
    section.addEventListener('drop', (event) => {
      const id = event.dataTransfer.getData('text/plain');
      section.classList.remove('is-over');
      if (!id || !B.getCard(board, id)) return;
      event.preventDefault();
      B.moveCard(board, id, col.key);
      commit();
      ui.announce('Karte nach «' + col.name + '» verschoben.');
    });
    return section;
  }

  // Reihenfolge des Einblendens = Import-Reihenfolge (Beitrag für Beitrag)
  let freshOrder = new Map();

  function renderBoard() {
    const understand = board.phase === 2;
    freshOrder = new Map(B.visibleCards(board).filter((c) => freshIds.has(c.id)).map((c, i) => [c.id, i]));
    const columns = B.columnsFor(board, config);
    const container = $('board');
    container.dataset.count = String(columns.length);
    container.replaceChildren(...columns.map((col, i) => columnElement(col, i, columns, understand)));
    $('board-help').textContent = board.cards.length === 0
      ? 'Noch keine Karten. Importiere oben die Dateien deines Teams oder ergänze Karten direkt in den Spalten.'
      : understand
        ? 'Mit + und − vergebt ihr Punkte. Ähnliche Karten auswählen und zusammenfassen.'
        : 'Ziehe Karten in eine andere Spalte oder nutze das Menü ⋯ (auch per Tastatur).';
    $('group-button').hidden = !understand;
    updateGroupButton();
    ensureScene();
    if (board.phase === 1 && freshIds.size && scene) {
      revealScene(B.visibleCards(board).filter((c) => freshIds.has(c.id)));
    } else {
      updateScene();
    }
    freshIds = new Set();
  }

  function updateGroupButton() {
    const button = $('group-button');
    button.disabled = selected.size < 2;
    button.textContent = 'Ausgewählte zusammenfassen (' + selected.size + ')';
  }

  $('group-button').addEventListener('click', () => {
    const ids = board.cards.filter((c) => selected.has(c.id)).map((c) => c.id);
    const lead = B.groupCards(board, ids);
    selected.clear();
    if (lead) {
      save();
      flipRender();
      ui.announce('Karten zusammengefasst.');
    }
  });

  // FLIP: Positionen merken, neu zeichnen, Karten an die neue Stelle gleiten lassen.
  function flipRender() {
    const before = new Map();
    document.querySelectorAll('#board .board-card').forEach((el) => before.set(el.dataset.id, el.getBoundingClientRect()));
    render();
    if (!motion()) return;
    document.querySelectorAll('#board .board-card').forEach((el) => {
      const old = before.get(el.dataset.id);
      if (!old) return;
      const now = el.getBoundingClientRect();
      const dx = old.left - now.left;
      const dy = old.top - now.top;
      if (!dx && !dy) return;
      el.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      el.getBoundingClientRect();
      el.classList.add('is-flipping');
      el.style.transform = '';
      el.addEventListener('transitionend', () => el.classList.remove('is-flipping'), { once: true });
    });
  }

  function scheduleSort() {
    clearTimeout(sortTimer);
    sortTimer = setTimeout(flipRender, 700);
  }

  $('show-initials').addEventListener('change', (event) => {
    board.showInitials = event.target.checked;
    commit();
  });
  $('sound').addEventListener('change', (event) => {
    board.sound = event.target.checked;
    save();
  });

  /* ---------- Entscheiden ---------- */

  function isoPlusDays(iso, days) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    const base = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : new Date();
    base.setUTCDate(base.getUTCDate() + days);
    return base.toISOString().slice(0, 10);
  }

  function renderDecide() {
    const topics = B.topTopics(board, config, 6);
    const list = $('topic-list');
    list.replaceChildren(...topics.map((t) => ui.el('li', { class: 'topic-item' },
      ui.el('span', { class: 'topic-points', 'aria-label': t.points + ' Punkte', text: String(t.points) }),
      ui.el('div', null, ui.el('p', { class: 'topic-text', text: t.text }), ui.el('span', { class: 'topic-column', text: t.column })),
      ui.el('button', {
        type: 'button',
        class: 'button button-secondary no-print',
        onclick: () => {
          $('action-what').value = t.text;
          $('action-who').focus();
          ui.announce('Thema übernommen – jetzt Wer und Bis wann ergänzen.');
        },
      }, '→ Als Massnahme'))));
    if (!topics.length) list.append(ui.el('li', { class: 'mood-empty', text: 'Noch keine Karten auf dem Board.' }));
    if (!$('action-due').value) $('action-due').value = isoPlusDays(board.date, 14);
    $('action-hint').hidden = board.actions.length <= 3;
    $('action-list').replaceChildren(...board.actions.map((a, i) => ui.el('li', { class: 'action-item' },
      ui.el('p', { class: 'action-what', text: (i + 1) + '. ' + a.what }),
      ui.el('p', { class: 'action-meta', text: 'Wer: ' + (a.who || '–') + ' · Bis: ' + (a.due ? core.formatDate(a.due) : '–') }),
      ui.el('div', { class: 'button-row no-print' },
        ui.el('button', {
          type: 'button',
          class: 'button button-ghost',
          onclick: () => {
            B.removeAction(board, a.id);
            commit();
            ui.announce('Massnahme entfernt.');
          },
        }, 'Entfernen')))));
  }

  $('action-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const what = $('action-what').value;
    if (!md.cleanText(what)) {
      ui.announce('Bitte zuerst beschreiben, was ihr konkret tun wollt.', 'warning');
      $('action-what').focus();
      return;
    }
    if (app.privacy && app.privacy.check(what + ' ' + $('action-who').value).length) {
      ui.announce('Hinweis: Das sieht nach Kunden- oder Personendaten aus. Bitte nur Rollen oder Kürzel verwenden.', 'warning');
    }
    B.addAction(board, { what, who: $('action-who').value, due: $('action-due').value });
    $('action-what').value = '';
    $('action-who').value = '';
    commit();
    ui.announce(board.actions.length > 3 ? 'Massnahme hinzugefügt – schon mehr als 3, weniger ist oft mehr.' : 'Massnahme hinzugefügt.');
    $('action-what').focus();
  });

  /* ---------- Abschliessen ---------- */

  const feedbackHistory = [];
  const scale = $('feedback-scale');
  const feedbackCounts = {};
  [1, 2, 3, 4, 5].forEach((score) => {
    const count = ui.el('span', { class: 'feedback-count', text: '0' });
    feedbackCounts[score] = count;
    scale.append(ui.el('button', {
      type: 'button',
      class: 'feedback-option',
      'aria-label': 'Note ' + score + ' von 5 – Stimme hinzufügen',
      onclick: () => {
        B.addFeedback(board, score, 1);
        feedbackHistory.push(score);
        save();
        renderFeedback(score);
      },
    },
    ui.el('span', { class: 'feedback-emoji', 'aria-hidden': 'true', text: FEEDBACK_EMOJI[score] }),
    ui.el('span', { class: 'feedback-score', text: score + ' von 5' }),
    count));
  });

  function renderFeedback(bumped) {
    [1, 2, 3, 4, 5].forEach((s) => {
      const el = feedbackCounts[s];
      el.textContent = String(board.feedback[s] || 0);
      if (s === bumped) {
        el.classList.remove('is-bumped');
        void el.offsetWidth;
        el.classList.add('is-bumped');
      }
    });
    const stats = B.feedbackStats(board);
    $('feedback-stats').textContent = stats.votes
      ? stats.votes + (stats.votes === 1 ? ' Stimme' : ' Stimmen') + ' · Durchschnitt ' + String(stats.average).replace('.', ',') + ' von 5'
      : 'Noch keine Stimmen.';
  }

  $('feedback-undo').addEventListener('click', () => {
    const last = feedbackHistory.pop();
    if (!last) {
      ui.announce('Keine Stimme zum Zurücknehmen.');
      return;
    }
    B.addFeedback(board, last, -1);
    save();
    renderFeedback();
  });

  $('finish').addEventListener('click', () => {
    board.finished = true;
    save();
    if (effects) effects.confetti();
    ui.announce('Danke fürs Mitmachen! 🎉');
    if (app.closing) app.closing.show();
  });

  /* ---------- Timer ---------- */

  const RING = 2 * Math.PI * 52;
  const timer = { duration: 0, remaining: 0, endAt: 0, running: false, handle: null };
  const timerBox = $('timer');

  function formatTime(sec) {
    const s = Math.max(0, Math.round(sec));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  function renderTimer() {
    $('timer-time').textContent = formatTime(timer.remaining);
    const fraction = timer.duration ? timer.remaining / timer.duration : 0;
    $('timer-progress').style.strokeDashoffset = String(RING * (1 - fraction));
    timerBox.classList.toggle('is-ending', timer.remaining > 0 && timer.remaining <= 60 && timer.running);
    timerBox.classList.toggle('is-done', timer.remaining === 0);
    $('timer-toggle').textContent = timer.running ? 'Pause' : timer.remaining === timer.duration ? 'Start' : 'Weiter';
  }

  function stopTimer() {
    clearInterval(timer.handle);
    timer.handle = null;
    timer.running = false;
  }

  function timerReset() {
    stopTimer();
    timer.duration = phaseMinutes(board.phase) * 60;
    timer.remaining = timer.duration;
    renderTimer();
  }

  function beep() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      [0, 0.35].forEach((t) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = 660;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.32);
      });
      setTimeout(() => ctx.close(), 1200);
    } catch (e) {
      /* ohne Ton weiter */
    }
  }

  function tick() {
    timer.remaining = Math.max(0, Math.round((timer.endAt - Date.now()) / 1000));
    if (timer.remaining === 0) {
      stopTimer();
      if (board.sound) beep();
      ui.announce('Die Zeit für «' + config.phases[board.phase].name + '» ist um.', 'warning');
    }
    renderTimer();
  }

  $('timer-toggle').addEventListener('click', () => {
    if (timer.running) {
      tick();
      stopTimer();
    } else {
      if (timer.remaining === 0) timer.remaining = 60;
      timer.endAt = Date.now() + timer.remaining * 1000;
      timer.running = true;
      timer.handle = setInterval(tick, 250);
    }
    renderTimer();
  });
  $('timer-plus').addEventListener('click', () => {
    timer.remaining += 60;
    timer.duration = Math.max(timer.duration, timer.remaining);
    if (timer.running) timer.endAt += 60000;
    renderTimer();
  });
  $('timer-reset').addEventListener('click', timerReset);

  /* ---------- Vollbild ---------- */

  const moderation = $('moderation');
  const fsButton = $('fullscreen');
  if (!document.fullscreenEnabled || !moderation.requestFullscreen) fsButton.hidden = true;
  fsButton.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else moderation.requestFullscreen().catch(() => ui.announce('Vollbild ist in diesem Browser nicht möglich.', 'warning'));
  });
  document.addEventListener('fullscreenchange', () => {
    $('fullscreen-label').textContent = document.fullscreenElement ? 'Vollbild beenden' : 'Vollbild';
  });

  /* ---------- Alles zeichnen ---------- */

  function render() {
    renderContext();
    renderPhase();
    if (board.phase === 0) renderCheckin();
    if (board.phase === 1 || board.phase === 2) renderBoard();
    if (board.phase === 3) renderDecide();
    if (board.phase === 4) renderFeedback();
  }

  function commit() {
    save();
    render();
  }

  // Für Abschluss-Funktionen (Phase 5) in moderieren-abschluss.js
  app.moderation = {
    getBoard: () => board,
    setBoard: (b) => {
      board = b;
      commit();
    },
    save,
    render,
  };

  timerReset();
  render();
  if (board.cards.length) ui.announce('Board wiederhergestellt: ' + board.cards.length + ' Karten.');
})();
