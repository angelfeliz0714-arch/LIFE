
/* =====================================================
   VIDA — Aplicación principal
   Navegación, asistente, tareas, notas y herramientas
   ===================================================== */

"use strict";

/* ---------- Utilidades generales ---------- */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));

function readStorage(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch (error) {
    console.warn(`No se pudo leer ${key}:`, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`No se pudo guardar ${key}:`, error);
    return false;
  }
}

function showMessage(element, message, type = "success") {
  if (!element) return;

  element.replaceChildren();

  const paragraph = document.createElement("p");
  paragraph.className =
    type === "error" ? "error-message" : "success-message";
  paragraph.textContent = message;

  element.appendChild(paragraph);
  element.hidden = false;
}

/* ---------- Navegación ---------- */

const pageTitles = {
  inicio: "Inicio",
  asistente: "Asistente VIDA",
  tareas: "Mis tareas",
  herramientas: "Herramientas",
  notas: "Mis notas"
};

function navigateTo(viewName) {
  const target = $(`#view-${viewName}`);

  if (!target) {
    console.warn(`No existe la vista: ${viewName}`);
    return;
  }

  $$("[data-page]").forEach((view) => {
    view.hidden = view !== target;
  });

  // Compatibilidad con una vista de inicio identificada por su ID.
  const home = $("#view-inicio");
  if (home) home.hidden = viewName !== "inicio";

  $$("[data-view]").forEach((link) => {
    const active = link.dataset.view === viewName;

    link.classList.toggle("active", active);

    if (active) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const pageName = $("#page-name");
  if (pageName) {
    pageName.textContent = pageTitles[viewName] || "VIDA";
  }

  $(".sidebar")?.classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

$$("[data-view]").forEach((element) => {
  element.addEventListener("click", (event) => {
    event.preventDefault();
    navigateTo(element.dataset.view);
  });
});

$$("[data-go-view]").forEach((element) => {
  element.addEventListener("click", () => {
    navigateTo(element.dataset.goView);
  });
});

/* ---------- Menú para móviles ---------- */

const menuToggle = $("#menu-toggle");
const sidebar = $(".sidebar");

if (menuToggle && sidebar) {
  menuToggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (
      window.innerWidth <= 760 &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      sidebar.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

/* ---------- Asistente local de VIDA ---------- */

/*
  Esta primera versión responde usando reglas locales.
  No llama a una API ni utiliza un modelo de IA externo.
*/

function getAssistantAnswer(rawQuestion) {
  const question = rawQuestion.trim().toLowerCase();

  if (!question) {
    return "Escribe qué necesitas y vamos a buscar una forma práctica de resolverlo.";
  }

  if (
    /hola|buenas|buenos dias|buenas tardes|buenas noches|saludos/.test(
      question
    )
  ) {
    return "¡Hola! Soy el asistente de VIDA. Cuéntame qué quieres resolver hoy y te ayudaré a organizar el siguiente paso.";
  }

  if (
    /tarea|pendiente|organizar mi dia|organizar el dia|productividad/.test(
      question
    )
  ) {
    return "Vamos a organizarlo:\n\n1. Escribe las tareas que tienes pendientes.\n2. Elige la más importante.\n3. Divide esa tarea en pasos pequeños.\n4. Empieza por un paso que puedas completar hoy.\n\nPuedes guardar tus pendientes en la sección Mis tareas.";
  }

  if (
    /estudiar|estudio|examen|aprender|clase|tarea escolar/.test(
      question
    )
  ) {
    return "Prueba este método de estudio:\n\n1. Escoge un solo tema.\n2. Estudia durante 25 minutos sin distracciones.\n3. Descansa 5 minutos.\n4. Explícate lo aprendido sin mirar los apuntes.\n5. Anota lo que todavía no entiendes.\n\nPuedes pedirme ayuda para organizar un tema específico.";
  }

  if (
    /dinero|ahorrar|presupuesto|gastos|finanzas/.test(question)
  ) {
    return "Para controlar tu dinero, empieza con tres datos:\n\n1. Cuánto dinero recibes.\n2. Cuánto gastas en necesidades.\n3. Cuánto puedes reservar.\n\nRegistra tus gastos durante una semana antes de decidir qué recortar. En Herramientas encontrarás calculadoras útiles para hacer cuentas.";
  }

  if (
    /negocio|emprender|empresa|vender|cliente|emprendimiento/.test(
      question
    )
  ) {
    return "Una buena forma de empezar un negocio es resolver un problema concreto:\n\n1. Identifica a quién quieres ayudar.\n2. Pregunta qué necesita esa persona.\n3. Diseña una solución sencilla.\n4. Prueba con unos pocos clientes.\n5. Mejora según sus comentarios.\n\nAntes de gastar dinero, intenta validar que alguien realmente quiera tu solución.";
  }

  if (
    /estres|estresado|ansiedad|agobiado|abrumado|preocupado/.test(
      question
    )
  ) {
    return "Cuando tengas muchas cosas en la cabeza, intenta bajar el ritmo por un momento:\n\n1. Haz una pausa y respira lentamente.\n2. Escribe lo que te preocupa.\n3. Separa lo que puedes controlar de lo que no.\n4. Escoge una acción pequeña y realista.\n\nSi te sientes en peligro o el malestar es intenso, busca apoyo de alguien de confianza o de un profesional.";
  }

  if (
    /mensaje|escribir|redactar|correo|email|felicitacion|felicitación/.test(
      question
    )
  ) {
    return "Puedo ayudarte a preparar un texto. Para hacerlo bien, dime a quién va dirigido, qué quieres comunicar y qué tono prefieres: formal, amistoso, cariñoso o directo.";
  }

  if (
    /idea|ideas|crear una app|aplicacion|aplicación|proyecto/.test(
      question
    )
  ) {
    return "Para convertir una idea en un proyecto real, define primero:\n\n1. Qué problema resuelve.\n2. Quién lo tiene.\n3. Cómo lo resolverías de forma sencilla.\n4. Qué función puedes construir primero.\n5. Cómo comprobarás que realmente ayuda.\n\nEmpieza por una versión pequeña que puedas probar con personas reales.";
  }

  if (
    /porcentaje|calcular|cuenta|matematica|matemática/.test(
      question
    )
  ) {
    return "Puedes utilizar las calculadoras de la sección Herramientas. Si me escribes la operación completa, por ejemplo «¿cuánto es el 15 % de 800?», intentaré ayudarte con ese cálculo.";
  }

  return "Gracias por contarme lo que necesitas. En esta primera versión puedo ofrecer orientación básica y sugerencias prácticas. Para ayudarte mejor, dime cuál es tu objetivo concreto, qué has intentado y qué resultado quieres conseguir.\n\nNota: este asistente todavía funciona con respuestas locales; no es una IA conectada a Internet.";
}

function renderAssistantResult(element, answer) {
  if (!element) return;

  element.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "Respuesta de VIDA";

  const paragraph = document.createElement("p");
  paragraph.style.whiteSpace = "pre-line";
  paragraph.textContent = answer;

  element.append(heading, paragraph);
  element.hidden = false;
}

function connectAssistant(formSelector, inputSelector, resultSelector) {
  const form = $(formSelector);
  const input = $(inputSelector);
  const result = $(resultSelector);

  if (!form || !input || !result) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const question = input.value.trim();

    if (!question) {
      input.focus();
      renderAssistantResult(
        result,
        "Escribe una pregunta o cuéntame qué necesitas antes de continuar."
      );
      return;
    }

    const answer = getAssistantAnswer(question);
    renderAssistantResult(result, answer);
  });
}

connectAssistant(
  "#assistant-form",
  "#assistant-input",
  "#assistant-result"
);

connectAssistant(
  "#assistant-page-form",
  "#assistant-page-input",
  "#assistant-page-result"
);

/* Preguntas de ejemplo del asistente */

$$("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    const prompt = button.dataset.prompt;
    const input = $("#assistant-input");

    if (input) {
      input.value = prompt;
      input.focus();
    } else {
      const pageInput = $("#assistant-page-input");

      if (pageInput) {
        pageInput.value = prompt;
        pageInput.focus();
      }
    }

    navigateTo("asistente");

    const destination = $("#assistant-page-input");
    if (destination) destination.value = prompt;
  });
});

