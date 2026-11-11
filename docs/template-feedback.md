# Template-Feedback aus dem ersten Praxistest (RetroLos!)

RetroLos! ist die erste echte Mini-App auf Stefans Template für statische Seiten auf GitHub Pages.
Diese Datei hält jede Lücke fest, sobald sie auftaucht – nicht erst am Schluss.
Der unveränderte Template-Stand ist Commit `fdcb416`; `git diff fdcb416` zeigt alle Änderungen.

> **Nachtrag (Umbau):** Nach Phase 7 wurde RetroLos! auf Wunsch des Teams zu einer schmalen Einzelnutzer-App (nur Segelboot, eine Seite) vereinfacht. Die Lücken unten bleiben gültig; Verweise auf entfernte Dateien beziehen sich auf den Stand bis `52ef52a`. Neue Lücke 26 siehe Tabelle.

## Kennzahlen

| Kennzahl | Wert |
|---|---|
| Start | 2026-11-11, 08:44 Uhr |
| Erster erfolgreicher Live-Deploy | 2026-11-11, 09:27 Uhr – **43 Minuten** nach dem Start (davon rund 30 Minuten Warten auf Entscheide des Teams; reine Arbeitszeit etwa 13 Minuten) |
| Manuelle Schritte ausserhalb des Templates | **4** (Liste unten) – danach kamen keine weiteren dazu |
| Gefundene Lücken | **25**: 2 blockierend · 13 störend · 10 Schönheitsfehler |
| Davon in RetroLos! behoben | 5 ganz, 1 teilweise (Übertrag siehe unten); 19 offen – Entscheid Stefan |
| Deploys | 9 Workflow-Läufe: 1 gescheitert wegen fehlender Pages-Einstellung (Lücke 2), 1 vom neuen Test-Gate gestoppt (Testbefehl, Lücke 6), sonst grün |

Manuelle Schritte, die das Template nicht beschreibt:

1. Git-Repository anlegen und Template-Stand committen (`git init -b main`, Erst-Commit) – der Ordner kam als ZIP.
2. Git-Identität nur für dieses Repo setzen, mit GitHub-Noreply-Adresse.
3. GitHub-Anmeldung im Terminal prüfen und für `git` einrichten (`gh auth status`, `gh auth setup-git`).
4. Eigenes Repository anlegen und pushen (`gh repo create … --source=. --remote=origin --push`).

Nicht mitgezählt: Pages-Quelle auf «GitHub Actions» stellen – das beschreibt das Template (README, Schritt 2); in RetroLos! per CLI erledigt (`gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow`).

## Fazit

**Für Laien ist das Template noch nicht ohne Hilfe brauchbar.** Die beiden blockierenden Lücken treffen genau den Anfang: Es fehlt der Weg von «ZIP heruntergeladen» bzw. «Template» zum *eigenen* Repository, und es fehlt die einmalige Einrichtung von Git, GitHub-Anmeldung und Noreply-Adresse – eine AXA-Mitarbeiterin ohne Programmierkenntnisse käme vor dem ersten Deploy nicht weiter. Die Grundidee trägt aber: Die Leitplanken (relative Pfade, keine Secrets, nur statisch, kein Build) sind klar, und der Deploy-Workflow lief nach dem Anheben der Action-Versionen zuverlässig. Mit drei Ergänzungen – «Use this template» plus Einrichtungsabschnitt, eine Mini-App-Schicht (Steckbrief, Datenschutz-Banner, CSP) und ein mitgeliefertes Test-Setup – wäre es für Solo Workouts gut einsetzbar.

## Lücken

Auswirkung: **blockierend** (ohne Hilfe geht es nicht weiter) · **störend** (kostet Zeit oder Nerven) · **Schönheitsfehler**.

