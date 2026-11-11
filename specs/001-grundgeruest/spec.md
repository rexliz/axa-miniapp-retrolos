# Spec – Grundgerüst live

| Feld | Wert |
|---|---|
| ID | `001-grundgeruest` |
| Status | implemented |
| Owner | ZHAW-Team (konkrete Person folgt) |
| Zuletzt geändert | 2026-11-11 |

## 1. Zweck

RetroLos! braucht eine öffentlich erreichbare Startseite, bevor die eigentlichen Funktionen entstehen. Sie erklärt Neulingen in einer Minute, was eine Retro ist, führt Scrum Master und Teammitglieder zum richtigen Einstieg und macht von Anfang an klar, dass keine Kunden- oder Personendaten hineingehören. Gleichzeitig beweist der erste Deploy, dass die Pipeline des Templates trägt.

## 2. Rollen

| Rolle | Beschreibung | Braucht |
|---|---|---|
| Scrum Master | moderiert die Retro | schnellen Einstieg ins Planen und Moderieren |
| Teammitglied | gibt Karten ab | Hinweis, dass es den Link des Scrum Masters braucht |
| Neuling | kennt Retros kaum | kurze Erklärung ohne Fachjargon |

## 3. User Stories

| ID | Story |
|---|---|
| US-1 | Als Person, die RetroLos! öffnet, will ich sofort sehen, dass es ein Prototyp ist und keine Kunden- oder Personendaten hineingehören. |
| US-2 | Als Scrum Master will ich mit einem Klick ins Planen oder Moderieren gelangen. |
| US-3 | Als Teammitglied will ich verstehen, dass ich den Einladungslink meines Scrum Masters brauche. |
| US-4 | Als Neuling will ich in einer Minute verstehen, was eine Retro ist. |

## 4. Akzeptanzkriterien

| ID | Story | Gegeben | Wenn | Dann |
|---|---|---|---|---|
| AC-1 | US-1 | eine beliebige Seite | sie lädt | steht oben gut sichtbar der Banner-Text «Hackathon-Prototyp – keine Kunden- oder Personendaten eingeben. Deine Eingaben bleiben in deinem Browser, bis du sie selbst als Datei speicherst.» |
| AC-2 | US-2 | die Startseite | ich wähle «Ich bin Scrum Master» | komme ich zu «Retro planen» oder «Beiträge importieren» |
| AC-3 | US-3 | die Startseite | ich lese «Ich nehme an einer Retro teil» | steht dort, dass ich den Link meines Scrum Masters öffnen soll |
| AC-4 | US-4 | die Startseite | ich öffne «Retro in 60 Sekunden erklärt» | sehe ich Zweck, Dauer und die 5 Phasen |
| AC-5 | – | JavaScript ist deaktiviert | ich öffne die Startseite direkt als Datei | ist sie vollständig lesbar und navigierbar |
| AC-6 | – | ein Push auf `main` | der Workflow läuft | ist die Seite unter `https://rexliz.github.io/axa-miniapp-retrolos/` mit HTTP 200 erreichbar |
| AC-7 | – | die Seite ist geladen | ich prüfe den Netzwerk-Tab | gibt es keine Anfrage an fremde Server |

## 5. Nicht-Ziele

- Funktionen zum Planen, Teilnehmen und Moderieren (Phasen 2–4)
- Endgültige README und Steckbrief (Phase 6)

## 6. Offene Fragen

| # | Frage | Blockierend? | Owner |
|---|---|---|---|
| Q1 | Wer ist die konkrete Owner-Person im Steckbrief? | nein | Team |
