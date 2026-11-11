# Template-Feedback aus dem ersten Praxistest (RetroLos!)

RetroLos! ist die erste echte Mini-App auf Stefans Template für statische Seiten auf GitHub Pages.
Diese Datei hält jede Lücke fest, sobald sie auftaucht – nicht erst am Schluss.
Der unveränderte Template-Stand ist Commit `fdcb416`; `git diff fdcb416` zeigt alle Änderungen.

## Kennzahlen

| Kennzahl | Wert |
|---|---|
| Start | 2026-11-11, 08:44 Uhr |
| Erster erfolgreicher Live-Deploy | 2026-11-11, 09:27 Uhr – **43 Minuten** nach dem Start (davon rund 30 Minuten Warten auf Entscheide des Teams; reine Arbeitszeit etwa 13 Minuten) |
| Manuelle Schritte ausserhalb des Templates | 4 (Stand Phase 1, Liste unten) |

Manuelle Schritte, die das Template nicht beschreibt:

1. Git-Repository anlegen und Template-Stand committen (`git init -b main`, Erst-Commit) – der Ordner kam als ZIP.
2. Git-Identität nur für dieses Repo setzen, mit GitHub-Noreply-Adresse.
3. GitHub-Anmeldung im Terminal prüfen und für `git` einrichten (`gh auth status`, `gh auth setup-git`).
4. Eigenes Repository anlegen und pushen (`gh repo create … --source=. --remote=origin --push`).

## Fazit

_Folgt in Phase 7._

## Lücken

Auswirkung: **blockierend** (ohne Hilfe geht es nicht weiter) · **störend** (kostet Zeit oder Nerven) · **Schönheitsfehler**.

