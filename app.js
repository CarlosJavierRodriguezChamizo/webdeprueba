// =====================================================================
// Gestor de tareas
// Idea principal: todas las tareas viven en el array `tasks`. Cada cambio
// sigue siempre los mismos pasos: cambiar el array → guardar → repintar.
// =====================================================================

// ===== Constantes =====
// Orden de las prioridades (número menor = sale antes) y texto que se muestra.
const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 };
const PRIORITY_LABELS = { alta: "Alta", media: "Media", baja: "Baja" };

// Mensaje cuando no hay tareas que mostrar, según el filtro activo.
const EMPTY_MESSAGES = {
  todas: "No hay tareas todavía. ¡Añade la primera!",
  pendientes: "No tienes tareas pendientes. ¡Buen trabajo!",
  completadas: "Aún no has completado ninguna tarea.",
};

// ===== Estado =====
// Al abrir la página se cargan las tareas guardadas (loadTasks está en storage.js).
// Cada tarea: { id, text, completed, priority, dueDate }
let tasks = loadTasks();

// Filtro activo: "todas", "pendientes" o "completadas".
let currentFilter = "todas";

// ===== Referencias a elementos del HTML =====
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const prioritySelect = document.getElementById("task-priority");
const dueInput = document.getElementById("task-due");
const errorMessage = document.getElementById("task-error");
const list = document.getElementById("task-list");
const emptyMessage = document.getElementById("empty-message");
const counter = document.getElementById("task-count");
const filterButtons = document.querySelectorAll(".filters__button");
const clearCompletedButton = document.getElementById("clear-completed");

// =====================================================================
// Acciones: cambian el array, guardan y repintan
// =====================================================================

function addTask(text, priority, dueDate) {
  tasks.push({
    id: Date.now(), // identificador único para encontrar la tarea después
    text: text,
    completed: false,
    priority: priority, // "alta", "media" o "baja"
    dueDate: dueDate, // "AAAA-MM-DD" o "" si no tiene fecha
  });
  saveAndRender();
}

// Cambia completed de true a false o al revés.
function toggleTask(id) {
  const task = findTask(id);
  if (!task) return;

  task.completed = !task.completed;
  saveAndRender();
}

function updateTaskText(id, newText) {
  const task = findTask(id);
  if (!task) return;

  task.text = newText;
  saveAndRender();
}

function deleteTask(id) {
  // filter crea un array nuevo sin esa tarea; por eso tasks es "let" y no "const".
  tasks = tasks.filter((task) => task.id !== id);
  saveAndRender();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveAndRender();
}

function findTask(id) {
  return tasks.find((task) => task.id === id);
}

function saveAndRender() {
  saveTasks(tasks); // está en storage.js
  renderTasks();
}

// =====================================================================
// Pintar la página
// =====================================================================

