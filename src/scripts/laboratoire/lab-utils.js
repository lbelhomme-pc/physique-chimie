export function onLabReady(selector, init) {
  const boot = () => {
    document.querySelectorAll(selector).forEach((root) => {
      if (!(root instanceof HTMLElement)) return;
      if (root.dataset.labInitialized === "true") return;
      const initialized = init(root);
      if (initialized !== false) root.dataset.labInitialized = "true";
    });
  };

  const retryBoot = () => {
    window.setTimeout(boot, 0);
    window.setTimeout(boot, 120);
    window.setTimeout(boot, 420);
  };

  if (document.readyState === "loading") {
    boot();
    document.addEventListener("DOMContentLoaded", boot, { once: true });
    retryBoot();
  } else {
    boot();
  }

  document.addEventListener("astro:page-load", boot);
}

export function createLabRuntime(root) {
  let active = true;
  let rafId = 0;
  const cleanups = [];

  const cleanup = () => {
    if (!active) return;
    active = false;
    if (rafId) cancelAnimationFrame(rafId);
    cleanups.splice(0).forEach((fn) => fn());
  };

  const isActive = () => active && root.isConnected;

  const on = (target, event, handler, options) => {
    target?.addEventListener(event, handler, options);
    cleanups.push(() => target?.removeEventListener(event, handler, options));
  };

  const observe = (target, handler) => {
    if (!target || typeof ResizeObserver === "undefined") return null;
    const observer = new ResizeObserver(() => {
      if (!isActive()) {
        cleanup();
        return;
      }
      handler();
    });
    observer.observe(target);
    cleanups.push(() => observer.disconnect());
    return observer;
  };

  const later = (handler, delay) => {
    const timeoutId = window.setTimeout(() => {
      if (isActive()) handler();
    }, delay);
    cleanups.push(() => window.clearTimeout(timeoutId));
    return timeoutId;
  };

  const every = (handler, delay) => {
    const intervalId = window.setInterval(() => {
      if (!isActive()) {
        cleanup();
        return;
      }
      handler();
    }, delay);
    cleanups.push(() => window.clearInterval(intervalId));
    return intervalId;
  };

  const frame = (handler) => {
    const loop = (time) => {
      if (!isActive()) {
        cleanup();
        return;
      }
      handler(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
  };

  on(window, "pagehide", cleanup, { once: true });
  on(document, "astro:before-swap", cleanup, { once: true });

  return { cleanup, every, frame, isActive, later, observe, on };
}

export function fitCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { ctx, width, height, dpr };
}

export function frNumber(value, digits = 1) {
  return Number(value).toLocaleString("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

export function getThemeColor(name, fallback) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
