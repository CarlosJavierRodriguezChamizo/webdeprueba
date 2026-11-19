(function () {
  "use strict";

  // ===== Configuración =====
  // Pon aquí las fechas reales del mantenimiento (inicio y vuelta prevista).
  // Ejemplo:
  // var START_DATE = new Date("2026-11-19T09:00:00");
  // var END_DATE   = new Date("2026-11-21T10:00:00");
  var DAY = 24 * 60 * 60 * 1000;
  var START_DATE = new Date(Date.now() - 1 * DAY); // demo: empezó hace 1 día
  var END_DATE = new Date(Date.now() + 2 * DAY);   // demo: termina en 2 días

  function $(id) { return document.getElementById(id); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* sin almacenamiento */ }
  }

  // ===== Cuenta atrás y progreso =====
  function initCountdown() {
    var ids = ["d", "h", "m", "s"];
    for (var i = 0; i < ids.length; i++) if (!$(ids[i])) return;

    var bar = $("progress-bar");
    var label = $("progress-label");
    var progress = document.querySelector(".progress");
    var timer = null;

    function setUnit(id, value) {
      var el = $(id);
      var text = pad(value);
      if (el.textContent !== text) {
        el.textContent = text;
        el.classList.remove("tick");
        void el.offsetWidth; // reinicia la animación
        el.classList.add("tick");
      }
    }

    function update() {
      var now = Date.now();
      var diff = Math.max(0, END_DATE.getTime() - now);

      setUnit("d", Math.floor(diff / 86400000));
      setUnit("h", Math.floor((diff / 3600000) % 24));
      setUnit("m", Math.floor((diff / 60000) % 60));
      setUnit("s", Math.floor((diff / 1000) % 60));

      var total = END_DATE.getTime() - START_DATE.getTime();
      var pct = total > 0 ? ((now - START_DATE.getTime()) / total) * 100 : 100;
      pct = Math.min(100, Math.max(0, pct));

      if (bar) bar.style.width = pct + "%";
      if (label) label.textContent = Math.floor(pct) + "%";
      if (progress) progress.setAttribute("aria-valuenow", Math.round(pct));

      if (diff === 0 && timer) {
        clearInterval(timer);
        if (label) label.textContent = "¡Listo!";
      }
    }

    update();
    timer = setInterval(update, 1000);
  }

  // ===== Formulario de aviso =====
  function initForm() {
    var form = $("notify-form");
    var input = $("email");
    var msg = $("form-message");
    if (!form || !input || !msg) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = input.value.trim();

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = "Introduce un correo electrónico válido.";
        msg.className = "message error";
        input.focus();
        return;
      }

      // Aquí podrías enviar el correo a tu backend con fetch().
      msg.textContent = "¡Gracias! Te avisaremos en cuanto volvamos.";
      msg.className = "message ok";
      form.reset();
    });
  }

  // ===== Tema claro / oscuro =====
  function initTheme() {
    var root = document.documentElement;
    if (!root.getAttribute("data-theme")) {
      var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", storageGet("theme") || (prefersDark ? "dark" : "light"));
    }

    var btn = $("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      storageSet("theme", next);
    });
  }

  // ===== Año del footer =====
  function initYear() {
    var el = $("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  function init() {
    // Cada bloque va aislado: si uno falla, el resto sigue funcionando.
    var parts = [initTheme, initCountdown, initForm, initYear];
    for (var i = 0; i < parts.length; i++) {
      try { parts[i](); } catch (err) { console.error("Error en", parts[i].name, err); }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
