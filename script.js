// ===== Configuración =====
// Pon aquí las fechas reales del mantenimiento (inicio y vuelta prevista).
// Ejemplo:
// const START_DATE = new Date("2026-11-19T09:00:00");
// const END_DATE   = new Date("2026-11-21T10:00:00");
const START_DATE = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // demo: empezó hace 1 día
const END_DATE = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);   // demo: termina en 2 días

const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");

// ===== Cuenta atrás =====
function setUnit(id, value) {
  const el = $(id);
  const text = pad(value);
  if (el.textContent !== text) {
    el.textContent = text;
    el.classList.remove("tick");
    void el.offsetWidth; // reinicia la animación
    el.classList.add("tick");
  }
}

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, END_DATE - now);

  setUnit("d", Math.floor(diff / 86400000));
  setUnit("h", Math.floor((diff / 3600000) % 24));
  setUnit("m", Math.floor((diff / 60000) % 60));
  setUnit("s", Math.floor((diff / 1000) % 60));

  const total = END_DATE - START_DATE;
  const pct = total > 0 ? Math.min(100, Math.max(0, ((now - START_DATE) / total) * 100)) : 100;
  $("progress-bar").style.width = pct + "%";
  $("progress-label").textContent = `${Math.floor(pct)}%`;
  document.querySelector(".progress").setAttribute("aria-valuenow", Math.round(pct));

  if (diff === 0) {
    clearInterval(timer);
    $("progress-label").textContent = "¡Listo!";
  }
}

const timer = setInterval(updateCountdown, 1000);
updateCountdown();

// ===== Formulario de aviso =====
$("notify-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("email").value.trim();
  const msg = $("form-message");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    msg.textContent = "Introduce un correo electrónico válido.";
    msg.className = "message error";
    return;
  }

  // Aquí podrías enviar el correo a tu backend con fetch().
  msg.textContent = "¡Gracias! Te avisaremos en cuanto volvamos. 🧡";
  msg.className = "message ok";
  e.target.reset();
});

// ===== Tema claro / oscuro =====
const root = document.documentElement;
const getStored = () => { try { return localStorage.getItem("theme"); } catch { return null; } };
const setStored = (v) => { try { localStorage.setItem("theme", v); } catch {} };

root.dataset.theme = getStored() || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

$("theme-toggle").addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  setStored(next);
});

// ===== Animación de entrada =====
requestAnimationFrame(() => {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
});

// ===== Año del footer =====
$("year").textContent = new Date().getFullYear();
