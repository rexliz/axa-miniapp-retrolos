# Spec – Teilnehmen und Dateiformat

| Feld | Wert |
|---|---|
| ID | `003-teilnehmen-dateiformat` |
| Status | implemented |
| Owner | ZHAW-Team (konkrete Person folgt) |
| Zuletzt geändert | 2026-11-11 |

## 1. Zweck

Ohne Server muss jedes Teammitglied seine Karten selbst als Datei abgeben. Der Teilnahmemodus macht das einfach: Link öffnen, Wetter wählen, Karten schreiben, Vorschau ansehen, Datei speichern, in den Teams-Kanal legen. Ein lesbares, versioniertes Markdown-Format macht die Dateien für Menschen und für den späteren Import verständlich.

## 2. Rollen

| Rolle | Beschreibung | Braucht |
|---|---|---|
| Teammitglied | gibt Karten ab, oft am Handy | klare Anleitung, Anonymität, Kontrolle über die Datei |
| Scrum Master | importiert später | Dateien in einem verlässlichen Format |

## 3. User Stories

| ID | Story |
|---|---|
| US-1 | Als Teammitglied will ich über den Link direkt Sprint, Format, Abgabetermin und die Leitfragen sehen. |
| US-2 | Als Teammitglied will ich ein Check-in-Wetter wählen und Karten schreiben, bearbeiten und löschen. |
| US-3 | Als Teammitglied will ich beim Segelboot dieselbe animierte Szene wie der Scrum Master sehen. |
| US-4 | Als Teammitglied will ich, dass mein Entwurf bis zum Download erhalten bleibt. |
| US-5 | Als Teammitglied will ich vor dem Speichern sehen, was ich weitergebe, und danach wissen, wohin die Datei gehört. |
| US-6 | Als Team will ich eine dokumentierte, versionierte Dateispezifikation. |

## 4. Akzeptanzkriterien

| ID | Story | Gegeben | Wenn | Dann |
|---|---|---|---|---|
| AC-1 | US-1 | ein gültiger Einladungslink | ich ihn öffne (auch über die Startseite) | lande ich im Teilnahmemodus mit Sprint, Format, Retro-Datum, Abgabetermin, Format-Erklärung und Leitfragen |
| AC-2 | US-1 | ein kaputter Link oder keiner | ich die Seite öffne | sehe ich eine verständliche Meldung bzw. die Anleitung und kann einen Link einfügen |
| AC-3 | US-2 | der Teilnahmemodus | ich ☀️ ⛅ 🌧️ ⛈️ wähle und Karten hinzufüge, bearbeite, lösche | wird alles sofort angezeigt; Enter fügt hinzu, Shift+Enter macht eine neue Zeile |
| AC-4 | US-3 | Format Segelboot | ich Wind-, Anker- und Felsen-Karten schreibe | fährt das Boot pro Wind-Karte weiter, ein Anker und Felsen erscheinen (ohne Animation bei reduzierter Bewegung) |
| AC-5 | US-4 | ein Entwurf | ich die Seite neu lade | sind Wetter, Karten und Kürzel wieder da; nach dem Download ist der Entwurf gelöscht |
| AC-6 | US-5 | mindestens eine Karte | ich «Meine Karten als .md speichern» klicke | sehe ich eine Vorschau mit Dateiname und Inhalt; nach «Datei speichern» wird `retro-<id>-beitrag-xxxx.md` heruntergeladen, eine Anleitung und eine Danke-Animation erscheinen |
| AC-7 | US-6 | `docs/dateiformat.md` | ich sie lese | finde ich Kopfbereich, Abschnitte, Protokoll, Import-Regeln und Beispiele |
| AC-8 | US-6 | Beitrag und Protokoll | sie geschrieben und wieder gelesen werden | ergeben sich dieselben Daten (Tests) |
| AC-9 | – | kaputte, fremde Dateien oder unbekannte Spalten | sie gelesen werden | gibt es eine Meldung bzw. «Sonstiges», nie einen Absturz (Tests) |
| AC-10 | – | `docs/beispiele/` | die Tests laufen | sind 4 Beiträge und 1 Protokoll gültig und als fiktiv markiert |

## 5. Nicht-Ziele

- Import auf dem Board (Phase 4), Datenschutz-Wächter (Phase 5)
- Direktes Hochladen in Teams (kein externer Dienst)

## 6. Offene Fragen

| # | Frage | Blockierend? | Owner |
|---|---|---|---|
| Q1 | Sollen mehrere Versionen derselben Person (gleiche 4 Zeichen) beim Import automatisch ersetzt werden? | nein | Team |
