# CLAUDE.md

Verbindliche Regeln stehen in @AGENTS.md (Quelle der Wahrheit). Kurzfassung für RetroLos!:

- **Leitplanken:** keine Kunden- oder Personendaten, kein Server, kein Login, keine externen Anfragen (CSP `default-src 'self'`), keine Tokens im Browser. Retro-Dateien (`retro-*.md`, `retros/`) nie committen – nur fiktive Beispiele unter `docs/beispiele/`.
- **Technik:** HTML/CSS/Vanilla-JS ohne Build. Klassische Scripts mit `defer`, keine ES-Module, kein `fetch()`. Alle Pfade relativ. Jede Seite lesbar ohne JavaScript.
- **Struktur:** Seiten flach im Root (`index.html`, `planen.html`, `teilnehmen.html`, `moderieren.html`), Styles `styles.css` + `<seite>.css`, Logik ohne DOM in `core-*.js` (plan, markdown, board, privacy), Formate in `config.js`, UI-Helfer in `ui.js`/`effects.js`, Tests in `tests/`, Doku in `docs/`, Specs in `specs/NNN-*/spec.md`.
- **Sprache:** UI, Doku, Commits auf Deutsch (Schweizer Rechtschreibung, «ss»); JS-Bezeichner Englisch.
- **Dateiformat:** siehe `docs/dateiformat.md` (YAML-Frontmatter, `retrolos: 1`).
- **Befehle:** Tests `node --test "tests/*.test.js"` (inkl. `tests/pages.test.js`: Script-Reihenfolge, CSP, Pfade) · lokal `index.html` im Browser öffnen.
- **Neue Seite oder neues Script:** Abhängigkeiten in jeder HTML-Datei in der richtigen Reihenfolge einbinden (config → core-* → ui → effects → Seiten-Script); der Seiten-Test prüft das.
- **Steckbrief:** `miniapp.md` – Owner-Person ist noch offen (TODO), nicht raten.
- **Arbeitsweise:** pro Phase Spec → Branch → PR → Merge-Commit; jede Template-Lücke sofort in `docs/template-feedback.md`, jeden kleineren Entscheid in `docs/entscheidungen.md`. Git-Identität nur lokal mit Noreply-Adresse.
