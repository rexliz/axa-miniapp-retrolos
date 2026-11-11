# Entscheidungen

Kleinere Entscheide, die während der Umsetzung von RetroLos! gefallen sind.
Entscheide, die vom Template abweichen, stehen zusätzlich kurz in [AGENTS.md](../AGENTS.md).

| Nr | Datum | Entscheid | Begründung | Entschieden von |
|---|---|---|---|---|
| E1 | 2026-11-11 | Der Template-Ordner war ein ZIP ohne Git. Er wurde mit `git init -b main` zum Repository, der unveränderte Stand ist Commit `fdcb416`. | Auftrag, Fall «noch kein Git-Repository». Es gibt keinen Remote auf Stefans Repo, also auch kein Risiko, dorthin zu pushen. | Claude |
| E2 | 2026-11-11 | Repository `rexliz/axa-miniapp-retrolos`, öffentlich. | Studenten-Konto des Teams; GitHub Pages im Gratis-Plan braucht ein öffentliches Repo. | Team |
| E3 | 2026-11-11 | Pro Phase ein Branch und ein Pull Request; Claude merged selbst als Merge-Commit. | Das Template verbietet Pushes direkt auf `main`. Merge-Commits erhalten die Commit-Hashes, auf die das Template-Feedback verweist. | Team |
| E4 | 2026-11-11 | Doku, Doku-Dateinamen, Seiten-Dateinamen, Commit-Nachrichten und Oberfläche auf Deutsch (Schweizer Rechtschreibung, «ss»). JavaScript-Bezeichner und technische Dateinamen (`styles.css`, `core-markdown.js`) bleiben Englisch. | Wunsch des Teams; Abweichung von AGENTS.md «Language». Englische Bezeichner bleiben Standard im Code. | Team (Sprache), Claude (Bezeichner) |
| E5 | 2026-11-11 | Git-Identität nur lokal: `rexliz` mit `168993941+rexliz@users.noreply.github.com`. | Keine private E-Mail-Adresse im Verlauf. | Team |
| E6 | 2026-11-11 | Klassische Scripts mit `defer` statt ES-Module; ein einziger globaler Namensraum `RetroLos`. | Template: Module und `fetch()` funktionieren unter `file://` nicht. Ohne Module brauchen die Dateien einen gemeinsamen Namensraum. | Claude (Template-Regel) |
| E7 | 2026-11-11 | DOM-freie Logik in `core-*.js` im Root statt im Ordner `core/`. Jede Core-Datei lässt sich zusätzlich in Node mit `require` laden. | Template: flache Struktur. Tests mit `node --test` brauchen so kein Build und keine Abhängigkeit. | Claude (Template-Regel) |
| E8 | 2026-11-11 | Steckbrief als `miniapp.md` mit YAML-Frontmatter statt `miniapp.json`. | `.json` ist laut Template kein erlaubter Dateityp. Frontmatter ist maschinenlesbar und für Menschen lesbar. | Claude (Template-Regel) |
| E9 | 2026-11-11 | `CLAUDE.md` verweist auf `AGENTS.md` und ergänzt nur Kurzregeln. | Laut Template ist AGENTS.md die Quelle der Wahrheit. | Claude |
| E10 | 2026-11-11 | Ordner `docs/` und `tests/` neben `specs/`. | Doku und Tests sind keine Seiten der Website; das Template nutzt selbst `specs/`. | Claude |
| E11 | 2026-11-11 | Seiten `index.html`, `planen.html`, `teilnehmen.html`, `moderieren.html`. Der Einladungslink zeigt direkt auf `teilnehmen.html#einladung=…`. | Kein Client-Routing nötig; sprechende Adresse für Teilnehmende. | Claude |
| E12 | 2026-11-11 | Content-Security-Policy per Meta-Tag: `default-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'`. | Externe Anfragen sind technisch ausgeschlossen. In Chrome unter `file://` und über HTTPS geprüft. | Claude |
| E13 | 2026-11-11 | Ohne JavaScript zeigen alle Seiten Banner, Erklärung, Ablauf und Navigation. Die Werkzeug-Funktionen (Planen, Karten, Board) brauchen JavaScript und zeigen sonst einen Hinweis. | Kompromiss zur Template-Regel «ohne JavaScript lauffähig» (Template-Lücke 12). | Claude |
| E14 | 2026-11-11 | Zusätzliche Token-Gruppen `--shadow-*`, `--motion-*`, `--border`, `--font-size-*`. Unter `prefers-reduced-motion` stehen die `--motion-*`-Tokens auf 1 ms, Endlos-Animationen sind aus. | Die Template-Liste deckt das nicht ab (Lücke 16); so braucht es kein `!important`. | Claude |
| E15 | 2026-11-11 | Platzhalterseiten für Planen, Teilnehmen und Moderieren schon in Phase 1. | Die Startseite verlinkt sie; keine 404-Fehler im ersten Deploy. | Claude |
| E16 | 2026-11-11 | Retro-Dateien per `.gitignore` ausgeschlossen (`retro-*.md`, `retros/`), Ausnahme `docs/beispiele/retro-*.md`. | Repo und Pages-Seite sind öffentlich, Team-Feedback ist intern. | Team (Auftrag) |
| E17 | 2026-11-11 | Die Konfiguration (Formate, Stimmungen, Check-in-Fragen, Texte) ist die Datei `config.js`, kein JSON. | `fetch()` ist unter `file://` blockiert, und `.json` ist kein erlaubter Dateityp. Die Datei enthält nur Daten und eine Anleitung im Kopf. | Claude |
| E18 | 2026-11-11 | `config.liveUrl` hält die öffentliche Adresse. Öffnet der Scrum Master die App als lokale Datei, zeigt der Einladungslink trotzdem auf die Live-Version; «Link selbst ausprobieren» bleibt lokal. | Ein `file://`-Link funktioniert nur auf dem eigenen Gerät. | Claude |
| E19 | 2026-11-11 | Zeit-, Stimmungs- und Fokus-Auswahl werden aus `config.js` erzeugt, nicht ins HTML geschrieben. | Eine einzige Quelle; Anpassungen nur in der Konfiguration. Ohne JavaScript ist der Assistent ohnehin nicht nutzbar (E13). | Claude |
| E20 | 2026-11-11 | Vorbelegung: Retro morgen, 60 Minuten, Stimmung «normal», Abgabetermin am Vortag um 17:00 Uhr (folgt dem Datum, bis man ihn selbst ändert). | Schneller Start; die Demo-Retro ist am 12.11. | Claude |
| E21 | 2026-11-11 | Die Empfehlung meidet das zuletzt genutzte Format (`retrolos:letztesFormat`, gesetzt beim Speichern des Protokolls), sofern die Stimmung eine Alternative hat. | Gegen «immer dasselbe langweilige Format». | Claude |
| E22 | 2026-11-11 | Einladung im Hash als Base64url-JSON mit Kurzschlüsseln `{v, id, s, f, d, a}`, Version `v: 1`. | Kurzer Link, Umlaute und Emojis sicher; Versionsfeld für spätere Änderungen. | Claude |
| E23 | 2026-11-11 | Druck immer mit heller Palette; die Druckansicht der Planung zeigt nur die Agenda. | Lesbar auf Papier, auch aus dem Dark Mode heraus. | Claude |
| E24 | 2026-11-11 | Tests laufen im Workflow mit `actions/setup-node@v7` (Node 24) vor dem Upload, Befehl `node --test "tests/*.test.js"`. | Reproduzierbare Node-Version; fehlerhafter Stand wird nicht live geschaltet. Die Glob-Form läuft ab Node 22, die Ordner-Form erst ab Node 26. | Claude |
