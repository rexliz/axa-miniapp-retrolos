# RetroLos! – Retros leicht gemacht

Mini-App für Scrum Master und Scrum-Teams: Retro planen, Karten des Teams sammeln, moderieren, Protokoll erzeugen – **ohne Server, ohne Login, ohne Kundendaten**.

**Live:** https://rexliz.github.io/axa-miniapp-retrolos/

> Hackathon-Prototyp eines ZHAW-Teams (AXA-Hackathon 2026, Plattform «AXALos!», Lösung 1 «Solo Workout»). Die vollständige Anleitung folgt mit Phase 6.

## Status

| Phase | Inhalt | Stand |
|---|---|---|
| 1 | Grundgerüst, Startseite mit Banner, erster Deploy | ✅ |
| 2 | Planen und Einladen | ✅ |
| 3 | Teilnehmen und Dateiformat ([Spezifikation](docs/dateiformat.md)) | ✅ |
| 4 | Import und Moderieren | ✅ |
| 5 | Abschliessen, Datenschutz-Wächter | ✅ |
| 6 | Feinschliff und Doku | geplant |
| 7 | Template-Feedback | laufend: [docs/template-feedback.md](docs/template-feedback.md) |

## Lokal starten

`index.html` im Browser öffnen (Doppelklick). Es braucht keine Installation und keinen Server.

## Datenschutz-Prinzip

- Die App speichert nur in deinem Browser (`localStorage`). Dateien entstehen erst, wenn du sie selbst speicherst.
- **Retro-Dateien gehören in den Teams-Kanal bzw. den Team-Ordner – nie ins Repository.** Repo und Website sind öffentlich, das Feedback des Teams ist intern. Die `.gitignore` schliesst deshalb `retro-*.md` und den Ordner `retros/` aus. Einzige Ausnahme sind die fiktiven Beispiele unter `docs/beispiele/`.

## Grundlage

Gebaut auf Stefans Template für statische Seiten auf GitHub Pages. Regeln: [AGENTS.md](AGENTS.md) · Entscheide: [docs/entscheidungen.md](docs/entscheidungen.md) · Specs: [specs/](specs/).