| Nr | Wo (Datei / Schritt) | Problem | Auswirkung | Vorschlag | Status |
|---|---|---|---|---|---|
| 1 | README «Quick Start», Schritt 1 | «Clone or fork» – kein Weg für den häufigsten Laien-Fall «ZIP heruntergeladen» (kein Git, kein Remote) und keiner, um ein *eigenes* Repository anzulegen. Ein «Use this template»-Weg wird nicht erwähnt. | blockierend | Repo auf GitHub als «Template repository» markieren, Schritt 1 = «Use this template → Create a new repository». Für den ZIP-Fall die Befehlsfolge `git init -b main` → Erst-Commit → `gh repo create <owner>/<name> --public --source=. --remote=origin --push` angeben. | offen – Entscheid Stefan |
| 2 | README Schritt 2 / `deploy.yml` | Wird gepusht, bevor Pages auf «GitHub Actions» steht, scheitert der erste Workflow-Lauf mit «Get Pages site failed … Not Found» (beobachtet in Lauf 42985971070). Für Laien sieht das wie ein Defekt aus. | störend | Im README klarstellen: zuerst Pages einschalten, dann pushen; CLI-Variante `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow` nennen. Im Workflow vor `configure-pages` einen Schritt mit verständlicher Meldung einbauen. | offen – Entscheid Stefan |
| 3 | `.github/workflows/deploy.yml` | Alle vier Actions sind eine bis drei Major-Versionen alt (`checkout@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4`) und laufen auf dem abgekündigten Node 20. | störend | Auf `checkout@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5` anheben; Dependabot für `github-actions` einrichten. | behoben in RetroLos! (`33dd04a`) |
| 4 | `deploy.yml` / AGENTS.md «Deployment» | `touch .nojekyll` ist wirkungslos: Mit der Quelle «GitHub Actions» läuft kein Jekyll, und `upload-pages-artifact` lädt ab v4 Dotfiles gar nicht hoch. Die Begründung in AGENTS.md stimmt so nicht. | Schönheitsfehler | Schritt und Absatz streichen. Geprüft nach dem ersten Deploy: `specs/_template/spec.md` liefert HTTP 200, obwohl `.nojekyll` gar nicht im Artefakt ist. | offen – Entscheid Stefan |
| 5 | README / AGENTS.md | Nötige Werkzeuge (git, gh, Browser) und ihre Einrichtung fehlen: Anmeldung (`gh auth login`, `gh auth setup-git`) und Git-Identität. Ohne globale Identität bricht der erste Commit ab oder trägt den Rechnernamen ein. Dass man die eigene E-Mail-Adresse mit der Noreply-Adresse schützt, steht nirgends. | blockierend | Abschnitt «Einmalige Einrichtung» mit Befehlen, inkl. `git config --local user.email <id>+<login>@users.noreply.github.com`. | offen – Entscheid Stefan |
| 6 | AGENTS.md «Commands» | Kein Test-Setup («TODO»), und der Workflow prüft vor dem Deploy nichts. | störend | `node --test "tests/*.test.js"` ohne `package.json` als Konvention, Testschritt im Workflow vor dem Upload. Achtung: Die Ordner-Form `node --test tests/` geht erst ab Node 26 und liess den ersten Lauf auf Node 24 scheitern; der Glob in Anführungszeichen geht ab Node 22. | behoben in RetroLos! (`e9f60b6`, korrigiert in `85b8f9d`) |
| 7 | Template allgemein | Kein Steckbrief für die Mini-App-Liste (Name, Zweck, Owner, Datenarten, Weg «Solo Workout»), obwohl jede Mini-App dort eingetragen werden muss. | störend | Vorlage `miniapp.md` mit YAML-Frontmatter mitliefern. | offen – Entscheid Stefan (RetroLos! legt eine an) |
| 8 | Template allgemein | Kein Datenschutz-Baustein: keine Regel «keine Kunden- oder Personendaten» (Kern von Lösung 1), kein Prototyp-Banner, keine CSP-Empfehlung, kein Hinweis, dass interne Daten (Exporte, Team-Feedback) nicht ins öffentliche Repo gehören. | störend | Banner-Snippet und CSP-Meta-Tag in AGENTS.md; `.gitignore`-Abschnitt für interne Datendateien. | teilweise behoben in RetroLos! (`c889875` `.gitignore`, `7c2ac9f` Banner und CSP) |
| 9 | README «Three Rules That Matter» | Die Überschrift nennt drei Regeln, darunter stehen vier. | Schönheitsfehler | «Four Rules That Matter». | offen – Entscheid Stefan |
| 10 | AGENTS.md «Language» | «English for code, identifiers, file names, and documentation» passt schlecht zu deutschsprachigen AXA-Teams. Zur Sprache der Oberfläche sagt das Template nichts. | störend | Doku-Sprache pro Mini-App entscheiden lassen; UI-Sprache ausdrücklich regeln. | offen – Entscheid Stefan (RetroLos!: Doku Deutsch, E4) |
| 11 | AGENTS.md «Layout» | «Flat, no nesting» – unklar, ob Ordner wie `docs/` und `tests/` erlaubt sind (das Template hat selbst `specs/`). | Schönheitsfehler | Präzisieren: flach gilt für Seiten und Assets, Ordner für Doku, Tests und Specs sind erlaubt. | offen – Entscheid Stefan |
| 12 | AGENTS.md «Stack» | «Every page must render … with JavaScript disabled» – Mini-Apps sind fast immer interaktive Werkzeuge (Formulare, Board, Timer). Es fehlt eine Regel, was ohne JavaScript mindestens funktionieren muss. | störend | Umformulieren: Inhalte, Erklärungen und Navigation ohne JavaScript; Werkzeug-Funktionen dürfen JavaScript brauchen, mit `<noscript>`-Hinweis. | offen – Entscheid Stefan (RetroLos!: E13) |
| 13 | AGENTS.md «Allowed file types» | `.json` (Steckbrief, Konfiguration), `.ico` und `.webmanifest` sind nicht erlaubt. | Schönheitsfehler | `.json` und `.webmanifest` zulassen oder den Ausschluss begründen. | offen – Entscheid Stefan |
| 14 | AGENTS.md «Workflow» | PR-Pflicht, aber Merge-Strategie und Freigaben sind «TODO». Für Laien ist der PR-Ablauf eine grosse Hürde, und live geht es erst nach dem Merge. | störend | Für Solo-Workouts einen einfachen Standard festlegen, z. B. ein PR pro Feature, Merge-Commit, selbst mergen erlaubt. | offen – Entscheid Stefan |
| 15 | `.gitignore` | `.vscode/` wird komplett ignoriert – empfohlene Extensions (`.vscode/extensions.json`) lassen sich nicht im Team teilen. | Schönheitsfehler | `.vscode/*` plus `!.vscode/extensions.json`. | offen – Entscheid Stefan |
| 16 | AGENTS.md «CSS» | Die Token-Namensliste (`--color-*`, `--space-*`, `--font-*`, `--radius`, `--container`) deckt Schatten, Bewegung und Rahmen nicht ab. «Never raw values» ist absolut formuliert (`1px`, `0`, `1fr`). | Schönheitsfehler | Liste um `--shadow-*`, `--motion-*`, `--border` ergänzen; Regel auf Farben, Abstände, Schriften und Radien beschränken. | offen – Entscheid Stefan (RetroLos!: E14) |
| 17 | AGENTS.md «Workflow» | Commit-Nachrichten «English, imperative» – keine Konvention wie Conventional Commits, und die Sprache ist für deutschsprachige Teams fix vorgegeben. | Schönheitsfehler | Conventional Commits empfehlen, Sprache freistellen. | offen – Entscheid Stefan |
| 18 | AGENTS.md «JS» | Ohne ES-Module fehlt eine Anleitung, wie mehrere Script-Dateien Code teilen («no globals») und wie man klassische Scripts in Node testet. Jede Mini-App erfindet das neu. | störend | Muster dokumentieren: eine Datei pro Modul, ein Namensraum (`window.<App>`), am Dateiende `if (typeof module === 'object') module.exports = api;` – dann klappt `require()` in `node --test`. | offen – Entscheid Stefan (RetroLos!: E6, E7) |
| 19 | README «Quick Start» Schritt 4 | «Datei direkt öffnen» ist der empfohlene lokale Weg. Alles, was die App zum Teilen erzeugt (Links, QR-Codes), zeigt dann auf eine `file://`-Adresse, die bei anderen nicht funktioniert. | Schönheitsfehler | Hinweis ins README; Konvention für eine Konfigurationszeile mit der Live-Adresse. | offen – Entscheid Stefan (RetroLos!: E18) |
| 20 | AGENTS.md «CSS» | «No inline style» lässt offen, ob per JavaScript gesetzte Werte (`el.style.flexGrow`) erlaubt sind. Mit CSP sind sie erlaubt (CSSOM), `style="…"`-Attribute nicht. | Schönheitsfehler | Präzisieren: kein `style`-Attribut im HTML; dynamische Werte per `element.style.<prop>` oder Custom Property sind ok. | offen – Entscheid Stefan |
| 21 | AGENTS.md «CSS» | Dark Mode ist vorgeschrieben, Drucken nicht geregelt: Im Dark Mode druckt der Browser helle Schrift ohne Hintergrund, also unlesbar. | störend | Regel: `@media print` setzt immer die helle Palette (Tokens neu belegen). | behoben in RetroLos! (`57c4f62`) |
| 22 | AGENTS.md «Definition of Done» | Einziger Prüfschritt ist «im Browser öffnen, auch ohne JavaScript». Browser-Konsole, Netzwerk-Tab (externe Anfragen!), Handy-Breite, Dark Mode und Tastaturbedienung fehlen in der Checkliste – genau dort zeigten sich in RetroLos! die Fehler. | störend | DoD-Checkliste ergänzen: keine Konsolenfehler, keine fremden Anfragen im Netzwerk-Tab, 390 px Breite, Dark Mode, nur Tastatur. | offen – Entscheid Stefan |

## Übertrag ins Template

_Wird in Phase 7 vervollständigt: pro behobener Lücke die genaue Änderung zum 1:1-Übernehmen._

## Vorbereitete Issue-Texte

_Folgen in Phase 7. Issues werden nur auf ausdrücklichen Wunsch eröffnet._
