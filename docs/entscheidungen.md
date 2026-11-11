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
