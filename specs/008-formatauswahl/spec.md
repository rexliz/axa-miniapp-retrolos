# Spec – Formatauswahl

| Feld | Wert |
|---|---|
| ID | `008-formatauswahl` |
| Status | implemented |
| Owner | ZHAW-Team (konkrete Person offen) |
| Zuletzt geändert | 2026-11-11 |

## 1. Zweck

Abwechslung hält Retros lebendig. Die Person wählt eines von 13 Formaten; die App bleibt dabei eine einzige, schmale Seite.

## 2. Akzeptanzkriterien

| ID | Gegeben | Wenn | Dann |
|---|---|---|---|
| AC-1 | die Seite | sie lädt | ist «Segelboot» gewählt und die Szene sichtbar |
| AC-2 | das Auswahlfeld «Format» | ich ein anderes Format wähle | erscheinen dessen Zonen mit Leitfragen und «gut geeignet für»; die Szene verschwindet |
| AC-3 | Notizen in einem Format | ich das Format wechsle und zurückkehre | sind die Notizen noch da |
| AC-4 | ein gewähltes Format | ich speichere | heisst die Datei `retro-<format>-<datum>.md` und enthält die Zonen dieses Formats |
| AC-5 | ein neuer Eintrag in `FORMATS` | die Tests laufen und die Seite lädt | erscheint er in der Auswahl; der Test prüft die Einträge |