/* ---------- Mis tareas ---------- */

const TASKS_KEY = "vida_tasks_v1";
let tasks = readStorage(TASKS_KEY, []);

if (!Array.isArray(tasks)) tasks = [];

const taskList = $("#task-list");
const taskForm = $("#task-form");
const taskInput = $("#task-input");

function updateTaskProgress() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const label = $("#task-progress-label");
  const bar = $("#task-progress-bar");

  if (label) {
    label.textContent =
      total === 0
        ? "Todavía no tienes tareas"
        : `${completed} de ${total} completadas · ${percent}%`;
  }

  if (bar) {
    bar.style.width = `${percent}%`;
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", String(percent));
  }
}

function renderTasks() {
  if (!taskList) return;

  taskList.replaceChildren();

  if (tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent =
      "Todavía no tienes tareas. Agrega tu primer pendiente para comenzar.";
    taskList.appendChild(empty);
    updateTaskProgress();
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = "task-item";

    if (task.completed) {
      item.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(task.completed);
    checkbox.setAttribute(
      "aria-label",
      `Marcar como completada: ${task.text}`
    );

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      writeStorage(TASKS_KEY, tasks);
      renderTasks();
    });

    const content = document.createElement("span");
    content.className = "task-item-content";
    content.textContent = task.text;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "task-delete";
    removeButton.textContent = "Eliminar";
    removeButton.setAttribute(
      "aria-label",
      `Eliminar tarea: ${task.text}`
    );

    removeButton.addEventListener("click", () => {
      tasks = tasks.filter((entry) => entry.id !== task.id);
      writeStorage(TASKS_KEY, tasks);
      renderTasks();
    });

    item.append(checkbox, content, removeButton);
    taskList.appendChild(item);
  });

  updateTaskProgress();
}

