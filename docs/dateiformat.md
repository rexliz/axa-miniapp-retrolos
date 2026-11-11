# RetroLos!-Dateiformat (Version 1)

RetroLos! tauscht Daten ausschliesslich über Markdown-Dateien aus. Sie lassen sich in jedem Texteditor öffnen und lesen. Es gibt zwei Dateitypen:

| Typ | Wer erzeugt sie? | Dateiname |
|---|---|---|
| **Beitrag** | jedes Teammitglied über den Einladungslink | `retro-<retro-id>-beitrag-<4 Zeichen>.md` |
| **Protokoll** | der Scrum Master am Ende der Retro | `retro-<retro-id>-protokoll.md` |

> **Retro-Dateien gehören in den Teams-Kanal bzw. den Team-Ordner, nie ins Git-Repository.** Die `.gitignore` schliesst `retro-*.md` und `retros/` aus. Ausnahme sind nur die fiktiven Beispiele unter [`docs/beispiele/`](beispiele/).

## Aufbau

Jede Datei besteht aus

1. einem **Kopfbereich** (YAML-Frontmatter) zwischen zwei Zeilen mit `---`,
2. **Abschnitten**, die mit `## Überschrift` beginnen.

### Kopfbereich – Regeln

- Eine Angabe pro Zeile: `schlüssel: wert`.
- Zeichenketten mit Leerzeichen, Emojis, `:` gefolgt von Leerzeichen oder `#` stehen in doppelten Anführungszeichen (`"…"`, Escape wie in JSON: `\"`, `\\`). Einfache Anführungszeichen (`'…'`, `''` für ein `'`) werden ebenfalls gelesen.
- Ganze Zahlen ohne Anführungszeichen werden als Zahl gelesen.
- Kommentare beginnen mit `#` – als eigene Zeile oder nach einem Wert (`kuerzel: ""   # freiwillig`).
- `retrolos: 1` ist die **Formatversion**. Dateien mit höherer Version werden mit Hinweis trotzdem gelesen.
- Unbekannte Angaben werden ignoriert, damit neuere Dateien mit älteren App-Versionen funktionieren.

RetroLos! liest den Kopfbereich mit einem eigenen kleinen Parser (keine Bibliothek). Verschachtelte YAML-Strukturen, Listen oder mehrzeilige Werte werden **nicht** unterstützt und sind auch nicht nötig.

## Beitrag

```markdown
---
retrolos: 1
typ: beitrag
retro_id: R-2026-11-12-sprint-12
format: segelboot
wetter: "⛅"
kuerzel: ""   # freiwillig
erstellt: 2026-11-11T16:20
---
## Wind
- Die Pair-Programming-Sessions haben uns schneller gemacht

## Anker
- Zu viele spontane Meetings am Nachmittag
    und ohne Agenda

## Felsen

## Insel
- Release 2.0 ohne Nachtschicht
```

| Angabe | Pflicht | Bedeutung |
|---|---|---|
| `retrolos` | ja | Formatversion, aktuell `1` |
| `typ` | ja | immer `beitrag` |
| `retro_id` | ja | Kennung der Retro, z. B. `R-2026-11-12-sprint-12` (`R-` + Datum + Sprint) |
| `format` | ja | technischer Schlüssel des Formats aus `config.js`, z. B. `segelboot`, `4l`, `start-stop-continue` |
| `wetter` | nein | Check-in-Wetter: `☀️`, `⛅`, `🌧️` oder `⛈️`; leer = nicht gewählt |
| `kuerzel` | nein | freiwilliges Kürzel (max. 12 Zeichen); leer = anonym. Auf dem Board nur sichtbar, wenn der Scrum Master es einschaltet |
| `erstellt` | nein | Zeitpunkt des Speicherns, `JJJJ-MM-TTTHH:MM` (Ortszeit) |

**Abschnitte:** Eine Überschrift pro Spalte des Formats, mit dem **Spaltennamen** aus `config.js` (`## Wind`). Jede Karte ist ein Aufzählungspunkt `- …`. Mehrzeilige Karten setzen die Folgezeilen mit vier Leerzeichen ein. Leere Spalten dürfen fehlen oder leer bleiben.

**Dateiname:** Die vier Zeichen am Ende sind zufällig und bleiben für einen Entwurf gleich. Speichert jemand nach einer Korrektur erneut, entsteht derselbe Dateiname, und im Teams-Ordner ersetzt die neue Version die alte.

## Protokoll

