# CLAUDE.md

Verbindliche Regeln stehen in @AGENTS.md (Quelle der Wahrheit). Kurzfassung für RetroLos!:

- **Rahmen:** schmale Einzelnutzer-Mini-App mit Formatauswahl (Standard Segelboot, Formate in `FORMATS` in `core-retro.js`). Kein Teilen, keine Sessions, keine Agenda, keine Erklärseiten. Nicht wieder aufblähen.
- **Leitplanken:** keine Kunden- oder Personendaten, kein Server, keine externen Anfragen (CSP `default-src 'self'`). Ergebnisse (`retro-*.pdf`, `retro-*.md`) nie committen. Export nur als PDF (Druckdialog) oder Text – kein .md-Download.
- **Technik:** HTML/CSS/Vanilla-JS ohne Build, klassische Scripts mit `defer`, alle Pfade relativ.
- **Struktur:** `index.html`, `styles.css` (AXA-Look: Tiefblau `#00008f`, Rot `#ff1721` nur als Akzent, Georgia-Titel, eckige Knöpfe, kein Logo), `core-retro.js` (Logik ohne DOM), `core-privacy.js`, `ui.js`, `effects.js`, `app.js`, Tests in `tests/`.
- **Sprache:** UI, Doku, Commits auf Deutsch (Schweizer Rechtschreibung); JS-Bezeichner Englisch.
- **Nach jeder Änderung an JS/CSS:** `?v=` in `index.html` überall um 1 erhöhen (Pages-Cache 10 Min.). Formate stehen zusätzlich als `<option>` im HTML – Test prüft Gleichstand mit `FORMATS`.
- **Befehle:** `node --test "tests/*.test.js"` · lokal `index.html` öffnen.
- **Arbeitsweise:** Branch → PR → Merge-Commit; Template-Lücken in `docs/template-feedback.md`, Entscheide in `docs/entscheidungen.md`. Git-Identität nur lokal mit Noreply-Adresse. Steckbrief-Owner ist noch offen (TODO).
