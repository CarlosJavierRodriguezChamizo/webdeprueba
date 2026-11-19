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
    list.appendChild(createTaskItem(task));
  });
}

// Crea el <li> de una tarea: casilla + texto + botón de eliminar.
function createTaskItem(task) {
  const item = document.createElement("li");
  item.className = "task";
  item.dataset.id = task.id; // guarda el id en el HTML (atributo data-id) para encontrar el <li> después
  if (task.completed) {
    item.classList.add("task--completed"); // esta clase tacha el texto (ver styles.css)
  }

  // La casilla y el texto van dentro de un <label>: así, pulsar el texto también marca la casilla.
  const label = document.createElement("label");
  label.className = "task__label";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task__checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const text = document.createElement("span");
  text.className = "task__text";
  text.textContent = task.text; // textContent: el texto del usuario nunca se interpreta como HTML

  label.append(checkbox, text);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "task__delete";
  deleteButton.textContent = "✕";
  // El botón solo muestra una ✕; aria-label le da un nombre claro para lectores de pantalla.
  deleteButton.setAttribute("aria-label", `Eliminar tarea: ${task.text}`);
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  item.append(label, deleteButton);
  return item;
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
    id: Date.now(), // identificador único para encontrar la tarea al completarla o eliminarla
    text: text,
    completed: false,
  });
  saveTasks(tasks); // guardar después de cada cambio
  renderTasks();
}

// ===== Completar una tarea =====
// Cambia completed de true a false o al revés.
function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.completed = !task.completed;
  saveTasks(tasks);
  renderTasks();

  // Al repintar, la casilla se crea de nuevo y se pierde el foco: lo devolvemos a ella
  // para que quien usa el teclado pueda seguir donde estaba.
  list.querySelector(`[data-id="${id}"] .task__checkbox`).focus();
}

// ===== Eliminar una tarea =====
function deleteTask(id) {
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return;

  tasks.splice(index, 1); // splice quita 1 elemento en la posición index
  saveTasks(tasks);
  renderTasks();
  input.focus(); // el botón pulsado ya no existe: llevamos el foco al campo de texto
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
