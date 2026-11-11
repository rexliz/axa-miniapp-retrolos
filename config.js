/* ==========================================================================
   RetroLos! – Konfiguration
   Reine Daten, kein Programmcode. Hier kommen neue Formate, Check-in-Fragen
   und Texte dazu, ohne dass sonst etwas geändert werden muss.
   Anleitung «Neues Format hinzufügen»: siehe README.

   Regeln für ein Format:
   - key:      technischer Schlüssel (Kleinbuchstaben, Bindestriche) – steht in
               den .md-Dateien unter «format:» und darf sich nie ändern.
   - columns:  2–6 Spalten; jede mit key (eindeutig), name (Überschrift in der
               .md-Datei) und question (Leitfrage für das Team).
   - theme:    emoji und optional scene: "segelboot" für die animierte Szene.
   ========================================================================== */
(function (root) {
  'use strict';

  const config = {
    // Öffentliche Adresse der App. Einladungslinks zeigen hierhin, wenn der
    // Scrum Master RetroLos! als lokale Datei geöffnet hat.
    liveUrl: 'https://rexliz.github.io/axa-miniapp-retrolos/',

    // Wohin gehört die gespeicherte Datei? Erscheint nach dem Speichern.
    dropHint: 'Lege die Datei in den Teams-Kanal eures Teams (Reiter «Dateien») oder in euren gemeinsamen Team-Ordner. Dein Scrum Master holt sie dort ab.',

    // Agenda: Anteil jeder Phase an der Gesamtzeit (Summe = 1).
    phases: [
      { key: 'einstimmen', name: 'Einstimmen', share: 0.10, hint: 'Check-in-Frage, alle kommen an.' },
      { key: 'sammeln', name: 'Sammeln', share: 0.30, hint: 'Karten zu den Leitfragen zeigen und ergänzen.' },
      { key: 'verstehen', name: 'Verstehen', share: 0.25, hint: 'Besprechen, gruppieren, Punkte vergeben.' },
      { key: 'entscheiden', name: 'Entscheiden', share: 0.25, hint: '1–3 Massnahmen mit Wer und Bis wann.' },
      { key: 'abschliessen', name: 'Abschliessen', share: 0.10, hint: 'Feedback zur Retro, Dank ans Team.' },
    ],

    durations: [30, 45, 60, 90],
    defaultDuration: 60,

    // Teamstimmung → passende Formate (Reihenfolge = Vorrang).
    // reason: ein Satz, {format} wird durch den Formatnamen ersetzt.
    moods: [
      { key: 'stressig', label: 'Stressiger Sprint', emoji: '😮‍💨', formats: ['mad-sad-glad', 'segelboot'],
        reason: '«{format}» passt nach einem stressigen Sprint, weil es Frust und Bremsklötze offen auf den Tisch bringt' },
      { key: 'normal', label: 'Normal', emoji: '🙂', formats: ['4l', 'start-stop-continue'],
        reason: '«{format}» passt zu einem normalen Sprint, weil es ausgewogen nach Gutem und nach Verbesserungen fragt' },
      { key: 'super', label: 'Super gelaufen', emoji: '🚀', formats: ['seestern', 'kalm'],
        reason: '«{format}» passt nach einem super Sprint, weil es hilft, Bewährtes bewusst zu behalten und gezielt auszubauen' },
      { key: 'neues-team', label: 'Neues Team', emoji: '🌱', formats: ['start-stop-continue'],
        reason: '«{format}» passt für ein neues Team, weil die drei Fragen einfach und sofort verständlich sind' },
    ],

    // Optionaler Fokus. phrase ergänzt den Begründungssatz.
    focuses: [
      { key: 'zusammenarbeit', label: 'Zusammenarbeit', phrase: 'die Zusammenarbeit im Team' },
      { key: 'tempo', label: 'Tempo', phrase: 'euer Tempo und was euch bremst' },
      { key: 'qualitaet', label: 'Qualität', phrase: 'die Qualität eurer Arbeit' },
    ],

    // Check-in-Wetter (Reihenfolge = von gut nach schlecht).
    weather: [
      { emoji: '☀️', label: 'Sonnig – läuft super' },
      { emoji: '⛅', label: 'Wechselhaft – ganz okay' },
      { emoji: '🌧️', label: 'Regnerisch – eher zäh' },
      { emoji: '⛈️', label: 'Gewitter – schwierig' },
    ],

    checkinQuestions: [
      'Beschreibe den Sprint in einem Emoji.',
      'Wenn der Sprint ein Wetter wäre – welches?',
      'Welcher Song passt zu diesem Sprint?',
      'Was war dein persönlicher Höhepunkt im Sprint?',
      'Wie voll ist dein Akku gerade – von 1 bis 10?',
      'Wenn der Sprint ein Film wäre, wie hiesse er?',
      'Welches Tier beschreibt deine Woche am besten?',
      'Was hast du in diesem Sprint zum ersten Mal gemacht?',
      'Worüber hast du im Sprint gelacht?',
      'Wofür möchtest du dich bei jemandem im Team bedanken?',
      'Beschreibe den Sprint in drei Worten.',
      'Welche Schlagzeile hätte unser Sprint in der Zeitung?',
      'Was nimmst du heute mit in den Feierabend?',
      'Was hat dich im Sprint überrascht?',
      'Wenn der Sprint ein Gericht wäre – welches?',
    ],

    // Auffangspalte für unbekannte Überschriften beim Import.
    otherColumn: { key: 'sonstiges', name: 'Sonstiges', question: 'Karten aus Spalten, die dieses Format nicht kennt.' },

    formats: [
      {
        key: 'start-stop-continue',
        name: 'Start / Stop / Continue',
        explanation: 'Drei einfache Fragen: Was sollten wir neu anfangen, was lassen und was beibehalten? Ideal zum Einstieg.',
        fitsWhen: 'für neue Teams, kurze Retros und wenn es schnell konkret werden soll',
        focus: ['tempo', 'zusammenarbeit'],
        theme: { emoji: '🚦' },
        columns: [
          { key: 'starten', name: 'Starten', question: 'Was sollten wir neu ausprobieren oder anfangen?' },
          { key: 'stoppen', name: 'Stoppen', question: 'Was sollten wir bleiben lassen, weil es uns bremst?' },
          { key: 'weitermachen', name: 'Weitermachen', question: 'Was läuft gut und soll so bleiben?' },
        ],
      },
      {
        key: 'mad-sad-glad',
        name: 'Mad / Sad / Glad',
        explanation: 'Das Team sortiert seine Erlebnisse nach Gefühlen. Das schafft Raum für Frust und Freude, bevor es um Lösungen geht.',
        fitsWhen: 'nach stressigen Sprints oder wenn Stimmung und Gefühle im Raum stehen',
        focus: ['zusammenarbeit'],
        theme: { emoji: '🎭' },
        columns: [
          { key: 'aergerlich', name: 'Ärgerlich', question: 'Was hat dich geärgert oder frustriert?' },
          { key: 'traurig', name: 'Traurig', question: 'Was hat dich enttäuscht oder was hast du vermisst?' },
          { key: 'froh', name: 'Froh', question: 'Was hat dich gefreut oder stolz gemacht?' },
        ],
      },
      {
        key: '4l',
        name: '4L',
        explanation: 'Vier Blickwinkel auf den Sprint: Was hat gefallen, was haben wir gelernt, was hat gefehlt und was wünschen wir uns?',
        fitsWhen: 'für normale Sprints und wenn Lernen und Qualität im Fokus stehen',
        focus: ['qualitaet', 'zusammenarbeit'],
        theme: { emoji: '📝' },
        columns: [
          { key: 'gefallen', name: 'Gefallen', question: 'Was hat dir gefallen?' },
          { key: 'gelernt', name: 'Gelernt', question: 'Was hast du gelernt?' },
          { key: 'gefehlt', name: 'Gefehlt', question: 'Was hat dir gefehlt?' },
          { key: 'gewuenscht', name: 'Gewünscht', question: 'Was wünschst du dir für den nächsten Sprint?' },
        ],
      },
      {
        key: 'segelboot',
        name: 'Segelboot',
        explanation: 'Euer Team ist ein Segelboot auf dem Weg zur Insel. Wind treibt euch an, Anker bremsen, Felsen sind Risiken auf dem Weg.',
        fitsWhen: 'wenn das Team ein gemeinsames Ziel hat oder ein Sprint zäh war',
        focus: ['tempo', 'zusammenarbeit'],
        theme: { emoji: '⛵', scene: 'segelboot' },
        columns: [
          { key: 'wind', name: 'Wind', question: 'Was treibt uns an?' },
          { key: 'anker', name: 'Anker', question: 'Was bremst uns?' },
          { key: 'felsen', name: 'Felsen', question: 'Welche Risiken liegen vor uns?' },
          { key: 'insel', name: 'Insel', question: 'Wo wollen wir hin – was ist unser Ziel?' },
        ],
      },
      {
        key: 'seestern',
        name: 'Seestern',
        explanation: 'Fünf Arme für feine Abstufungen: mehr davon, weniger davon, beibehalten, aufhören, anfangen.',
        fitsWhen: 'nach guten Sprints, um Bewährtes gezielt nachzujustieren',
        focus: ['qualitaet', 'tempo'],
        theme: { emoji: '⭐' },
        columns: [
          { key: 'mehr', name: 'Mehr davon', question: 'Wovon wollen wir mehr?' },
          { key: 'weniger', name: 'Weniger davon', question: 'Wovon wollen wir weniger?' },
          { key: 'beibehalten', name: 'Beibehalten', question: 'Was soll genau so bleiben?' },
          { key: 'aufhoeren', name: 'Aufhören', question: 'Womit sollten wir ganz aufhören?' },
          { key: 'anfangen', name: 'Anfangen', question: 'Was sollten wir neu anfangen?' },
        ],
      },
      {
        key: 'kalm',
        name: 'KALM',
        explanation: 'Keep, Add, Less, More: Was behalten wir, was kommt dazu, wovon machen wir weniger, wovon mehr? Ruhig und konstruktiv.',
        fitsWhen: 'wenn es gut läuft und das Team an Stellschrauben drehen will',
        focus: ['qualitaet', 'zusammenarbeit'],
        theme: { emoji: '🧘' },
        columns: [
          { key: 'beibehalten', name: 'Beibehalten', question: 'Was sollen wir behalten?' },
          { key: 'hinzufuegen', name: 'Hinzufügen', question: 'Was sollten wir neu dazunehmen?' },
          { key: 'weniger', name: 'Weniger', question: 'Wovon sollten wir weniger machen?' },
          { key: 'mehr', name: 'Mehr', question: 'Wovon sollten wir mehr machen?' },
        ],
      },
    ],
  };

  if (typeof module === 'object' && module.exports) {
    module.exports = config;
  } else {
    root.RetroLos = root.RetroLos || {};
    root.RetroLos.config = config;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