| Nr | Wo (Datei / Schritt) | Problem | Auswirkung | Vorschlag | Status |
|---|---|---|---|---|---|
| 1 | README «Quick Start», Schritt 1 | «Clone or fork» – kein Weg für den häufigsten Laien-Fall «ZIP heruntergeladen» (kein Git, kein Remote) und keiner, um ein *eigenes* Repository anzulegen. Ein «Use this template»-Weg wird nicht erwähnt. | blockierend | Repo auf GitHub als «Template repository» markieren, Schritt 1 = «Use this template → Create a new repository». Für den ZIP-Fall die Befehlsfolge `git init -b main` → Erst-Commit → `gh repo create <owner>/<name> --public --source=. --remote=origin --push` angeben. | offen – Entscheid Stefan |
| 2 | README Schritt 2 / `deploy.yml` | Wird gepusht, bevor Pages auf «GitHub Actions» steht, scheitert der erste Workflow-Lauf mit «Get Pages site failed … Not Found» (beobachtet in Lauf 42985971070). Für Laien sieht das wie ein Defekt aus. | störend | Im README klarstellen: zuerst Pages einschalten, dann pushen; CLI-Variante `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow` nennen. Im Workflow vor `configure-pages` einen Schritt mit verständlicher Meldung einbauen. | offen – Entscheid Stefan |
| 3 | `.github/workflows/deploy.yml` | Alle vier Actions sind eine bis drei Major-Versionen alt (`checkout@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4`) und laufen auf dem abgekündigten Node 20. | störend | Auf `checkout@v7`, `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5` anheben; Dependabot für `github-actions` einrichten. | behoben in RetroLos! (`33dd04a`) |
| 4 | `deploy.yml` / AGENTS.md «Deployment» | `touch .nojekyll` ist wirkungslos: Mit der Quelle «GitHub Actions» läuft kein Jekyll, und `upload-pages-artifact` lädt ab v4 Dotfiles gar nicht hoch. Die Begründung in AGENTS.md stimmt so nicht. | Schönheitsfehler | Schritt und Absatz streichen. Geprüft nach dem ersten Deploy: `specs/_template/spec.md` liefert HTTP 200, obwohl `.nojekyll` gar nicht im Artefakt ist. | offen – Entscheid Stefan |
| 5 | README / AGENTS.md | Nötige Werkzeuge (git, gh, Browser) und ihre Einrichtung fehlen: Anmeldung (`gh auth login`, `gh auth setup-git`) und Git-Identität. Ohne globale Identität bricht der erste Commit ab oder trägt den Rechnernamen ein. Dass man die eigene E-Mail-Adresse mit der Noreply-Adresse schützt, steht nirgends. | blockierend | Abschnitt «Einmalige Einrichtung» mit Befehlen, inkl. `git config --local user.email <id>+<login>@users.noreply.github.com`. | offen – Entscheid Stefan |
| 6 | AGENTS.md «Commands» | Kein Test-Setup («TODO»), und der Workflow prüft vor dem Deploy nichts. | störend | `node --test "tests/*.test.js"` ohne `package.json` als Konvention, Testschritt im Workflow vor dem Upload. Achtung: Die Ordner-Form `node --test tests/` geht erst ab Node 26 und liess den ersten Lauf auf Node 24 scheitern; der Glob in Anführungszeichen geht ab Node 22. | behoben in RetroLos! (`e9f60b6`, korrigiert in `85b8f9d`) |
| 7 | Template allgemein | Kein Steckbrief für die Mini-App-Liste (Name, Zweck, Owner, Datenarten, Weg «Solo Workout»), obwohl jede Mini-App dort eingetragen werden muss. | störend | Vorlage `miniapp.md` mit YAML-Frontmatter mitliefern. | offen – Entscheid Stefan (RetroLos! legt eine an) |
| 8 | Template allgemein | Kein Datenschutz-Baustein: keine Regel «keine Kunden- oder Personendaten» (Kern von Lösung 1), kein Prototyp-Banner, keine CSP-Empfehlung, kein Hinweis, dass interne Daten (Exporte, Team-Feedback) nicht ins öffentliche Repo gehören. | störend | Banner-Snippet und CSP-Meta-Tag in AGENTS.md; `.gitignore`-Abschnitt für interne Datendateien. | teilweise behoben in RetroLos! (`c889875` `.gitignore`, `7c2ac9f` Banner und CSP) |
| 9 | README «Three Rules That Matter» | Die Überschrift nennt drei Regeln, darunter stehen vier. | Schönheitsfehler | «Four Rules That Matter». | offen – Entscheid Stefan |
| 10 | AGENTS.md «Language» | «English for code, identifiers, file names, and documentation» passt schlecht zu deutschsprachigen AXA-Teams. Zur Sprache der Oberfläche sagt das Template nichts. | störend | Doku-Sprache pro Mini-App entscheiden lassen; UI-Sprache ausdrücklich regeln. | offen – Entscheid Stefan (RetroLos!: Doku Deutsch, E4) |
| 11 | AGENTS.md «Layout» | «Flat, no nesting» – unklar, ob Ordner wie `docs/` und `tests/` erlaubt sind (das Template hat selbst `specs/`). | Schönheitsfehler | Präzisieren: flach gilt für Seiten und Assets, Ordner für Doku, Tests und Specs sind erlaubt. | offen – Entscheid Stefan |
| 12 | AGENTS.md «Stack» | «Every page must render … with JavaScript disabled» – Mini-Apps sind fast immer interaktive Werkzeuge (Formulare, Board, Timer). Es fehlt eine Regel, was ohne JavaScript mindestens funktionieren muss. | störend | Umformulieren: Inhalte, Erklärungen und Navigation ohne JavaScript; Werkzeug-Funktionen dürfen JavaScript brauchen, mit `<noscript>`-Hinweis. | offen – Entscheid Stefan (RetroLos!: E13) |
| 13 | AGENTS.md «Allowed file types» | `.json` (Steckbrief, Konfiguration), `.ico` und `.webmanifest` sind nicht erlaubt. | Schönheitsfehler | `.json` und `.webmanifest` zulassen oder den Ausschluss begründen. | offen – Entscheid Stefan |
| 14 | AGENTS.md «Workflow» | PR-Pflicht, aber Merge-Strategie und Freigaben sind «TODO». Für Laien ist der PR-Ablauf eine grosse Hürde, und live geht es erst nach dem Merge. | störend | Für Solo-Workouts einen einfachen Standard festlegen, z. B. ein PR pro Feature, Merge-Commit, selbst mergen erlaubt. | offen – Entscheid Stefan |
| 15 | `.gitignore` | `.vscode/` wird komplett ignoriert – empfohlene Extensions (`.vscode/extensions.json`) lassen sich nicht im Team teilen. | Schönheitsfehler | `.vscode/*` plus `!.vscode/extensions.json`. | offen – Entscheid Stefan |
| 16 | AGENTS.md «CSS» | Die Token-Namensliste (`--color-*`, `--space-*`, `--font-*`, `--radius`, `--container`) deckt Schatten, Bewegung und Rahmen nicht ab. «Never raw values» ist absolut formuliert (`1px`, `0`, `1fr`). | Schönheitsfehler | Liste um `--shadow-*`, `--motion-*`, `--border` ergänzen; Regel auf Farben, Abstände, Schriften und Radien beschränken. | offen – Entscheid Stefan (RetroLos!: E14) |
| 17 | AGENTS.md «Workflow» | Commit-Nachrichten «English, imperative» – keine Konvention wie Conventional Commits, und die Sprache ist für deutschsprachige Teams fix vorgegeben. | Schönheitsfehler | Conventional Commits empfehlen, Sprache freistellen. | offen – Entscheid Stefan |
| 18 | AGENTS.md «JS» | Ohne ES-Module fehlt eine Anleitung, wie mehrere Script-Dateien Code teilen («no globals») und wie man klassische Scripts in Node testet. Jede Mini-App erfindet das neu. | störend | Muster dokumentieren: eine Datei pro Modul, ein Namensraum (`window.<App>`), am Dateiende `if (typeof module === 'object') module.exports = api;` – dann klappt `require()` in `node --test`. | offen – Entscheid Stefan (RetroLos!: E6, E7) |
| 19 | README «Quick Start» Schritt 4 | «Datei direkt öffnen» ist der empfohlene lokale Weg. Alles, was die App zum Teilen erzeugt (Links, QR-Codes), zeigt dann auf eine `file://`-Adresse, die bei anderen nicht funktioniert. | Schönheitsfehler | Hinweis ins README; Konvention für eine Konfigurationszeile mit der Live-Adresse. | offen – Entscheid Stefan (RetroLos!: E18) |
| 20 | AGENTS.md «CSS» | «No inline style» lässt offen, ob per JavaScript gesetzte Werte (`el.style.flexGrow`) erlaubt sind. Mit CSP sind sie erlaubt (CSSOM), `style="…"`-Attribute nicht. | Schönheitsfehler | Präzisieren: kein `style`-Attribut im HTML; dynamische Werte per `element.style.<prop>` oder Custom Property sind ok. | offen – Entscheid Stefan |
| 21 | AGENTS.md «CSS» | Dark Mode ist vorgeschrieben, Drucken nicht geregelt: Im Dark Mode druckt der Browser helle Schrift ohne Hintergrund, also unlesbar. | störend | Regel: `@media print` setzt immer die helle Palette (Tokens neu belegen). | behoben in RetroLos! (`57c4f62`) |
| 22 | AGENTS.md «Definition of Done» | Einziger Prüfschritt ist «im Browser öffnen, auch ohne JavaScript». Browser-Konsole, Netzwerk-Tab (externe Anfragen!), Handy-Breite, Dark Mode und Tastaturbedienung fehlen in der Checkliste – genau dort zeigten sich in RetroLos! die Fehler. | störend | DoD-Checkliste ergänzen: keine Konsolenfehler, keine fremden Anfragen im Netzwerk-Tab, 390 px Breite, Dark Mode, nur Tastatur. | offen – Entscheid Stefan |
| 23 | AGENTS.md «CSS» | «No `!important`» kollidiert mit einer klassischen Falle: Jede Komponente mit eigener `display`-Regel (z. B. `.button { display: inline-flex }`) überstimmt das HTML-Attribut `hidden`. In RetroLos! war dadurch ein Knopf sichtbar, der versteckt sein sollte. | störend | Basisregel `[hidden] { display: none !important; }` als ausdrücklich erlaubte Ausnahme ins Template aufnehmen. | behoben in RetroLos! (`2d86d13`) |
| 24 | AGENTS.md «JS» | Ohne ES-Module muss jede Seite die Script-Dateien, von denen ihre Scripts abhängen, von Hand und in der richtigen Reihenfolge einbinden. Ein fehlendes `<script>` fällt erst zur Laufzeit auf – in RetroLos! funktionierte dadurch der Protokoll-Import auf «Planen» nicht. | störend | Im Template einen kleinen statischen Seiten-Test mitliefern (Script-Reihenfolge, CSP, relative Pfade, vorhandene Dateien), z. B. `tests/pages.test.js` aus RetroLos!. | behoben in RetroLos! (`2d772c7`) |
| 25 | README / Template allgemein | Keine Vorlage für das README einer Mini-App (Problem, Lösung, Ablauf, Datenschutz, Grenzen) und keine Demo-Vorlage. Jede Mini-App muss das selbst erfinden, obwohl Datenschutz und Grenzen für AXA zentral sind. | Schönheitsfehler | README-Gerüst für Mini-Apps mit Pflichtabschnitten «Datenschutz-Prinzip» und «Grenzen» mitliefern. | offen – Entscheid Stefan (RetroLos!-README als Vorlage nutzbar) |
| 26 | Template allgemein | Das Template sagt nichts darüber, wie gross eine Mini-App sein darf. Ohne Leitplanke («eine Seite, eine Aufgabe, eine Person») wuchs RetroLos! zum Sprint-Tool mit vier Seiten und musste zurückgebaut werden. | störend | Abschnitt «Was ist eine Mini-App?» in AGENTS.md: eine Aufgabe, wenige Minuten Nutzung, eine Seite, Single-User, keine Sessions – Ausnahmen begründen. | offen – Entscheid Stefan |
| 27 | `deploy.yml` / AGENTS.md | GitHub Pages liefert alle Dateien mit `cache-control: max-age=600`. Nach einem Deploy kann neues HTML mit altem JavaScript aus dem Browser-Cache laufen – in RetroLos! blieb dadurch das Format-Auswahlfeld leer. Das Template erwähnt das nicht. | störend | Konvention «Versionsparameter `?v=` an Script-/Style-Links, bei jeder Änderung erhöhen» plus Test; alternativ Hinweis «nach Deploy hart neu laden». | behoben in RetroLos! (Versionsnummer + Test) |

