// Loaded only when the native accessibility launcher is activated.
import stylesheetUrl from "../../ui-v5/accessibility.css?url";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import AccessibilityPanel from "./AccessibilityPanel";

let stylesReady: Promise<void> | undefined;
function loadStyles() {
  if (!stylesReady) {
    stylesReady = new Promise<void>((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = stylesheetUrl;
      link.onload = () => resolve();
      link.onerror = () => {
        link.remove();
        stylesReady = undefined;
        reject(new Error("Styles d'accessibilité indisponibles"));
      };
      document.head.appendChild(link);
    });
  }
  return stylesReady;
}

export async function mountAccessibilityPanel(element: HTMLElement) {
  await loadStyles();
  createRoot(element).render(
    createElement(AccessibilityPanel, { initiallyOpen: true }),
  );
}
