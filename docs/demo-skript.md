# Demo-Skript: RetroLos! in 3 Minuten

**Ziel:** In 3 Minuten zeigen, wie eine Retro ohne Server von der Planung bis zum Protokoll läuft – und dass Governance von Anfang an eingebaut ist.

## Vorbereitung (vor der Demo)

- [ ] Laptop: Chrome oder Edge, Live-URL https://rexliz.github.io/axa-miniapp-retrolos/ offen, Zoom ca. 110 %.
- [ ] Alte Daten löschen: auf «Planen» ganz unten «Alle Daten in diesem Browser löschen».
- [ ] Die 4 Beispiel-Beiträge aus [`docs/beispiele/`](beispiele/) liegen in einem Ordner auf dem Desktop (Repo herunterladen oder Dateien von GitHub speichern), ebenso das Protokoll `retro-R-2026-10-29-sprint-11-protokoll.md`.
- [ ] Handy bereit: Den Einladungslink schickst du dir während der Demo über den Teams-Chat (oder vorher testen).
- [ ] Ton am Laptop aus, Benachrichtigungen aus.
- **Plan B ohne Internet:** `index.html` lokal öffnen – alles funktioniert gleich, nur der Einladungslink zeigt auf die Live-Version.

## Ablauf

| Zeit | Was du zeigst | Was du sagst |
|---|---|---|
| 0:00–0:20 | Startseite mit Banner | «Retros sind wichtig, aber die Vorbereitung kostet Zeit, alle nutzen immer dasselbe Format, und Massnahmen gehen vergessen. RetroLos! löst das – ohne Server, ohne Login, ohne Kundendaten. Das Banner sagt es gleich zu Beginn.» |
| 0:20–0:35 | «Planen» → Protokoll der letzten Retro importieren → zwei Massnahmen mit «Ja» / «Teilweise» beantworten | «Zuerst holen wir das Protokoll der letzten Retro. Was ist aus unseren Massnahmen geworden? Nichts geht mehr vergessen.» |
| 0:35–0:55 | Datum 12.11.2026, «Stressiger Sprint», Fokus «Tempo» → Empfehlung «Segelboot»; dann **«Überrasch mich!»** einmal würfeln und wieder «Segelboot» wählen | «RetroLos! empfiehlt ein Format und sagt, warum. Wer Abwechslung will, würfelt.» |
| 0:55–1:05 | Agenda, dann **Einladungslink** «Text kopieren» und im Teams-Chat einfügen | «Agenda mit Zeiten für alle fünf Phasen – und ein fertiger Einladungstext. Der Link enthält nur Sprint, Format und Termin, alles im Hash, nie auf einem Server.» |
| 1:05–1:35 | **Handy:** Link öffnen, ⛅ wählen, eine Wind-Karte schreiben (Boot fährt!), dann eine Karte mit «Police 12345678» tippen → Hinweis erscheint | «Jede Person schreibt auf ihrem eigenen Gerät. Das Boot fährt mit jeder Wind-Karte. Und hier der Datenschutz-Wächter: Sieht etwas nach Kunden- oder Personendaten aus, gibt es einen freundlichen Hinweis.» → Karte wieder löschen, «Meine Karten als .md speichern», Vorschau zeigen, speichern. |
| 1:35–1:50 | Laptop: «Zum Import und zur Moderation» → Ordner mit den 4 Beispielen hineinziehen | «Die Dateien liegen im Teams-Ordner. Ich ziehe sie hinein – der Bericht zeigt, was übernommen wurde. Duplikate, fremde Retros und kaputte Dateien würden erkannt.» |
| 1:50–2:10 | → (Pfeiltaste) «Einstimmen»: Check-in-Frage und Wetter; → «Sammeln»: Karten fliegen ein, das Boot segelt los; auf die markierte Karte mit der Telefonnummer zeigen | «Grosse Schrift fürs Bildschirm-Teilen, Timer pro Phase. Die Karten erscheinen nacheinander – und die Karte mit der Telefonnummer ist markiert.» |
| 2:10–2:30 | → «Verstehen»: drei Meeting-Karten auswählen → «zusammenfassen», ein paar Punkte geben → Karten sortieren sich | «Ähnliches zusammenfassen, Punkte vergeben – die wichtigsten Themen steigen nach oben.» |
| 2:30–2:45 | → «Entscheiden»: Top-Thema «→ Als Massnahme», Wer «SM» → hinzufügen; Rückblick «Wieder aufnehmen» zeigen | «Aus dem wichtigsten Thema wird eine Massnahme – mit Rolle und Termin, ohne Namen.» |
| 2:45–3:00 | → «Abschliessen»: zwei Feedback-Klicks, «Retro abschliessen» (Konfetti), «Protokoll als .md speichern», «Für Teams-Chat kopieren» | «Feedback, Konfetti, Protokoll. Das Protokoll kommt in den Teams-Ordner und bei der nächsten Retro wieder hinein. RetroLos! ist eine Lösung-1-Mini-App: kein Kundendatum, gebaut auf unserem Template, das wir dabei gleich getestet haben.» |

## Falls Fragen kommen

- **«Wo liegen die Daten?»** Nur im Browser und in den Dateien, die das Team selbst ablegt. Keine einzige Anfrage an einen fremden Server – prüfbar im Netzwerk-Tab.
- **«Ist es anonym?»** Auf dem Board ja, Kürzel sind freiwillig. Im Teams-Kanal sieht man, wer eine Datei hochlädt – das ist eine bewusste Grenze des Prototyps.
- **«Neues Format?»** Ein Block in `config.js`, keine Codeänderung.
- **«Was hat das Template gebracht?»** Siehe [template-feedback.md](template-feedback.md): Kennzahlen, Lücken und konkrete Verbesserungen für Stefan.
