/* ==========================================================================
   RetroLos! – Planen (Oberfläche)
   Liest die Eingaben, nutzt core-plan.js für alle Berechnungen und speichert
   den Plan im Browser, damit die Moderation ihn später findet.
   ========================================================================== */
(function () {
  'use strict';

  const app = window.RetroLos || {};
  const { config, plan: core, ui, effects } = app;
  const form = document.getElementById('plan-form');
  if (!form || !config || !core || !ui) return;

  const $ = (id) => document.getElementById(id);
  const els = {
    sprint: $('sprint'),
    date: $('date'),
    start: $('start'),
    deadline: $('deadline'),
    minutesChoices: $('minutes-choices'),
    moodChoices: $('mood-choices'),
    focusChoices: $('focus-choices'),
    recommendation: document.querySelector('.recommendation'),
    recommendationBody: document.querySelector('.recommendation-body'),
    formatLabel: $('format-label'),
    formatEmoji: $('format-emoji'),
    formatName: $('format-name'),
    formatReason: $('format-reason'),
    formatRepeat: $('format-repeat'),
    formatExplanation: $('format-explanation'),
    formatColumns: $('format-columns'),
    formatSelect: $('format-select'),
    library: $('format-library'),
    surprise: $('surprise'),
    dice: $('dice'),
    question: $('checkin-question'),
    questionNext: $('checkin-next'),
    agendaBar: $('agenda-bar'),
    agenda: $('agenda'),
    agendaSum: $('agenda-sum'),
    agendaCopy: $('agenda-copy'),
    agendaPrint: $('agenda-print'),
    agendaReset: $('agenda-reset'),
    printTitle: $('print-title'),
    inviteLink: $('invite-link'),
    inviteText: $('invite-text'),
    inviteOpen: $('invite-open'),
    inviteLocalNote: $('invite-local-note'),
    retroId: $('retro-id'),
  };

  const isoPlusDays = (iso, days) => {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + days));
    return date.toISOString().slice(0, 10);
  };
  const tomorrow = isoPlusDays(core.todayIso(), 1);

  const defaults = {
    sprint: '',
    date: tomorrow,
    start: '',
    deadline: isoPlusDays(tomorrow, -1) + 'T17:00',
    deadlineTouched: false,
    minutes: config.defaultDuration,
    mood: 'normal',
    focus: '',
    formatChoice: '',
    choiceSource: '',
    customAgenda: null,
    question: core.randomQuestion(config),
  };
  const saved = ui.storage.get('plan', null);
  const state = Object.assign({}, defaults, saved && saved.input ? saved.input : {});
  if (!core.findFormat(config, state.formatChoice)) state.formatChoice = '';
  const lastFormat = ui.storage.get('letztesFormat', '');

  /* ---------- Auswahl-Elemente aus der Konfiguration ---------- */

  function radio(name, value, content, checked) {
    return ui.el('label', { class: 'choice' },
      ui.el('input', { type: 'radio', name, value, checked }),
      ui.el('span', null, content));
  }

  config.durations.forEach((d) => {
    els.minutesChoices.append(radio('minutes', String(d), d + ' Min.', Number(state.minutes) === d));
  });
  config.moods.forEach((m) => {
    els.moodChoices.append(radio('mood', m.key,
      [ui.el('span', { class: 'choice-emoji', 'aria-hidden': 'true', text: m.emoji }), m.label],
      state.mood === m.key));
  });
  els.focusChoices.append(radio('focus', '', 'Kein besonderer', !state.focus));
  config.focuses.forEach((f) => els.focusChoices.append(radio('focus', f.key, f.label, state.focus === f.key)));

  els.formatSelect.append(ui.el('option', { value: '', text: 'Empfehlung verwenden' }));
  config.formats.forEach((f) => els.formatSelect.append(ui.el('option', { value: f.key, text: f.theme.emoji + ' ' + f.name })));

  config.formats.forEach((f) => {
    els.library.append(ui.el('article', { class: 'library-card' },
      ui.el('h3', null, f.theme.emoji + ' ' + f.name),
      ui.el('p', { text: f.explanation }),
      ui.el('p', { class: 'library-fit', text: 'Passt ' + f.fitsWhen + '.' }),
      ui.el('ul', null, f.columns.map((c) => ui.el('li', null, ui.el('strong', { text: c.name }), ' – ' + c.question))),
      ui.el('button', {
        type: 'button',
        class: 'button button-secondary',
        onclick: () => {
          state.formatChoice = f.key;
          state.choiceSource = 'manual';
          update();
          els.recommendation.scrollIntoView({ behavior: effects && effects.motionOk() ? 'smooth' : 'auto', block: 'center' });
          ui.announce('Format gewählt: ' + f.name);
        },
      }, 'Dieses Format wählen')));
  });

  /* ---------- Agenda-Zeilen (einmal aufbauen, dann nur aktualisieren) ---------- */

  const agendaRows = config.phases.map((phase, i) => {
    const input = ui.el('input', { type: 'number', min: '5', max: '180', step: '5', inputmode: 'numeric' });
    input.addEventListener('input', () => {
      state.customAgenda = agendaRows.map((row) => Math.max(0, Math.round(Number(row.input.value) || 0)));
      update({ skipAgendaInputs: true });
    });
    const time = ui.el('span', { class: 'agenda-time' });
    const li = ui.el('li', { class: 'agenda-row' },
      ui.el('span', { class: 'agenda-num', 'aria-hidden': 'true', text: String(i + 1) }),
      ui.el('div', { class: 'agenda-main' },
        ui.el('strong', { text: phase.name }),
        ui.el('span', { class: 'agenda-hint', text: phase.hint })),
      ui.el('label', { class: 'agenda-minutes' },
        ui.el('span', { class: 'visually-hidden', text: 'Minuten für ' + phase.name }),
        input,
        ui.el('span', { 'aria-hidden': 'true', text: 'Min.' })),
      time);
    els.agenda.append(li);
    const bar = ui.el('span');
    els.agendaBar.append(bar);
    return { input, time, bar };
  });

  /* ---------- Berechnen ---------- */

  function currentFormat() {
    const rec = core.recommendFormat({ mood: state.mood, focus: state.focus, lastFormat }, config);
    const chosen = state.formatChoice ? core.findFormat(config, state.formatChoice) : null;
    return { rec, format: chosen || rec.format, source: chosen ? (state.choiceSource || 'manual') : 'recommendation' };
  }

  function currentAgenda() {
    const base = core.computeAgenda(state.minutes, config.phases);
    if (Array.isArray(state.customAgenda) && state.customAgenda.length === base.length) {
      return base.map((row, i) => Object.assign({}, row, { minutes: state.customAgenda[i] }));
    }
    return base;
  }

  /* ---------- Darstellen ---------- */

  function renderFormat(info) {
    const { rec, format, source } = info;
    els.formatLabel.textContent = source === 'recommendation' ? 'Unsere Empfehlung' : source === 'surprise' ? 'Gewürfelt!' : 'Deine Wahl';
    els.formatEmoji.textContent = format.theme.emoji;
    els.formatName.textContent = format.name;
    els.formatReason.textContent = source === 'recommendation'
      ? rec.reason
      : '«' + format.name + '» passt ' + format.fitsWhen + '.';
    const showRepeat = source === 'recommendation' && rec.avoided;
    els.formatRepeat.hidden = !showRepeat;
    els.formatRepeat.textContent = showRepeat
      ? 'Letztes Mal hattet ihr «' + rec.avoided.name + '» – zur Abwechslung schlagen wir etwas anderes vor.'
      : '';
    els.formatExplanation.textContent = format.explanation;
    els.formatColumns.replaceChildren(...format.columns.map((c) =>
      ui.el('li', null, ui.el('strong', { text: c.name }), c.question)));
    els.formatSelect.value = state.formatChoice;
    els.recommendation.classList.toggle('is-surprise', source === 'surprise');
  }

  function renderAgenda(agenda, options) {
    const timed = core.addTimes(agenda, state.start);
    timed.forEach((row, i) => {
      const r = agendaRows[i];
      if (!(options && options.skipAgendaInputs)) r.input.value = String(row.minutes);
      r.time.textContent = row.from ? row.from + '–' + row.to : '';
      r.bar.style.flexGrow = String(Math.max(1, row.minutes)); // CSSOM ist mit der CSP erlaubt
    });
    const sum = core.sumMinutes(agenda);
    const diff = sum - Number(state.minutes);
    els.agendaSum.dataset.state = diff === 0 ? 'ok' : 'off';
    els.agendaSum.textContent = 'Summe: ' + sum + ' von ' + state.minutes + ' Minuten'
      + (diff === 0 ? ' ✓' : diff > 0 ? ' – ' + diff + ' Minuten zu viel.' : ' – es fehlen ' + (-diff) + ' Minuten.');
    els.question.textContent = state.question;
  }

  function inviteBase() {
    return location.protocol === 'file:' ? config.liveUrl : location.href;
  }

  function update(options) {
    const info = currentFormat();
    const agenda = currentAgenda();
    renderFormat(info);
    renderAgenda(agenda, options);

    const retroId = core.makeRetroId(state.date, state.sprint);
    const invite = { retroId, sprint: state.sprint.trim(), format: info.format.key, date: state.date, deadline: state.deadline };
    const link = core.buildInviteUrl(inviteBase(), invite);
    els.inviteLink.value = link;
    els.inviteText.value = core.inviteText(Object.assign({}, invite, { formatName: info.format.name }), link);
    els.inviteOpen.href = core.buildInviteUrl(location.href, invite);
    els.inviteLocalNote.hidden = location.protocol !== 'file:';
    els.retroId.textContent = retroId;
    els.printTitle.textContent = 'Retro «' + (state.sprint.trim() || 'Sprint') + '»'
      + (state.date ? ' – ' + core.formatDate(state.date, { long: true }) : '')
      + ' · Format: ' + info.format.name;

    ui.storage.set('plan', {
      input: state,
      retroId,
      sprint: invite.sprint,
      date: state.date,
      start: state.start,
      deadline: state.deadline,
      minutes: Number(state.minutes),
      format: info.format.key,
      agenda,
      question: state.question,
      savedAt: new Date().toISOString(),
    });
  }

  /* ---------- Ereignisse ---------- */

  els.sprint.value = state.sprint;
  els.date.value = state.date;
  els.start.value = state.start;
  els.deadline.value = state.deadline;

  form.addEventListener('submit', (event) => event.preventDefault());

  form.addEventListener('input', (event) => {
    const t = event.target;
    if (t === els.sprint) state.sprint = t.value;
    else if (t === els.start) state.start = t.value;
    else if (t === els.deadline) {
      state.deadline = t.value;
      state.deadlineTouched = true;
    } else if (t === els.date) {
      state.date = t.value;
      if (!state.deadlineTouched && /^\d{4}-\d{2}-\d{2}$/.test(t.value)) {
        state.deadline = isoPlusDays(t.value, -1) + 'T17:00';
        els.deadline.value = state.deadline;
      }
    } else if (t.name === 'minutes') {
      state.minutes = Number(t.value);
      state.customAgenda = null;
    } else if (t.name === 'mood' || t.name === 'focus') {
      state[t.name] = t.value;
      state.formatChoice = '';
      state.choiceSource = '';
    } else if (t === els.formatSelect) {
      state.formatChoice = t.value;
      state.choiceSource = t.value ? 'manual' : '';
    } else {
      return;
    }
    update();
  });

  els.surprise.addEventListener('click', async () => {
    const current = currentFormat().format.key;
    const target = core.randomFormat(config, current);
    els.surprise.disabled = true;
    els.recommendation.classList.remove('is-landed');
    els.recommendationBody.setAttribute('aria-busy', 'true');
    await effects.rollDice(els.dice, {
      onTick: () => {
        const f = core.randomFormat(config);
        els.formatEmoji.textContent = f.theme.emoji;
        els.formatName.textContent = f.name;
      },
    });
    state.formatChoice = target.key;
    state.choiceSource = 'surprise';
    update();
    els.recommendationBody.removeAttribute('aria-busy');
    els.recommendation.classList.add('is-landed');
    els.surprise.disabled = false;
  });

  els.questionNext.addEventListener('click', () => {
    state.question = core.randomQuestion(config, state.question);
    update();
  });

  els.agendaReset.addEventListener('click', () => {
    state.customAgenda = null;
    update();
    ui.announce('Zeiten auf die Richtwerte zurückgesetzt.');
  });

  els.agendaCopy.addEventListener('click', async () => {
    const info = currentFormat();
    const text = core.agendaText(state, currentAgenda(), info.format, state.question);
    const ok = await ui.copyText(text);
    ui.announce(ok ? 'Agenda kopiert.' : 'Kopieren hat nicht geklappt.', ok ? 'success' : 'warning');
  });

  els.agendaPrint.addEventListener('click', () => window.print());

  ui.wireCopyButtons(document);
  if (effects) effects.showFace(els.dice, 5);
  update();
})();
