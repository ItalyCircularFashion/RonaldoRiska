/**
 * RonaldoRiska — Mobile class toggle
 * Aggiunge la classe "mobile" al <body> quando il viewport è < 768px.
 * Utile per stili extra e gestione del menu hamburger su dispositivi
 * con schermo ridotto.
 *
 * Uso: includere prima di </body> in ogni pagina HTML:
 *   <script src="mobile.js"></script>
 */

(function () {
  "use strict";

  var MOBILE_BREAKPOINT = 768;
  var hasRun = false;

  function applyMobileClass() {
    if (hasRun) return; // una volta sola per evitare reflow
    hasRun = true;

    var isMobile = typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;
    var body = document.body;

    if (isMobile) {
      body.classList.add("mobile");
    } else {
      body.classList.remove("mobile");
    }
  }

  // Esegui subito
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyMobileClass);
  } else {
    applyMobileClass();
  }

  // Re-evalua su resize (throttle manuale)
  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyMobileClass, 120);
  });
})();
