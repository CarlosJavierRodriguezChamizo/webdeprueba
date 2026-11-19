// ===== Guardar y cargar tareas en localStorage =====
// localStorage solo guarda texto, así que convertimos el array a JSON al guardar
// y lo volvemos a convertir en array al cargar.

const STORAGE_KEY = "gestor-tareas";

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
    // Las tareas guardadas antes de la Fase 4 no tienen "completed": las damos por pendientes.
    return data
      .filter((task) => task && typeof task.text === "string")
      .map((task) => ({
        id: task.id,
        text: task.text,
        completed: task.completed === true,
      }));
  } catch (error) {
    // Datos corruptos o localStorage no disponible: empezamos con la lista vacía.
    return [];
  }
}
