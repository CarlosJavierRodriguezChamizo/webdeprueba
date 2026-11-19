# Plan de desarrollo: Gestor de tareas

> Instrucciones para Claude Code: trabaja solo en la fase indicada. Al terminarla y
> comprobar que funciona, marca sus casillas con [x] y no avances a la siguiente
> fase sin que yo lo pida.

## Forma de trabajar en cada fase
1. Modo plan (Shift+Tab): revisar la propuesta antes de aceptar.
2. Ejecutar y explicar lo que no se entienda.
3. Probar en el navegador con Live Server.
4. Commit: `git commit -m "Fase X: descripción"`.
5. `/clear` antes de la siguiente fase.

---

## Fase 0 · Preparación
- [x] Repositorio creado
- [x] Ejecutar `/init` y completar CLAUDE.md

## Fase 1 · Maqueta estática
Crear index.html y styles.css con título, formulario para añadir tareas y una
lista con 3 tareas de ejemplo en el HTML. Sin JavaScript.
- [x] Se ve bien en ordenador y móvil

## Fase 2 · Añadir tareas
Crear app.js: al enviar el formulario, añadir la tarea a un array y pintar la
lista. Eliminar las tareas de ejemplo. No permitir tareas vacías.
- [ ] Las tareas nuevas aparecen en la lista
- [ ] No se pueden añadir tareas vacías

## Fase 3 · Guardar las tareas
Crear storage.js con funciones para guardar y cargar en localStorage. Guardar
tras cada cambio y cargar al abrir la página.
- [ ] Las tareas siguen ahí al recargar

## Fase 4 · Completar y eliminar
Casilla para marcar como completada (texto tachado) y botón para eliminar.
- [ ] Completar funciona y se mantiene al recargar
- [ ] Eliminar funciona y se mantiene al recargar

## Fase 5 · Editar
Editar el texto con doble clic. Enter guarda y Escape cancela.
- [ ] La edición se guarda correctamente

## Fase 6 · Filtros y contador
Filtros Todas / Pendientes / Completadas, contador de pendientes y botón
"Borrar completadas".
- [ ] Los filtros muestran las tareas correctas
- [ ] El contador se actualiza

## Fase 7 · Prioridad y fecha límite
Prioridad alta / media / baja con un color para cada una y fecha límite
opcional. Ordenar por prioridad y marcar en rojo las vencidas.
- [ ] Las tareas se ordenan por prioridad
- [ ] Las vencidas se destacan en rojo

## Fase 8 · Pulido
Revisar el diseño en móvil, la accesibilidad (etiquetas y teclado), mostrar un
mensaje cuando la lista esté vacía y limpiar el código.
- [ ] Se puede usar solo con el teclado
- [ ] No hay errores en la consola

## Fase 9 · Publicación
Subir a GitHub y publicar en GitHub Pages.
- [ ] La aplicación funciona desde una URL pública
