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

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "task__delete";
  deleteButton.textContent = "✕";
  // El botón solo muestra una ✕; aria-label le da un nombre claro para lectores de pantalla.
  deleteButton.setAttribute("aria-label", `Eliminar tarea: ${task.text}`);
  deleteButton.addEventListener("click", () => deleteTask(task.id));

  item.append(checkbox, text, deleteButton);
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
