# RetroLos! – Mini-Retro

Eine schmale Mini-App für die persönliche Retro: **Format wählen, Notizen sammeln, höchstens drei nächste Schritte festlegen.** Eine Person, ein Gerät, keine Daten auf einem Server.

**▶ Live:** https://rexliz.github.io/axa-miniapp-retrolos/

> Hackathon-Prototyp eines ZHAW-Teams (AXA-Hackathon 2026, Plattform «AXALos!»), **Lösung 1 «Solo Workout»**. Steckbrief: [miniapp.md](miniapp.md).

![RetroLos! mit Formatauswahl, Zonen und nächsten Schritten](docs/screenshot.png)

## So funktioniert's

1. **Format wählen** – 13 Formate, Standard ist das **Segelboot** mit animierter Szene (Wind schiebt das Boot, Anker bremsen, Felsen tauchen auf).
2. **Notizen** in die Zonen des Formats schreiben. Notizen bleiben pro Format gespeichert – ein Wechsel löscht nichts.
3. **Nächste Schritte:** höchstens drei, optional mit Termin.
4. **Logbuch speichern (.md)** oder **Text kopieren**. Alles wird automatisch im Browser gespeichert; «Neu beginnen» löscht den Stand.

| Format | Gut geeignet für |
|---|---|
| ⛵ Segelboot | Hindernisse und Risiken |
| 🚦 Ampel | Allrounder |
| 🎈 Heissluftballon | Motivation und Blocker |
| 😤 Mad – Sad – Glad | Stimmung im Team |
| ⭐ Start – Stop – Continue | sehr handlungsorientiert |
| 🧟 Zombie-Scrum | eingefahrene Teams |
| 🗑️ Kill one thing | Prozesse entschlacken |
| 🪄 Zauberstab | Wünsche sichtbar machen |
| 🏆 Sprint Awards | lockerer Einstieg |
| 🕵️ Sherlock Retro | tiefere Ursachenanalyse |
| 🎬 Unser Sprint als Film | kreativer Einstieg |
| 🌟 1 Stern / 5 Sterne | kleine Verbesserungen finden |
| 📰 Breaking News | Themen auf den Punkt bringen |

## Neues Format hinzufügen

In [`core-retro.js`](core-retro.js) im Array `FORMATS` einen Block ergänzen (`key`, `emoji`, `name`, `fitsFor`, `zones` mit 1–5 Einträgen aus `key`, `emoji`, `name`, `question`). Danach `node --test "tests/*.test.js"` – der Test prüft die Einträge.

## Lokal starten und testen

`index.html` im Browser öffnen – kein Server, keine Installation. Tests (Node ≥ 22, ohne Abhängigkeiten, laufen auch vor jedem Deploy):

```sh
node --test "tests/*.test.js"
```

## Struktur

```
index.html        die einzige Seite
styles.css        Design-Tokens (AXA-Look: Tiefblau, Rot als Akzent, hell/dunkel)
core-retro.js     Logik ohne DOM: Formate, Notizen, Segelboot-Kurs, Markdown, Kurztext
core-privacy.js   Datenschutz-Muster (E-Mail, Telefon, IBAN, AHV, lange Nummern)
ui.js  effects.js UI-Helfer, Segelboot-Szene (SVG), Konfetti
app.js            Oberfläche
tests/            node --test
```

## Datenschutz-Prinzip

- **Keine Kunden- oder Personendaten.** Ein Banner erinnert daran; der Datenschutz-Wächter zeigt einen Hinweis bei E-Mail-Adressen, Telefonnummern, IBAN, AHV- und langen Nummern. **Das ist ein Hinweis, kein vollständiger Schutz** – Namen erkennt er nicht.
- **Single-User, kein Server, kein Teilen.** Keine Sessions, keine Links, kein Login, kein Tracking, keine externen Anfragen (CSP `default-src 'self'`). Daten bleiben im `localStorage` dieses Browsers.
- **Logbücher gehören nie ins Repo.** Die `.gitignore` schliesst `retro-*.md` und `retros/` aus.

## Grenzen des Prototyps

- Nur ein Gerät: Browserdaten löschen = Stand weg; vorher das Logbuch speichern.
- Gespeicherte Logbücher lassen sich nicht wieder einlesen.
- Automatisch getestet in Chrome (Desktop, Handy-Breite, hell/dunkel).

## Doku

[docs/entscheidungen.md](docs/entscheidungen.md) · [docs/template-feedback.md](docs/template-feedback.md) · [specs/](specs/) · [AGENTS.md](AGENTS.md) · [CLAUDE.md](CLAUDE.md)
