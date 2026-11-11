# Spec – Planen und Einladen

| Feld | Wert |
|---|---|
| ID | `002-planen-einladen` |
| Status | implemented |
| Owner | ZHAW-Team (konkrete Person folgt) |
| Zuletzt geändert | 2026-11-11 |

## 1. Zweck

Die Vorbereitung einer Retro kostet Zeit, und Teams greifen aus Bequemlichkeit immer zum selben Format. Der Planungsassistent nimmt dem Scrum Master das ab: Er empfiehlt nach Stimmung und Fokus ein passendes Format mit Begründung, erstellt eine Agenda mit Zeiten und erzeugt einen Einladungslink samt Text für den Teams-Chat. «Überrasch mich!» bringt Abwechslung.

## 2. Rollen

| Rolle | Beschreibung | Braucht |
|---|---|---|
| Scrum Master | bereitet die Retro vor | Format, Agenda, Einladung in wenigen Minuten |
| Teammitglied | erhält die Einladung | verständlichen Text mit Link und Abgabetermin |

## 3. User Stories

| ID | Story |
|---|---|
| US-1 | Als Scrum Master will ich Sprint, Datum, Zeit, Stimmung, Fokus und Abgabetermin eingeben, damit die Planung zu unserer Lage passt. |
| US-2 | Als Scrum Master will ich ein empfohlenes Format mit kurzer Begründung sehen. |
| US-3 | Als Scrum Master will ich eine Agenda mit Zeiten für die 5 Phasen, die ich anpassen kann. |
| US-4 | Als Scrum Master will ich mit «Überrasch mich!» ein zufälliges Format würfeln. |
| US-5 | Als Scrum Master will ich Einladungslink und Einladungstext mit einem Klick kopieren. |
| US-6 | Als Scrum Master will ich die Agenda als Text kopieren und drucken. |
| US-7 | Als Team will ich neue Formate ohne Codeänderung ergänzen können. |

## 4. Akzeptanzkriterien

| ID | Story | Gegeben | Wenn | Dann |
|---|---|---|---|---|
| AC-1 | US-1 | die Planungsseite | ich sie öffne | kann ich Sprint, Datum, Beginn, Abgabetermin, Zeit (30/45/60/90), Stimmung (4 Optionen) und optional einen Fokus wählen |
| AC-2 | US-2 | Stimmung «stressig» | ich sie wähle | wird «Mad / Sad / Glad» oder «Segelboot» empfohlen, mit einem Satz Begründung |
| AC-3 | US-2 | Stimmung «stressig» und Fokus «Tempo» | ich beides wähle | wird «Segelboot» empfohlen und die Begründung nennt den Fokus |
| AC-4 | US-3 | 60 oder 90 Minuten | ich die Zeit wähle | zeigt die Agenda 5 Phasen nach 10/30/25/25/10 %, auf 5 Minuten gerundet, Summe = Gesamtzeit |
| AC-5 | US-3 | eine Agenda | ich eine Phasendauer ändere | aktualisieren sich Uhrzeiten und Summe; weicht die Summe ab, steht ein Hinweis da |
| AC-6 | US-4 | ein gewähltes Format | ich «Überrasch mich!» klicke | rollt ein Würfel (ohne Animation bei reduzierter Bewegung) und ein anderes Format erscheint |
| AC-7 | US-5 | ausgefüllte Eckdaten | ich «Link kopieren» oder «Text kopieren» klicke | liegt der Link `…/teilnehmen.html#einladung=…` bzw. der Einladungstext mit Abgabetermin in der Zwischenablage |
| AC-8 | US-5 | ein Einladungslink | er dekodiert wird | ergeben sich exakt Retro-ID, Sprint, Format, Datum und Abgabetermin (Test) |
| AC-9 | US-6 | eine Agenda | ich «Druckansicht» wähle | zeigt die Druckvorschau nur Titel, Check-in-Frage und Agenda, hell |
| AC-10 | US-7 | ein neues Format in `config.js` | ich die Seite neu lade | erscheint es in Auswahl, Bibliothek und «Überrasch mich!»; `node --test` prüft die Konfiguration |

## 5. Nicht-Ziele

- Import des letzten Protokolls (Phase 5)
- Teilnahme über den Link (Phase 3)

## 6. Offene Fragen

| # | Frage | Blockierend? | Owner |
|---|---|---|---|
| Q1 | Soll der Abgabetermin Wochenenden überspringen? | nein | Team |
