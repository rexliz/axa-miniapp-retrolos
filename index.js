/* RetroLos! – Startseite: Wer mit einem Einladungslink auf der Startseite
   landet, kommt direkt in den Teilnahmemodus. */
(function () {
  'use strict';
  if (/(?:^#|&)einladung=/.test(window.location.hash)) {
    window.location.replace('teilnehmen.html' + window.location.hash);
  }
})();