## Übertrag ins Template

Pro behobener Lücke die genaue Änderung zum 1:1-Übernehmen. Projektspezifisches (RetroLos!-Namen, Retro-Dateimuster) ist durch allgemeine Platzhalter ersetzt.

### Lücke 3 – Actions anheben (`33dd04a`)

In `.github/workflows/deploy.yml`:

```diff
-      - uses: actions/checkout@v4
+      - uses: actions/checkout@v7
 …
-      - uses: actions/configure-pages@v5
+      - uses: actions/configure-pages@v6
 …
-      - uses: actions/upload-pages-artifact@v3
+      - uses: actions/upload-pages-artifact@v5
 …
-        uses: actions/deploy-pages@v4
+        uses: actions/deploy-pages@v5
```

Empfehlung zusätzlich: `.github/dependabot.yml` mit `package-ecosystem: github-actions`, damit die Versionen künftig von selbst aktuell bleiben.

### Lücke 6 – Tests vor dem Deploy (`e9f60b6`, korrigiert in `85b8f9d`)

In `.github/workflows/deploy.yml` direkt nach `actions/checkout`:

```yaml
      # Tests ohne package.json und ohne Abhängigkeiten (node:test ist eingebaut).
      # Schlägt ein Test fehl, wird nicht deployt.
      - uses: actions/setup-node@v7
        with:
          node-version: 24

      - name: Tests ausführen
        run: node --test "tests/*.test.js"
```

