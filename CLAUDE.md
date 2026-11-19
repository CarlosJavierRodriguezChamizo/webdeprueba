# CLAUDE.md

Guía para Claude Code al trabajar en este repositorio.

## Proyecto
Gestor de tareas (to-do list) web, hecho como proyecto de aprendizaje. Se desarrolla
por fases siguiendo `PLAN.md`.

## Reglas de trabajo
- Trabaja **solo en la fase indicada** de `PLAN.md`. Al terminarla y comprobar que
  funciona, marca sus casillas con `[x]` y **no avances** a la siguiente sin que se pida.
- Explica los cambios en español y de forma sencilla (el autor está aprendiendo).
- Un commit por fase con el formato: `Fase X: descripción`.

## Stack y restricciones
- HTML, CSS y JavaScript "vanilla". Sin frameworks, sin npm, sin paso de build.
- Se prueba abriendo `index.html` con Live Server (VS Code).
- Persistencia solo con `localStorage` (a partir de la Fase 3).
- Publicación final en GitHub Pages (Fase 9), así que todas las rutas deben ser relativas.

## Estructura prevista
| Archivo      | Contenido                                              | Fase |
|--------------|--------------------------------------------------------|------|
| `index.html` | Estructura de la página: título, formulario y lista    | 1    |
| `styles.css` | Estilos, diseño responsive (ordenador y móvil)         | 1    |
| `app.js`     | Lógica: array de tareas, pintar la lista, eventos      | 2    |
| `storage.js` | Funciones para guardar y cargar en `localStorage`      | 3    |

`storage.js` debe cargarse antes que `app.js` en `index.html`.

## Estado actual
Fase 7 completada: prioridad alta / media / baja con color, fecha límite opcional, orden por prioridad y vencidas en rojo. Tareas: `{ id, text, completed, priority, dueDate }`.

## Convenciones
- Idioma: interfaz, comentarios y nombres de commits en español.
- Código: indentación de 2 espacios, `const`/`let` (no `var`), funciones pequeñas.
- Accesibilidad: cada campo con su `<label>`, todo usable con teclado, HTML semántico.
- Nada de `innerHTML` con texto introducido por el usuario: usar `textContent`.