// Vacía la lista y vuelve a crear un <li> por cada tarea visible.
function renderTasks() {
  const visibleTasks = getVisibleTasks();

  list.textContent = "";
  visibleTasks.forEach((task) => {
    list.appendChild(createTaskItem(task));
  });

  // Si no hay nada que mostrar, enseñamos un mensaje en lugar de la lista.
  emptyMessage.hidden = visibleTasks.length > 0;
  emptyMessage.textContent = EMPTY_MESSAGES[currentFilter];

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

// Crea el <li> de una tarea: casilla + contenido + botones.
function createTaskItem(task) {
  const item = document.createElement("li");
  item.className = `task task--${task.priority}`; // color de la prioridad (ver styles.css)
  item.dataset.id = task.id; // atributo data-id para encontrar el <li> después
  item.classList.toggle("task--completed", task.completed); // tacha el texto
  item.classList.toggle("task--overdue", isOverdue(task)); // destaca en rojo

  const textId = `task-text-${task.id}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task__checkbox";
  checkbox.checked = task.completed;
  // El texto no va dentro de un <label> (un doble clic marcaría la casilla),
  // así que lo enlazamos con aria-labelledby para que la casilla tenga nombre.
  checkbox.setAttribute("aria-labelledby", textId);
  checkbox.addEventListener("change", () => {
    toggleTask(task.id);
    focusTaskOrInput(task.id, ".task__checkbox");
  });

  const text = document.createElement("span");
  text.className = "task__text";
  text.id = textId;
  text.textContent = task.text; // textContent: el texto nunca se interpreta como HTML
  text.title = "Doble clic para editar";
  text.addEventListener("dblclick", () => startEditing(item, task));

  const content = document.createElement("div");
  content.className = "task__content";
  content.append(text, createTaskDetails(task));

  const editButton = createIconButton("✎", `Editar tarea: ${task.text}`, "task__button task__button--edit");
  editButton.addEventListener("click", () => startEditing(item, task));

  const deleteButton = createIconButton("✕", `Eliminar tarea: ${task.text}`, "task__button task__button--delete");
  deleteButton.addEventListener("click", () => {
    deleteTask(task.id);
    input.focus(); // el botón pulsado ya no existe: llevamos el foco al campo de texto
  });

  item.append(checkbox, content, editButton, deleteButton);
  return item;
}

// Línea pequeña bajo el texto: prioridad y, si la hay, fecha límite.
function createTaskDetails(task) {
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

  return details;
}

// Botón que solo muestra un símbolo; aria-label le da un nombre claro
// para lectores de pantalla, y title lo muestra al pasar el ratón.
function createIconButton(symbol, label, className) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = symbol;
  button.setAttribute("aria-label", label);
  button.title = label;
  return button;
}

function updateCounter() {
  const pending = tasks.filter((task) => !task.completed).length;
  counter.textContent = pending === 1 ? "1 tarea pendiente" : `${pending} tareas pendientes`;

  // "Borrar completadas" solo se puede pulsar si hay alguna completada.
  clearCompletedButton.disabled = !tasks.some((task) => task.completed);
}

// Marca (visualmente y para lectores de pantalla) qué filtro está activo.
function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.setAttribute("aria-pressed", String(isActive));
  });
}

// Al repintar, los elementos son nuevos y el foco se pierde. Esta función lo
// devuelve al elemento de la tarea indicada; si la tarea ya no se ve (por el
// filtro), lo lleva al campo de texto para que el teclado no "se pierda".
function focusTaskOrInput(id, selector) {
  const element = list.querySelector(`[data-id="${id}"] ${selector}`);
  if (element) {
    element.focus();
  } else {
    input.focus();
  }
}

// =====================================================================
// Editar una tarea (doble clic o botón ✎). Enter guarda, Escape cancela.
// =====================================================================

function startEditing(item, task) {
  const text = item.querySelector(".task__text");
  if (!text) return; // ya se está editando

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "task__edit";
  editInput.value = task.text;
  editInput.setAttribute("aria-label", `Editar tarea: ${task.text}`);

  // Evita terminar dos veces (Enter repinta y entonces el campo pierde el foco → blur).
  let finished = false;

  function finish(save) {
    if (finished) return;
    finished = true;

    const newText = editInput.value.trim();
    if (save && newText !== "") {
      updateTaskText(task.id, newText);
    } else {
      renderTasks(); // cancelar (o texto vacío): la tarea vuelve a como estaba
    }
  }

  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === "Escape") {
      // preventDefault: sin esto, la misma pulsación de Enter "pulsaría" también
      // el botón ✎ que recibe el foco justo después y volvería a abrir la edición.
      event.preventDefault();
      finish(event.key === "Enter");
      // Devolvemos el foco al botón ✎ de esa tarea para seguir con el teclado.
      focusTaskOrInput(task.id, ".task__button--edit");
    }
  });
  // Si se hace clic fuera, se guarda (igual que pulsar Enter).
  editInput.addEventListener("blur", () => finish(true));

  text.replaceWith(editInput);
  editInput.focus();
  editInput.select(); // selecciona el texto para poder reescribirlo directamente
}

// =====================================================================
// Fechas
// =====================================================================

// Fecha de hoy en formato "AAAA-MM-DD" (el mismo que usa <input type="date">).
function getTodayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Vencida = tiene fecha, esa fecha ya pasó y no está completada.
// Las fechas "AAAA-MM-DD" se pueden comparar directamente como texto.
function isOverdue(task) {
  return task.dueDate !== "" && task.dueDate < getTodayString() && !task.completed;
}

// "2026-11-21" → "21/11/2026"
function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

// =====================================================================
// Formulario y mensajes de error
// =====================================================================

function showError(message) {
  errorMessage.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function clearError() {
  errorMessage.textContent = "";
  input.removeAttribute("aria-invalid");
}

function resetForm() {
  input.value = "";
  prioritySelect.value = "media";
  dueInput.value = "";
}

// =====================================================================
// Eventos
// =====================================================================

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
  resetForm();
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
