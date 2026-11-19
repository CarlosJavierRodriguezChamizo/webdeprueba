// ===== Estado =====
// Todas las tareas viven en este array. La lista de la página se "pinta" a partir de él.
// Al abrir la página se cargan las tareas guardadas (funciones de storage.js).
let tasks = loadTasks();

// Filtro activo: "todas", "pendientes" o "completadas".
let currentFilter = "todas";

// Orden de las prioridades (número menor = sale antes) y texto que se muestra.
const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 };
const PRIORITY_LABELS = { alta: "Alta", media: "Media", baja: "Baja" };

// ===== Referencias a elementos del HTML =====
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const prioritySelect = document.getElementById("task-priority");
const dueInput = document.getElementById("task-due");
const list = document.getElementById("task-list");
const errorMessage = document.getElementById("task-error");
const counter = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filters__button");
const clearCompletedButton = document.getElementById("clear-completed");

// ===== Pintar la lista =====
// Vacía la lista y vuelve a crear un <li> por cada tarea visible según el filtro.
function renderTasks() {
  list.textContent = "";

  getVisibleTasks().forEach((task) => {
    list.appendChild(createTaskItem(task));
  });

  updateCounter();
  updateFilterButtons();
}

// Devuelve las tareas del filtro activo, ordenadas por prioridad (alta → media → baja).
function getVisibleTasks() {
  let visible = tasks;
  if (currentFilter === "pendientes") {
    visible = tasks.filter((task) => !task.completed);
  } else if (currentFilter === "completadas") {
    visible = tasks.filter((task) => task.completed);
  }

  // slice() hace una copia para no cambiar el orden del array original.
  // Si dos tareas tienen la misma prioridad, sort mantiene su orden de creación.
  return visible
    .slice()
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

// ===== Fechas =====
// Fecha de hoy en formato "AAAA-MM-DD" (el mismo que usa <input type="date">).
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Una tarea está vencida si tiene fecha, esa fecha ya pasó y no está completada.
// Las fechas "AAAA-MM-DD" se pueden comparar directamente como texto.
function isOverdue(task) {
  return task.dueDate !== "" && task.dueDate < getTodayString() && !task.completed;
}

// "2026-11-21" → "21/11/2026"
function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

// ===== Contador y botones =====
function updateCounter() {
  const pending = tasks.filter((task) => !task.completed).length;
  counter.textContent = pending === 1 ? "1 tarea pendiente" : `${pending} tareas pendientes`;

  // "Borrar completadas" solo se puede pulsar si hay alguna completada.
  clearCompletedButton.disabled = !tasks.some((task) => task.completed);
}

// Marca visualmente (y para lectores de pantalla) qué filtro está activo.
function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.setAttribute("aria-pressed", String(isActive));
  });
}

// Crea el <li> de una tarea: casilla + texto + botón de eliminar.
function createTaskItem(task) {
  const item = document.createElement("li");
  item.className = "task";
  item.dataset.id = task.id; // guarda el id en el HTML (atributo data-id) para encontrar el <li> después
  item.classList.add(`task--${task.priority}`); // color de la prioridad (ver styles.css)
  if (task.completed) {
    item.classList.add("task--completed"); // esta clase tacha el texto (ver styles.css)
  }
  if (isOverdue(task)) {
    item.classList.add("task--overdue"); // las vencidas se destacan en rojo
  }

  const textId = `task-text-${task.id}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task__checkbox";
  checkbox.checked = task.completed;
  // El texto no va dentro de un <label> (un doble clic marcaría la casilla),
  // así que lo enlazamos con aria-labelledby para que la casilla tenga nombre.
  checkbox.setAttribute("aria-labelledby", textId);
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const text = document.createElement("span");
  text.className = "task__text";
  text.id = textId;
  text.textContent = task.text; // textContent: el texto del usuario nunca se interpreta como HTML
  text.title = "Doble clic para editar";
  text.addEventListener("dblclick", () => startEditing(item, task));

  // Debajo del texto: etiqueta de prioridad y, si la hay, la fecha límite.
  const details = document.createElement("span");
  details.className = "task__details";

  const priority = document.createElement("span");
  priority.className = "task__priority";
  priority.textContent = PRIORITY_LABELS[task.priority];
  details.appendChild(priority);

  if (task.dueDate !== "") {
    const due = document.createElement("span");
    due.className = "task__due";
    const prefix = isOverdue(task) ? "Vencida: " : "Vence: ";
    due.textContent = prefix + formatDate(task.dueDate);
    details.appendChild(due);
  }

  // El texto y los detalles van juntos en un bloque.
  const content = document.createElement("div");
  content.className = "task__content";
  content.append(text, details);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "task__delete";
  deleteButton.textContent = "✕";
  // El botón solo muestra una ✕; aria-label le da un nombre claro para lectores de pantalla.
  deleteButton.setAttribute("aria-label", `Eliminar tarea: ${task.text}`);
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  item.append(checkbox, content, deleteButton);
  return item;
}

// ===== Editar una tarea =====
// Cambia el texto de la tarea por un campo de texto. Enter guarda, Escape cancela.
function startEditing(item, task) {
  const text = item.querySelector(".task__text");

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "task__edit";
  editInput.value = task.text;
  editInput.setAttribute("aria-label", "Editar tarea");

  // Evita guardar dos veces (Enter guarda y, al repintar, el campo pierde el foco → blur).
  let finished = false;

  function finish(save) {
    if (finished) return;
    finished = true;

    const newText = editInput.value.trim();
    if (save && newText !== "") {
      updateTaskText(task.id, newText);
    } else {
      renderTasks(); // cancelar: volvemos a pintar la tarea como estaba
    }
    focusTask(task.id, ".task__checkbox");
  }

  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") finish(true);
    if (event.key === "Escape") finish(false);
  });
  // Si se hace clic fuera, se guarda (igual que pulsar Enter).
  editInput.addEventListener("blur", () => finish(true));

  text.replaceWith(editInput);
  editInput.focus();
  editInput.select(); // selecciona todo el texto para poder reescribirlo directamente
}

function updateTaskText(id, newText) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.text = newText;
  saveTasks(tasks);
  renderTasks();
}

// Después de repintar, los elementos son nuevos: esta función pone el foco
// en un elemento de la tarea indicada (si todavía existe).
function focusTask(id, selector) {
  const element = list.querySelector(`[data-id="${id}"] ${selector}`);
  if (element) element.focus();
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
function addTask(text, priority, dueDate) {
  tasks.push({
    id: Date.now(), // identificador único para encontrar la tarea al completarla o eliminarla
    text: text,
    completed: false,
    priority: priority, // "alta", "media" o "baja"
    dueDate: dueDate, // "AAAA-MM-DD" o "" si no tiene fecha
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
  focusTask(id, ".task__checkbox");
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

// ===== Borrar completadas =====
function clearCompleted() {
  // filter crea un array nuevo solo con las pendientes; por eso tasks es "let" y no "const".
  tasks = tasks.filter((task) => !task.completed);
  saveTasks(tasks);
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
  addTask(text, prioritySelect.value, dueInput.value);

  // Dejamos el formulario listo para la siguiente tarea.
  input.value = "";
  prioritySelect.value = "media";
  dueInput.value = "";
  input.focus();
});

// Al empezar a escribir, el aviso de error desaparece.
input.addEventListener("input", clearError);

// Filtros: cada botón guarda su filtro en el atributo data-filter.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  clearCompleted();
  input.focus(); // el botón queda desactivado, así que movemos el foco a un sitio útil
});

// Pintado inicial con las tareas cargadas.
renderTasks();
