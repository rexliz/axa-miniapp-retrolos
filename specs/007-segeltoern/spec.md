# Spec – Umbau zur Segeltörn-Mini-App

| Feld | Wert |
|---|---|
| ID | `007-segeltoern` |
| Status | implemented |
| Owner | ZHAW-Team (konkrete Person offen) |
| Zuletzt geändert | 2026-11-11 |

## 1. Zweck

Die erste Version war ein Sprint-Tool für ganze Teams. Mini-Apps müssen schmal sein, und Teilen oder Sessions sind aus internen Gründen nicht möglich. RetroLos! wird deshalb eine Einzelnutzer-Retro im beliebten Format Segelboot – eine Seite, im Look des AXA-Webauftritts.

## 2. Akzeptanzkriterien

| ID | Gegeben | Wenn | Dann |
|---|---|---|---|
| AC-1 | die Seite | sie lädt | gibt es nur Titel, Törn/Datum, Segelboot-Szene, vier Zonen, «Kurs setzen» und das Logbuch – keine Agenda, keine Links, keine Erklärseiten |
| AC-2 | eine Zone | ich eine Notiz hinzufüge oder lösche | aktualisieren sich Liste, Zähler, Boot (Wind vor, Anker zurück, Felsen, Inselflagge) und Kursanzeige |
| AC-3 | «Kurs setzen» | ich Schritte hinzufüge | sind höchstens drei möglich |
| AC-4 | ein Törn | ich «Logbuch speichern» bzw. «Text kopieren» wähle | erhalte ich `retro-segelboot-<datum>.md` bzw. eine Kurzfassung |
| AC-5 | Eingaben | ich die Seite neu lade | ist alles da; «Neu beginnen» löscht nach Rückfrage |
| AC-6 | eine Notiz mit E-Mail, Telefon, IBAN, AHV oder langer Nummer | ich tippe | erscheint ein nicht blockierender Hinweis |
| AC-7 | die Seite | sie geladen ist | gibt es keine Konsolenfehler und keine fremden Anfragen; hell/dunkel/Handy funktionieren |
