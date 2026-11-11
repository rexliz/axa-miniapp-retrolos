# Spec – Feinschliff, Barrierefreiheit und Dokumentation

| Feld | Wert |
|---|---|
| ID | `006-feinschliff-doku` |
| Status | implemented |
| Owner | ZHAW-Team (konkrete Person offen) |
| Zuletzt geändert | 2026-11-11 |

## 1. Zweck

Die App muss morgen live vorgeführt und danach in die Mini-App-Liste eingetragen werden. Dafür braucht es geprüfte Barrierefreiheit, vollständige Doku, einen Steckbrief, ein Demo-Skript und einen finalen Live-Check des ganzen Ablaufs.

## 2. Akzeptanzkriterien

| ID | Gegeben | Wenn | Dann |
|---|---|---|---|
| AC-1 | alle Farb-Token | Kontraste berechnet werden | erreichen alle Text/Hintergrund-Paare in hell und dunkel ≥ 4.5:1 |
| AC-2 | alle Seiten nach dem Aufbau durch JavaScript | Eingabefelder und Knöpfe geprüft werden | hat jedes Element einen zugänglichen Namen (Label oder aria-label) |
| AC-3 | `prefers-reduced-motion: reduce` | Animationen laufen würden | sind Würfel, Wellen, Boot, Einblenden, Sortieren und Konfetti ausgeschaltet bzw. sofort |
| AC-4 | ein zusätzliches Format nur in `config.js` | die App neu geladen wird | erscheint es in Planen, Bibliothek, Teilnahme und Board, und alle Tests bleiben grün |
| AC-5 | das README | jemand es liest | findet er Problem, Lösung, Ablauf in 4 Schritten, Screenshot, Live-Link, lokalen Start, Struktur, «Neues Format hinzufügen», Datenschutz-Prinzip und Grenzen |
| AC-6 | `miniapp.md`, `docs/demo-skript.md`, `CLAUDE.md` | die Abgabe | sind sie vorhanden; die Owner-Person ist als offen markiert |
| AC-7 | die Live-URL | der DoD-Ablauf durchgespielt wird | gibt es keine Konsolenfehler und keine Anfragen an fremde Server |

## 3. Offene Fragen

| # | Frage | Blockierend? | Owner |
|---|---|---|---|
| Q1 | Wer ist die Owner-Person im Steckbrief? | nein (für die Liste ja) | Team |