Wichtig: die Glob-Form in Anführungszeichen verwenden. `node --test tests/` (Ordner) geht erst ab Node 26 und liess den ersten Lauf scheitern. Damit der Workflow auch ohne Tests grün bleibt, im Template eine Beispieldatei `tests/example.test.js` mitliefern. In AGENTS.md die Zeile in «Commands»:

```diff
-| test / lint / format | none; TODO: Human clarification needed |
+| test | `node --test "tests/*.test.js"` – Node ≥ 22, keine Abhängigkeiten, läuft auch im Deploy-Workflow |
+| lint / format | none; TODO: Human clarification needed |
```

### Lücke 8 – Datenschutz-Bausteine (teilweise; `c889875`, `7c2ac9f`)

1. `.gitignore` um einen Abschnitt für interne Datendateien ergänzen (Muster pro Mini-App anpassen):

   ```gitignore
   # Interne Daten (Exporte, Team-Feedback) gehören nie ins Repository:
   # Repo und GitHub-Pages-Seite sind öffentlich.
   <app>-*.md
   <app>-daten/
   # Ausnahme: klar markierte, fiktive Demo-Dateien
   !docs/beispiele/<app>-*.md
   ```

2. Jede Seite: CSP-Meta-Tag im `<head>` (verbietet externe Anfragen, Inline-Scripts und Inline-Styles):

   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'">
   ```

3. Jede Seite: Prototyp-Banner direkt nach dem Header:

   ```html
   <aside class="banner" aria-label="Hinweis zum Prototyp">
     <p><strong>Prototyp</strong> – keine Kunden- oder Personendaten eingeben. Deine Eingaben bleiben in deinem Browser, bis du sie selbst als Datei speicherst.</p>
   </aside>
   ```

Offen bleibt die Regel «keine Kunden- oder Personendaten» als eigener Abschnitt in AGENTS.md (Entscheid Stefan).

### Lücke 21 – Drucken immer hell (`57c4f62`)

Am Ende von `styles.css` (Werte an die eigene helle Palette angleichen):

```css
/* Drucken immer mit heller Palette – auch wenn der Bildschirm im Dark Mode ist
   (Browser drucken Hintergründe meist nicht, helle Schrift wäre unsichtbar). */
