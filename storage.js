// ===== Guardar y cargar tareas en localStorage =====
// localStorage solo guarda texto, así que convertimos el array a JSON al guardar
// y lo volvemos a convertir en array al cargar.

const STORAGE_KEY = "gestor-tareas";
const VALID_PRIORITIES = ["alta", "media", "baja"];

// Guarda el array de tareas.
function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    // Puede fallar en modo privado o si el almacenamiento está lleno.
    console.warn("No se pudieron guardar las tareas:", error);
  }
}

// Devuelve el array de tareas guardado, o un array vacío si no hay nada válido.
function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(data)) {
      return [];
    }

    // Nos quedamos solo con las tareas que tienen el formato esperado.
    // Las tareas guardadas en fases anteriores pueden no tener todos los campos:
    // les damos un valor por defecto (pendiente, prioridad media, sin fecha).
    return data
      .filter((task) => task && typeof task.text === "string")
      .map((task) => ({
        id: task.id,
        text: task.text,
        completed: task.completed === true,
        priority: VALID_PRIORITIES.includes(task.priority) ? task.priority : "media",
        dueDate: typeof task.dueDate === "string" ? task.dueDate : "",
      }));
  } catch (error) {
    // Datos corruptos o localStorage no disponible: empezamos con la lista vacía.
    return [];
  }
}
