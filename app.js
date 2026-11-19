// ===== Estado =====
// Todas las tareas viven en este array. La lista de la página se "pinta" a partir de él.
// Al abrir la página se cargan las tareas guardadas (funciones de storage.js).
const tasks = loadTasks();

// ===== Referencias a elementos del HTML =====
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const errorMessage = document.getElementById("task-error");

// ===== Pintar la lista =====
// Vacía la lista y vuelve a crear un <li> por cada tarea del array.
function renderTasks() {
  list.textContent = "";

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task";

    const text = document.createElement("span");
    text.className = "task__text";
    text.textContent = task.text; // textContent: el texto del usuario nunca se interpreta como HTML

    item.appendChild(text);
    list.appendChild(item);
  });
}

// ===== Mensajes de error =====
function showError(message) {
  errorMessage.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function clearError() {
  errorMessage.textContent = "";
  input.removeAttribute("aria-invalid");
}

// ===== Añadir una tarea =====
function addTask(text) {
  tasks.push({
    id: Date.now(), // identificador único; lo usaremos en fases siguientes
    text: text,
  });
  saveTasks(tasks); // guardar después de cada cambio
  renderTasks();
}

// ===== Eventos =====
form.addEventListener("submit", (event) => {
  event.preventDefault(); // evita que el formulario recargue la página

  const text = input.value.trim(); // trim() quita los espacios del principio y del final

  if (text === "") {
    showError("Escribe algo antes de añadir la tarea.");
    input.focus();
    return;
  }

  clearError();
  addTask(text);
  input.value = "";
  input.focus();
});

// Al empezar a escribir, el aviso de error desaparece.
input.addEventListener("input", clearError);

// Pintado inicial con las tareas cargadas.
renderTasks();
