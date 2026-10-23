
/* =========================================
   VIDA — ASSISTANT.JS
   Asistente cotidiano en español
   ========================================= */

const VidaAssistant = (() => {
  "use strict";

  const APP_NAME = "VIDA";

  const suggestions = [
    "Ayúdame a organizar mi día",
    "¿Cuánto pagamos cada uno?",
    "Calcula un descuento",
    "Dame consejos para ahorrar",
    "Ayúdame a crear una lista de tareas"
  ];

  const knowledge = [
    {
      keywords: ["hola", "buenas", "buenos días", "buenas tardes", "buenas noches"],
      answers: [
        "¡Hola! 👋 Soy VIDA. ¿Qué necesitas resolver hoy?",
        "¡Ey! Estoy aquí para ayudarte. ¿Qué hacemos primero?",
        "¡Hola! Cuéntame qué necesitas y lo resolvemos paso a paso."
      ]
    },
    {
      keywords: ["quién eres", "quien eres", "qué eres", "que eres"],
      answers: [
        "Soy VIDA, tu asistente para organizar tareas, hacer cálculos y resolver pequeñas necesidades del día a día."
      ]
    },
    {
      keywords: ["qué puedes hacer", "que puedes hacer", "ayuda", "funciones"],
      answers: [
        "Puedo ayudarte a organizar tareas, calcular gastos compartidos, porcentajes y descuentos, convertir unidades y darte ideas prácticas. También puedo orientarte con preguntas cotidianas."
      ]
    },
    {
      keywords: ["organizar mi día", "organizar mi dia", "planificar mi día", "planificar mi dia"],
      answers: [
        "Vamos a organizarlo. 💪 Primero, escribe las tres cosas más importantes que necesitas terminar hoy. Después, ordénalas por prioridad y reserva tiempo para descansar."
      ]
    },
    {
      keywords: ["ahorrar", "ahorro", "guardar dinero"],
      answers: [
        "Un método sencillo es separar una cantidad fija cada vez que recibas dinero. Anota tus gastos durante una semana y empieza reduciendo uno que no sea necesario. ¿Quieres que hagamos un presupuesto?"
      ]
    },
    {
      keywords: ["estudiar", "estudio", "examen", "tarea escolar"],
      answers: [
        "Prueba este método: estudia durante 25 minutos, descansa 5 y luego intenta explicar lo aprendido sin mirar los apuntes. ¿Qué asignatura estás estudiando?"
      ]
    },
    {
      keywords: ["motivación", "motivacion", "desanimado", "no tengo ganas"],
      answers: [
        "No tienes que resolverlo todo hoy. Elige una tarea pequeña y trabaja en ella durante cinco minutos. Empezar poco a poco también cuenta. 💚"
      ]
    },
    {
      keywords: ["gracias", "muchas gracias"],
      answers: [
        "¡De nada! 💚 Aquí seguimos. ¿Necesitas ayuda con algo más?",
        "¡Para eso estamos! Vamos paso a paso."
      ]
    },
    {
      keywords: ["adiós", "adios", "hasta luego", "nos vemos"],
      answers: [
        "¡Hasta luego! Cuando vuelvas, seguimos construyendo un día mejor. 💚"
      ]
    }
  ];

  function normalize(text) {
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[¿?¡!.,;:()[\]{}]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function chooseAnswer(answers) {
    return answers[Math.floor(Math.random() * answers.length)];
  }

  function findIntent(message) {
    const normalizedMessage = normalize(message);

    for (const item of knowledge) {
      const matched = item.keywords.some(keyword => {
        return normalizedMessage.includes(normalize(keyword));
      });

      if (matched) {
        return {
          type: "knowledge",
          response: chooseAnswer(item.answers)
        };
      }
    }

    if (
      normalizedMessage.includes("dividir") ||
      normalizedMessage.includes("repartir") ||
      normalizedMessage.includes("cada uno") ||
      normalizedMessage.includes("compartir gastos")
    ) {
      return {
        type: "tool",
        tool: "splitExpense",
        response: "Podemos repartir el gasto entre varias personas. Abre Herramientas y utiliza la calculadora de gastos compartidos."
      };
    }

    if (
      normalizedMessage.includes("descuento") ||
      normalizedMessage.includes("rebaja") ||
      normalizedMessage.includes("oferta")
    ) {
      return {
        type: "tool",
        tool: "calculateDiscount",
        response: "Vamos a calcular el descuento. Entra en Herramientas y utiliza la calculadora de descuentos."
      };
    }

    if (
      normalizedMessage.includes("porcentaje") ||
      normalizedMessage.includes("por ciento")
    ) {
      return {
        type: "tool",
        tool: "calculatePercentage",
        response: "Para calcular un porcentaje, abre Herramientas y utiliza la calculadora de porcentajes."
      };
    }

    if (
      normalizedMessage.includes("convertir") ||
      normalizedMessage.includes("conversion de unidades") ||
      normalizedMessage.includes("unidades")
    ) {
      return {
        type: "tool",
        tool: "convertUnits",
        response: "VIDA tiene una función para convertir unidades de distancia, peso y volumen. Puedes utilizarla desde Herramientas cuando esté conectada a la interfaz."
      };
    }

    if (
      normalizedMessage.includes("tarea") ||
      normalizedMessage.includes("pendiente") ||
      normalizedMessage.includes("lista de cosas")
    ) {
      return {
        type: "navigation",
        page: "tareas",
        response: "Vamos a organizar tus pendientes. Entra en Mis tareas y añade lo que necesitas completar."
      };
    }

    if (
      normalizedMessage.includes("nota") ||
      normalizedMessage.includes("recordar algo") ||
      normalizedMessage.includes("apuntar algo")
    ) {
      return {
        type: "navigation",
        page: "notas",
        response: "Puedes guardar esa información en Mis notas para consultarla después."
      };
    }

    return {
      type: "fallback",
      response: "Quiero ayudarte con eso. 💚 ¿Puedes darme un poco más de contexto o decirme qué resultado necesitas conseguir?"
    };
  }

  function respond(message) {
    if (typeof message !== "string" || !message.trim()) {
      return {
        text: "Escribe un mensaje para que pueda ayudarte.",
        type: "empty"
      };
    }

    const result = findIntent(message);

    return {
      text: result.response,
      type: result.type,
      tool: result.tool || null,
      page: result.page || null
    };
  }

  function getSuggestions() {
    return [...suggestions];
  }

  function getName() {
    return APP_NAME;
  }

  return Object.freeze({
    respond,
    getSuggestions,
    getName
  });
})();

window.VidaAssistant = VidaAssistant;
