# CLAUDE.md

Verbindliche Regeln stehen in @AGENTS.md (Quelle der Wahrheit). Kurzfassung für RetroLos!:

- **Rahmen:** schmale Einzelnutzer-Mini-App, nur Format Segelboot. Kein Teilen, keine Sessions, keine Agenda, keine Erklärseiten. Nicht wieder aufblähen.
- **Leitplanken:** keine Kunden- oder Personendaten, kein Server, keine externen Anfragen (CSP `default-src 'self'`). Logbücher (`retro-*.md`) nie committen.
- **Technik:** HTML/CSS/Vanilla-JS ohne Build, klassische Scripts mit `defer`, alle Pfade relativ.
- **Struktur:** `index.html`, `styles.css` (AXA-Look: Tiefblau `#00008f`, Rot `#ff1721` nur als Akzent, Georgia-Titel, eckige Knöpfe, kein Logo), `core-segelboot.js` (Logik ohne DOM), `core-privacy.js`, `ui.js`, `effects.js`, `app.js`, Tests in `tests/`.
- **Sprache:** UI, Doku, Commits auf Deutsch (Schweizer Rechtschreibung); JS-Bezeichner Englisch.
- **Befehle:** `node --test "tests/*.test.js"` · lokal `index.html` öffnen.
- **Arbeitsweise:** Branch → PR → Merge-Commit; Template-Lücken in `docs/template-feedback.md`, Entscheide in `docs/entscheidungen.md`. Git-Identität nur lokal mit Noreply-Adresse. Steckbrief-Owner ist noch offen (TODO).