@media print {
  :root {
    color-scheme: light;
    --color-bg: #ffffff;
    --color-surface: #ffffff;
    --color-text: #000000;
    --color-text-muted: #3a4256;
    --color-border: #b9c3d6;
    /* … übrige Farb-Tokens auf ihre hellen Werte … */
  }
}
```

In AGENTS.md «CSS» ergänzen: «Under `@media print`, reassign the light palette.»

### Lücke 23 – `[hidden]` gegen Komponenten-`display` (`2d86d13`)

Am Anfang des Basis-Abschnitts in `styles.css`:

```css
/* Das Attribut «hidden» ist eine Browser-Vorgabe (display: none), die jede
   Komponente mit eigener display-Regel (z. B. .button) überstimmt. Ohne
   !important bräuchte jede Komponente eine eigene [hidden]-Regel. */
[hidden] {
  display: none !important;
}
```

In AGENTS.md «CSS» bei der `!important`-Regel ergänzen: «The one standing exception is `[hidden] { display: none !important; }`.»

### Lücke 24 – Statischer Seiten-Test (`2d772c7`)

Datei [`tests/pages.test.js`](../tests/pages.test.js) ins Template übernehmen. Sie prüft für jede `*.html` im Root: CSP-Meta-Tag, nur `<script src … defer>` (kein `type="module"`, keine Inline-Scripts, keine `style="…"`, kein `<style>`, keine `on…=`-Handler), nur relative Pfade, alle referenzierten Dateien vorhanden, genau eine `<h1>`, `lang` gesetzt. Projektspezifisch anzupassen sind nur zwei Stellen: die Tabelle `MODULE_FILES` (Namensraum-Modul → Datei; leer lassen, wenn die App nur ein Script hat) und die Banner-Prüfung.

## Vorbereitete Issue-Texte

Für jede offene Lücke ein Issue-Text für Stefans Template-Repository. **Eröffnet werden sie nur auf ausdrücklichen Wunsch.** Vorgeschlagene Labels: `blockierend`, `störend`, `schönheitsfehler`.

**#1 – Weg vom Template zum eigenen Repository fehlt** · `blockierend`
> Der Quick Start sagt «Clone or fork». Wer das Template als ZIP herunterlädt oder ein eigenes Repo braucht, findet keinen Weg. Vorschlag: Repo als «Template repository» markieren und Schritt 1 = «Use this template → Create a new repository». Für den ZIP-Fall die Befehlsfolge `git init -b main` → Erst-Commit → `gh repo create <owner>/<name> --public --source=. --remote=origin --push` ergänzen.

**#2 – Erster Deploy scheitert, wenn vor dem Einschalten von Pages gepusht wird** · `störend`
> Wird gepusht, bevor «Source = GitHub Actions» gesetzt ist, endet der Lauf mit «Get Pages site failed … Not Found». Vorschlag: Reihenfolge im README betonen, CLI-Variante `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow` nennen und im Workflow vor `configure-pages` einen Schritt mit verständlicher Meldung einbauen.

**#4 – `touch .nojekyll` ist wirkungslos** · `schönheitsfehler`
> Mit der Quelle «GitHub Actions» läuft kein Jekyll, und `upload-pages-artifact` ab v4 lädt Dotfiles nicht hoch. Beleg: `specs/_template/spec.md` wurde ohne `.nojekyll` im Artefakt ausgeliefert (HTTP 200). Vorschlag: Schritt und Absatz in AGENTS.md streichen.

**#5 – Einmalige Einrichtung (Git, GitHub, E-Mail-Schutz) fehlt** · `blockierend`
> Ohne globale Git-Identität bricht der erste Commit ab oder trägt den Rechnernamen ein; `gh auth login` und `gh auth setup-git` werden nicht erklärt; der Schutz der eigenen E-Mail-Adresse mit der Noreply-Adresse fehlt. Vorschlag: Abschnitt «Einmalige Einrichtung» mit Befehlen, inkl. `git config --local user.email <id>+<login>@users.noreply.github.com`.

**#7 – Steckbrief für die Mini-App-Liste fehlt** · `störend`
> Jede Mini-App muss mit Owner, Zweck und Datenarten in die Liste. Vorschlag: Vorlage `miniapp.md` mit YAML-Frontmatter (Name, Zweck, Zielgruppe, Owner, Weg, Hosting, Datenablage, Kundendaten, Personendaten, externe Anfragen, Status) mitliefern – siehe `miniapp.md` in RetroLos!.

**#8 – Datenschutz-Regel für Lösung 1 fehlt in AGENTS.md** · `störend`
> Kern von «Solo Workout» ist: keine Kunden- oder Personendaten. Das Template sagt dazu nichts. Vorschlag: eigener Abschnitt in AGENTS.md (keine Kunden-/Personendaten, interne Daten nie ins öffentliche Repo, Banner und CSP auf jeder Seite) plus die Bausteine aus «Übertrag ins Template», Lücke 8.

**#9 – «Three Rules That Matter» nennt vier Regeln** · `schönheitsfehler`
> Überschrift im README auf «Four Rules That Matter» ändern.

**#10 – Sprachregel passt nicht zu deutschsprachigen Teams** · `störend`
> «English for code, identifiers, file names, and documentation» – zur UI-Sprache sagt das Template nichts. Vorschlag: Doku-Sprache pro Mini-App festlegen lassen, UI-Sprache ausdrücklich regeln; Code-Bezeichner Englisch als Empfehlung.

**#11 – Unklar, ob Ordner wie `docs/` und `tests/` erlaubt sind** · `schönheitsfehler`
> «Flat, no nesting» – das Template hat selbst `specs/`. Vorschlag: präzisieren, dass «flach» für Seiten und Assets gilt; Ordner für Doku, Tests und Specs sind erlaubt.

**#12 – Regel «ohne JavaScript lauffähig» passt nicht zu interaktiven Mini-Apps** · `störend`
> Mini-Apps sind meist Werkzeuge (Formulare, Boards, Timer). Vorschlag: Inhalte, Erklärungen und Navigation ohne JavaScript; Werkzeug-Funktionen dürfen JavaScript brauchen, mit `<noscript>`-Hinweis.

**#13 – Erlaubte Dateitypen zu eng** · `schönheitsfehler`
> `.json` (Konfiguration, Steckbrief) und `.webmanifest` sind ausgeschlossen. Vorschlag: zulassen oder den Ausschluss begründen.

**#14 – PR-Pflicht ohne Merge-Standard** · `störend`
> Merge-Strategie und Freigaben sind «TODO»; für Laien ist der PR-Ablauf eine Hürde, und live geht es erst nach dem Merge. Vorschlag für Solo Workouts: ein PR pro Feature, Merge-Commit, selbst mergen erlaubt.

**#15 – `.vscode/` komplett ignoriert** · `schönheitsfehler`
> Empfohlene Extensions lassen sich nicht teilen. Vorschlag: `.vscode/*` und `!.vscode/extensions.json`.

**#16 – Token-Liste unvollständig, «never raw values» zu absolut** · `schönheitsfehler`
> Schatten, Bewegung und Rahmen fehlen in der Namensliste; `1px`, `0` oder `1fr` als Tokens sind unpraktisch. Vorschlag: `--shadow-*`, `--motion-*`, `--border` ergänzen; die Regel auf Farben, Abstände, Schriften und Radien beschränken; `--motion-*` unter `prefers-reduced-motion` auf ~0 setzen.

**#17 – Commit-Konvention** · `schönheitsfehler`
> «English, imperative» ohne Struktur. Vorschlag: Conventional Commits empfehlen, Sprache freistellen.

**#18 – Muster für Code-Sharing und Tests ohne ES-Module fehlt** · `störend`
> Ohne Module erfindet jede Mini-App neu, wie Dateien Code teilen («no globals») und wie man sie in Node testet. Vorschlag: Muster dokumentieren – ein Namensraum `window.<App>`, am Dateiende `if (typeof module === 'object') module.exports = api;`, dann klappt `require()` in `node --test`.

**#19 – Lokale `file://`-Links taugen nicht zum Teilen** · `schönheitsfehler`
> «Datei direkt öffnen» ist der empfohlene Weg; alles, was die App zum Teilen erzeugt, zeigt dann auf `file://`. Vorschlag: Hinweis im README und Konvention für eine Konfigurationszeile mit der Live-Adresse.

**#20 – «No inline style» vs. per JavaScript gesetzte Werte unklar** · `schönheitsfehler`
> Mit CSP sind `element.style.<prop>` und Custom Properties erlaubt, `style="…"` nicht. Vorschlag: genau so präzisieren.

**#22 – Definition of Done prüft zu wenig** · `störend`
> Einziger Prüfschritt ist «im Browser öffnen, auch ohne JavaScript». Vorschlag: Checkliste um keine Konsolenfehler, keine fremden Anfragen im Netzwerk-Tab, 390 px Breite, Dark Mode und Tastaturbedienung ergänzen.

**#26 – Leitplanke für die Grösse einer Mini-App fehlt** · `störend`
> Ohne Regel wuchs RetroLos! zum Sprint-Tool und musste zurückgebaut werden. Vorschlag: Abschnitt «Was ist eine Mini-App?» (eine Aufgabe, eine Seite, Single-User, keine Sessions).

**#25 – README- und Demo-Vorlage für Mini-Apps fehlt** · `schönheitsfehler`
> Vorschlag: README-Gerüst mit Pflichtabschnitten «Datenschutz-Prinzip» und «Grenzen des Prototyps»; RetroLos! kann als Beispiel dienen.

## Vorbereitete Issue-Texte

_Folgen in Phase 7. Issues werden nur auf ausdrücklichen Wunsch eröffnet._