if (taskForm && taskInput) {
  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const text = taskInput.value.trim();
    if (!text) {
      taskInput.focus();
      return;
    }

    tasks.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      text,
      completed: false,
      createdAt: new Date().toISOString()
    });

    const saved = writeStorage(TASKS_KEY, tasks);

    renderTasks();
    taskInput.value = "";
    taskInput.focus();

    if (!saved) {
      alert("No se pudo guardar la tarea en este navegador.");
    }
  });
}

renderTasks();

/* ---------- Herramienta: dividir gastos ---------- */

const splitForm = $("#split-form");

if (splitForm) {
  splitForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const totalInput = $("#total-amount");
    const peopleInput = $("#people-count");
    const result = $("#split-result");

    const total = Number(totalInput?.value);
    const people = Number(peopleInput?.value);

    if (
      !Number.isFinite(total) ||
      !Number.isFinite(people) ||
      total < 0 ||
      people < 1 ||
      !Number.isInteger(people)
    ) {
      showMessage(
        result,
        "Introduce un total válido y un número entero de personas mayor que cero.",
        "error"
      );
      return;
    }

    const each = total / people;

    if (!result) return;

    result.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Resultado";

    const paragraph = document.createElement("p");
    paragraph.textContent =
      `Cada persona debe aportar ${each.toLocaleString("es-DO", {
        style: "currency",
        currency: "DOP"
      })}.`;

    result.append(heading, paragraph);
    result.hidden = false;
  });
}

/* ---------- Herramienta: porcentaje ---------- */

const percentageForm = $("#percentage-form");

if (percentageForm) {
  percentageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const base = Number($("#base-amount")?.value);
    const percentage = Number($("#percentage-value")?.value);
    const result = $("#percentage-result");

    if (
      !Number.isFinite(base) ||
      !Number.isFinite(percentage) ||
      base < 0 ||
      percentage < 0
    ) {
      showMessage(
        result,
        "Introduce cantidades válidas y porcentajes iguales o mayores que cero.",
        "error"
      );
      return;
    }

    const answer = (base * percentage) / 100;

    if (!result) return;

    result.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Resultado";

    const paragraph = document.createElement("p");
    paragraph.textContent =
      `${percentage}% de ${base.toLocaleString("es-DO")} es ` +
      `${answer.toLocaleString("es-DO", {
        maximumFractionDigits: 2
      })}.`;

    result.append(heading, paragraph);
    result.hidden = false;
  });
}

/* ---------- Mis notas ---------- */

const NOTES_KEY = "vida_notes_v1";
let notes = readStorage(NOTES_KEY, []);

if (!Array.isArray(notes)) notes = [];

const noteForm = $("#note-form");
const notesList = $("#notes-list");

function renderNotes() {
  if (!notesList) return;

  notesList.replaceChildren();

  if (notes.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent =
      "Tus notas aparecerán aquí. Guarda una idea para comenzar.";
    notesList.appendChild(empty);
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("li");
    item.className = "note-item";

    const top = document.createElement("div");
    top.className = "note-item-top";

    const title = document.createElement("h3");
    title.textContent = note.title;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "note-delete";
    removeButton.textContent = "Eliminar";
    removeButton.setAttribute(
      "aria-label",
      `Eliminar nota: ${note.title}`
    );

    removeButton.addEventListener("click", () => {
      notes = notes.filter((entry) => entry.id !== note.id);
      writeStorage(NOTES_KEY, notes);
      renderNotes();
    });

    const content = document.createElement("p");
    content.textContent = note.content;

    const date = document.createElement("span");
    date.className = "tag";

    const parsedDate = new Date(note.createdAt);
    date.textContent = Number.isNaN(parsedDate.getTime())
      ? "Nota guardada"
      : `Guardada: ${parsedDate.toLocaleDateString("es-DO")}`;

    top.append(title, removeButton);
    item.append(top, content, date);
    notesList.appendChild(item);
  });
}

if (noteForm) {
  noteForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const titleInput = $("#note-title");
    const contentInput = $("#note-content");

    const title = titleInput?.value.trim() || "";
    const content = contentInput?.value.trim() || "";

    if (!title || !content) {
      alert("Escribe un título y el contenido de la nota.");
      return;
    }

    notes.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      content,
      createdAt: new Date().toISOString()
    });

    const saved = writeStorage(NOTES_KEY, notes);

    renderNotes();
    noteForm.reset();

    if (!saved) {
      alert("No se pudo guardar la nota en este navegador.");
    }
  });
}

renderNotes();

/* ---------- Inicialización ---------- */

navigateTo("inicio");

console.info("VIDA está lista para probarse.");
