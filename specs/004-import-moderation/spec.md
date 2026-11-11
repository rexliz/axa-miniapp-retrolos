# Spec – Import und Moderieren

| Feld | Wert |
|---|---|
| ID | `004-import-moderation` |
| Status | implemented |
| Owner | ZHAW-Team (konkrete Person folgt) |
| Zuletzt geändert | 2026-11-11 |

## 1. Zweck

Der Scrum Master holt alle Beitragsdateien aus dem Teams-Ordner, führt sie auf einem Board zusammen und moderiert die Retro per Bildschirm-Teilen durch die fünf Phasen – mit grosser Schrift, Timer und klarer Führung. Import-Regeln verhindern, dass fremde, doppelte oder kaputte Dateien die Retro stören.

## 2. Rollen

| Rolle | Beschreibung | Braucht |
|---|---|---|
| Scrum Master | moderiert und teilt den Bildschirm | schnellen Import, Überblick, einfache Bedienung auch per Tastatur |
| Team | schaut im geteilten Bildschirm zu | gut lesbare Karten, nachvollziehbarer Ablauf |

## 3. User Stories

| ID | Story |
|---|---|
| US-1 | Als Scrum Master will ich viele .md-Dateien auf einmal importieren (Auswahl, Drag & Drop, Ordner). |
| US-2 | Als Scrum Master will ich sehen, was übernommen, doppelt, fremd oder fehlerhaft war, und bei fremden Dateien selbst entscheiden. |
| US-3 | Als Scrum Master will ich per Stepper, Knöpfen oder Pfeiltasten durch die 5 Phasen gehen, mit Timer pro Phase. |
| US-4 | Als Team wollen wir beim Einstimmen die Check-in-Frage und die Wetterverteilung sehen. |
| US-5 | Als Scrum Master will ich Karten einblenden, ergänzen, bearbeiten, löschen und verschieben (Maus und Tastatur). |
| US-6 | Als Team wollen wir ähnliche Karten gruppieren und Punkte vergeben; die Karten sortieren sich danach. |
| US-7 | Als Team wollen wir aus den wichtigsten Karten 1–3 Massnahmen mit Was, Wer, Bis wann festlegen. |
| US-8 | Als Team wollen wir die Retro mit Feedback 1–5 abschliessen. |

## 4. Akzeptanzkriterien

| ID | Story | Gegeben | Wenn | Dann |
|---|---|---|---|---|
| AC-1 | US-1 | die Seite «Moderieren» | ich mehrere Dateien wähle, hineinziehe oder (Desktop) einen Ordner wähle | werden alle .md-Dateien gelesen; andere Dateien werden ignoriert |
| AC-2 | US-2 | ein Import | er fertig ist | zeigt der Bericht Anzahl Beiträge/Karten, Duplikate, Dateien anderer Retros (mit «Trotzdem übernehmen»/«Ignorieren»), Fehler pro Datei und erkannte Protokolle |
| AC-3 | US-3 | die Moderation | ich «Weiter»/«Zurück», den Stepper oder ← → nutze | wechselt die Phase; der Timer stellt sich auf die geplante Dauer |
| AC-4 | US-3 | ein laufender Timer | die letzte Minute beginnt / die Zeit um ist | wechselt die Ringfarbe; optional ertönt ein dezenter Ton (standardmässig aus) |
| AC-5 | US-4 | importierte Beiträge | ich in «Einstimmen» bin | sehe ich die Check-in-Frage gross und animierte Balken je Wetter |
| AC-6 | US-5 | Phase «Sammeln» | ich sie betrete | erscheinen die Karten nacheinander; beim Segelboot fährt das Boot pro Wind-Karte weiter |
| AC-7 | US-5 | eine Karte | ich sie per Drag & Drop oder Menü ⋯ verschiebe, bearbeite oder lösche | wird das Board sofort aktualisiert und gespeichert |
| AC-8 | US-6 | Phase «Verstehen» | ich Karten auswähle und zusammenfasse bzw. + / − klicke | entsteht eine Gruppe mit summierten Punkten; nach kurzer Pause sortieren sich die Karten animiert |
| AC-9 | US-7 | Phase «Entscheiden» | ich ein Top-Thema übernehme und Wer/Bis wann ergänze | erscheint die Massnahme; ab der 4. erscheint ein freundlicher Hinweis |
| AC-10 | US-8 | Phase «Abschliessen» | ich Noten 1–5 klicke und «Retro abschliessen» wähle | zählen die Zähler hoch und Konfetti erscheint (nicht bei reduzierter Bewegung) |
| AC-11 | – | ein Board | ich die Seite neu lade | ist alles wieder da (localStorage); ohne Speicher funktioniert die App trotzdem |
| AC-12 | – | ein geteilter Bildschirm | ich «Vollbild» wähle | zeigt der Browser nur die Moderation in grosser Schrift |

## 5. Nicht-Ziele

- Protokoll, Teams-Zusammenfassung, Druck, Löschen, Datenschutz-Wächter (Phase 5)
- Live-Synchronisation zwischen Geräten

## 6. Offene Fragen

| # | Frage | Blockierend? | Owner |
|---|---|---|---|
| Q1 | Sollen Punkte pro Person begrenzt werden (Dot-Voting mit z. B. 3 Punkten)? Aktuell zählt der Scrum Master frei. | nein | Team |
