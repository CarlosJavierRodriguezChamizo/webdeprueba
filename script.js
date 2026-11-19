// ===== Configuración =====
// Fecha y hora estimadas de vuelta (formato ISO). Ajústala a tu caso.
const END_DATE = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // por defecto: dentro de 2 días
// const END_DATE = new Date("2026-11-21T10:00:00");
const START_DATE = new Date(); // inicio del mantenimiento (para la barra de progreso)

// ===== Cuenta atrás =====
const $ = (id) => document.getElementById(id);
const pad = (n) => String(n).padStart(2, "0");

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, END_DATE - now);

  $("d").textContent = pad(Math.floor(diff / 86400000));
  $("h").textContent = pad(Math.floor((diff / 3600000) % 24));
  $("m").textContent = pad(Math.floor((diff / 60000) % 60));
  $("s").textContent = pad(Math.floor((diff / 1000) % 60));

  const total = END_DATE - START_DATE;
  const pct = total > 0 ? Math.min(100, ((now - START_DATE) / total) * 100) : 100;
  $("progress-bar").style.width = pct + "%";
  $("progress-label").textContent = `Progreso: ${pct.toFixed(1)}%`;
  document.querySelector(".progress").setAttribute("aria-valuenow", Math.round(pct));

  if (diff === 0) {
    clearInterval(timer);
    $("progress-label").textContent = "¡Ya casi estamos! Recarga la página en unos instantes.";
  }
}

const timer = setInterval(updateCountdown, 1000);
updateCountdown();

// ===== Formulario de aviso =====
$("notify-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("email").value.trim();
  const msg = $("form-message");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!valid) {
    msg.textContent = "Introduce un correo electrónico válido.";
    msg.className = "message error";
    return;
  }

  // Aquí podrías enviar el correo a tu backend con fetch().
  msg.textContent = "¡Gracias! Te avisaremos cuando volvamos.";
  msg.className = "message ok";
  e.target.reset();
});

// ===== Tema claro / oscuro =====
const root = document.documentElement;
const getStored = () => { try { return localStorage.getItem("theme"); } catch { return null; } };
const setStored = (v) => { try { localStorage.setItem("theme", v); } catch {} };

const initial = getStored() || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
root.dataset.theme = initial;

$("theme-toggle").addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  setStored(next);
});

// ===== Año del footer =====
$("year").textContent = new Date().getFullYear();
