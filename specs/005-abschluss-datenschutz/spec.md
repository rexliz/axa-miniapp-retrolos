# Spec – Abschliessen und Datenschutz-Wächter

| Feld | Wert |
|---|---|
| ID | `005-abschluss-datenschutz` |
| Status | implemented |
| Owner | ZHAW-Team (konkrete Person offen) |
| Zuletzt geändert | 2026-11-11 |

## 1. Zweck

Massnahmen gehen nach der Retro oft vergessen. Das Protokoll als `.md`-Datei schliesst den Kreis: Es wird bei der nächsten Retro wieder importiert, und die offenen Massnahmen erscheinen mit der Frage «Umgesetzt?». Eine Zusammenfassung für den Teams-Chat, eine Druckansicht und das Löschen aller Browserdaten runden den Abschluss ab. Der Datenschutz-Wächter weist früh und freundlich auf Kunden- oder Personendaten hin (Governance by Design).

## 2. User Stories

| ID | Story |
|---|---|
| US-1 | Als Scrum Master will ich das Retro-Protokoll als `.md` speichern. |
| US-2 | Als Scrum Master will ich beim Planen das letzte Protokoll importieren und je offene Massnahme «Ja / Teilweise / Nein» festhalten. |
| US-3 | Als Scrum Master will ich eine kompakte Zusammenfassung für den Teams-Chat kopieren und das Protokoll drucken. |
| US-4 | Als Person am geteilten Gerät will ich alle RetroLos!-Daten im Browser löschen. |
| US-5 | Als Teammitglied und Scrum Master will ich einen Hinweis sehen, wenn ein Text nach Kunden- oder Personendaten aussieht. |

## 3. Akzeptanzkriterien

| ID | Story | Gegeben | Wenn | Dann |
|---|---|---|---|---|
| AC-1 | US-1 | Phase «Abschliessen» | ich «Retro-Protokoll als .md speichern» klicke | wird `retro-<id>-protokoll.md` mit Stimmung, Top-Themen, Massnahmen, Rückblick und Feedback heruntergeladen |
| AC-2 | US-2 | ein Protokoll | ich es auf «Planen» importiere | erscheinen die offenen Massnahmen mit «Ja / Teilweise / Nein»; der Sprint wird hochgezählt, das letzte Format nicht wieder empfohlen |
| AC-3 | US-2 | beantwortete Massnahmen | ich moderiere | zeigt «Entscheiden» den Rückblick mit «Wieder aufnehmen»; das neue Protokoll enthält den Rückblick |
| AC-4 | US-3 | Phase «Abschliessen» | ich «Für Teams-Chat kopieren» bzw. «Druckansicht» wähle | liegt die Zusammenfassung in der Zwischenablage bzw. druckt nur das Protokoll (hell) |
| AC-5 | US-4 | Daten im Browser | ich «Alle Daten in diesem Browser löschen» bestätige | sind alle `retrolos:`-Einträge weg |
| AC-6 | US-5 | ein Eingabefeld | ich E-Mail, Telefonnummer, IBAN, AHV-Nummer oder eine lange Nummer tippe | erscheint ein nicht blockierender Hinweis; normale Texte, Daten und Versionsnummern lösen keinen aus (Tests) |
| AC-7 | US-5 | importierte Dateien | eine Karte auffällig ist | wird sie markiert und im Import-Bericht gezählt; die Vorschau beim Teilnehmen warnt |
| AC-8 | – | der Ablauf planen → teilnehmen → importieren → moderieren → Protokoll → Protokoll bei neuer Retro importieren | er auf der Live-URL läuft | gibt es keine Konsolenfehler und keine Anfragen an fremde Server |

## 4. Nicht-Ziele

- Vollständiger Schutz: Namen und umschriebene Kundendaten erkennt der Wächter nicht (README).