```markdown
---
retrolos: 1
typ: protokoll
retro_id: R-2026-11-12-sprint-12
sprint: "Sprint 12"
format: segelboot
datum: 2026-11-12
beitraege: 5
---
# Retro-Protokoll «Sprint 12»

## Stimmung
- ☀️ 1
- ⛅ 3
- 🌧️ 1
- ⛈️ 0

## Top-Themen
- (5 Punkte) Zu viele spontane Meetings am Nachmittag _(Anker)_
- (3 Punkte) Lange Wartezeit auf Code-Reviews _(Anker)_

## Massnahmen
| Was | Wer | Bis wann | Status |
|---|---|---|---|
| Fokuszeit 13–16 Uhr ohne Meetings | SM | 2026-11-26 | offen |

## Rückblick auf die letzten Massnahmen
| Was | Wer | Bis wann | Status |
|---|---|---|---|
| Daily auf 15 Minuten begrenzen | SM | 2026-11-05 | teilweise |

## Feedback zur Retro
- 5 von 5: 2
- 4 von 5: 3
- 3 von 5: 0
- 2 von 5: 0
- 1 von 5: 0
```

| Angabe | Bedeutung |
|---|---|
| `typ` | immer `protokoll` |
| `retro_id`, `format` | wie beim Beitrag |
| `sprint` | Name des Sprints |
| `datum` | Datum der Retro, `JJJJ-MM-TT` |
| `beitraege` | Anzahl importierter Beiträge |

| Abschnitt | Inhalt |
|---|---|
| `## Stimmung` | ein Punkt pro Wetter: `- <Emoji> <Anzahl>` |
| `## Top-Themen` | `- (<n> Punkte) <Text> _(<Spalte>)_`, nach Punkten sortiert; zusammengefasste Karten mit `/` getrennt |
| `## Massnahmen` | Tabelle *Was · Wer · Bis wann · Status*. «Wer» ist eine Rolle oder ein Kürzel, nie ein voller Name. Status neuer Massnahmen: `offen` |
| `## Rückblick auf die letzten Massnahmen` | optional; Massnahmen der Vor-Retro mit Status `umgesetzt`, `teilweise` oder `nicht umgesetzt` |
| `## Feedback zur Retro` | Stimmen pro Note: `- <1–5> von 5: <Anzahl>` |

In Tabellenzellen wird `|` als `\|` geschrieben. Beim Planen der nächsten Retro liest RetroLos! das Protokoll wieder ein und zeigt alle Massnahmen, deren Status nicht `umgesetzt`, `erledigt` oder `verworfen` ist.

## Regeln beim Import

| Situation | Verhalten |
|---|---|
| Datei einer **anderen Retro-ID** | wird erkannt; die App fragt nach, statt sie still zu übernehmen |
| **dieselbe Datei zweimal** | erkannt über einen Hash des Inhalts (FNV-1a, Zeilenenden egal); nur einmal übernommen |
| **kaputte oder fremde Datei** (kein Kopfbereich, `retrolos:` fehlt, falscher `typ`, Retro-ID fehlt) | verständliche Meldung pro Datei, kein Absturz |
| **unbekannte Spaltenüberschrift** | Karten landen in der Spalte «Sonstiges», mit Hinweis auf die Originalüberschrift |
| **unbekanntes Format** | alle Karten landen in «Sonstiges», mit Hinweis |

Beim Zuordnen der Überschriften spielen Gross-/Kleinschreibung, Umlaute (`ä` = `ae`) und Klammerzusätze keine Rolle: `## Wind (treibt uns an)` und `## wind` gehören beide zur Spalte «Wind». Statt `-` werden auch `*` und `+` als Aufzählungszeichen akzeptiert. Fliesstext unter einer Überschrift wird zu einer Karte. So funktionieren auch von Hand bearbeitete Dateien.

## Einladungslink

Der Einladungslink enthält keine Datei, aber dieselben Kenndaten:

```
https://rexliz.github.io/axa-miniapp-retrolos/teilnehmen.html#einladung=<Base64url>
```

Der Teil nach `#einladung=` ist JSON in Base64url-Kodierung: `{"v":1,"id":"<retro_id>","s":"<sprint>","f":"<format>","d":"<datum>","a":"<abgabetermin>"}`. Er steht im **Hash** der Adresse und wird daher nie an einen Server übertragen.

## Code

Lesen und Schreiben steckt in [`core-markdown.js`](../core-markdown.js) (ohne DOM, ohne Bibliothek), der Einladungslink in [`core-plan.js`](../core-plan.js). Die Tests in [`tests/core-markdown.test.js`](../tests/core-markdown.test.js) prüfen den Rundweg Schreiben → Lesen für Beitrag und Protokoll sowie alle Import-Regeln.
