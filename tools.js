
/* =========================================
   VIDA — TOOLS.JS
   Herramientas cotidianas
   ========================================= */

const VidaTools = (() => {
  "use strict";

  // Obtener un elemento de forma segura
  function getElement(selector) {
    return document.querySelector(selector);
  }

  // Convertir un valor a número y validarlo
  function toNumber(value) {
    if (typeof value !== "string" && typeof value !== "number") {
      return NaN;
    }

    const normalized = String(value).trim().replace(",", ".");

    if (normalized === "") return NaN;

    const number = Number(normalized);
    return Number.isFinite(number) ? number : NaN;
  }

  // Formatear números según la configuración regional
  function formatNumber(value, decimals = 2) {
    return new Intl.NumberFormat("es-DO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    }).format(value);
  }

  // Calcular cuánto debe pagar cada persona
  function splitExpense(total, people) {
    const amount = toNumber(String(total));
    const count = toNumber(String(people));

    if (!Number.isFinite(amount) || amount < 0) {
      return { ok: false, message: "Introduce un monto válido." };
    }

    if (!Number.isInteger(count) || count < 1) {
      return {
        ok: false,
        message: "Introduce una cantidad de personas válida."
      };
    }

    return {
      ok: true,
      total: amount,
      people: count,
      each: amount / count
    };
  }

  // Calcular un porcentaje de una cantidad
  function calculatePercentage(amount, percentage) {
    const base = toNumber(String(amount));
    const rate = toNumber(String(percentage));

    if (!Number.isFinite(base) || base < 0) {
      return { ok: false, message: "Introduce una cantidad válida." };
    }

    if (!Number.isFinite(rate) || rate < 0) {
      return { ok: false, message: "Introduce un porcentaje válido." };
    }

    return {
      ok: true,
      amount: base,
      percentage: rate,
      result: base * (rate / 100)
    };
  }

  // Calcular descuento y precio final
  function calculateDiscount(price, discount) {
    const amount = toNumber(String(price));
    const rate = toNumber(String(discount));

    if (!Number.isFinite(amount) || amount < 0) {
      return { ok: false, message: "Introduce un precio válido." };
    }

    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      return {
        ok: false,
        message: "El descuento debe estar entre 0 y 100 %."
      };
    }

    const saved = amount * rate / 100;

    return {
      ok: true,
      originalPrice: amount,
      discount: rate,
      saved,
      finalPrice: amount - saved
    };
  }

  // Convertir unidades de uso cotidiano
  function convertUnits(value, from, to) {
    const amount = toNumber(String(value));

    if (!Number.isFinite(amount)) {
      return { ok: false, message: "Introduce una cantidad válida." };
    }

    const units = {
      km: { group: "distance", factor: 1000 },
      m: { group: "distance", factor: 1 },
      cm: { group: "distance", factor: 0.01 },
      mm: { group: "distance", factor: 0.001 },

      kg: { group: "weight", factor: 1000 },
      g: { group: "weight", factor: 1 },
      mg: { group: "weight", factor: 0.001 },

      l: { group: "volume", factor: 1000 },
      ml: { group: "volume", factor: 1 }
    };

    const source = units[from];
    const target = units[to];

    if (!source || !target || source.group !== target.group) {
      return {
        ok: false,
        message: "No se pueden convertir esas unidades."
      };
    }

    return {
      ok: true,
      value: amount * source.factor / target.factor,
      from,
      to
    };
  }

  // Crear una cuenta regresiva sin bloquear la página
  function createCountdown(durationSeconds, onTick, onFinish) {
    const duration = Number(durationSeconds);

    if (!Number.isFinite(duration) || duration < 0) {
      throw new Error("La duración debe ser un número positivo.");
    }

    let remaining = Math.floor(duration);
    let intervalId = null;
    let stopped = false;

    function tick() {
      if (stopped) return;

      if (typeof onTick === "function") {
        onTick(remaining);
      }

      if (remaining <= 0) {
        stop();

        if (typeof onFinish === "function") {
          onFinish();
        }

        return;
      }

      remaining -= 1;
    }

    function start() {
      if (intervalId !== null || stopped) return;

      tick();

      if (!stopped) {
        intervalId = window.setInterval(tick, 1000);
      }
    }

    function stop() {
      stopped = true;

      if (intervalId !== null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }

    return { start, stop };
  }

  // Copiar texto cuando el navegador lo permita
  async function copyText(value) {
    if (!navigator.clipboard || !window.isSecureContext) {
      return {
        ok: false,
        message: "La copia automática no está disponible en este contexto."
      };
    }

    try {
      await navigator.clipboard.writeText(String(value));

      return { ok: true, message: "Texto copiado." };
    } catch {
      return {
        ok: false,
        message: "No se pudo copiar el texto."
      };
    }
  }

  // Funciones públicas del módulo
  return Object.freeze({
    formatNumber,
    splitExpense,
    calculatePercentage,
    calculateDiscount,
    convertUnits,
    createCountdown,
    copyText
  });
})();

// Disponible para app.js y assistant.js
window.VidaTools = VidaTools;
