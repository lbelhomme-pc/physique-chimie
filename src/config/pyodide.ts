export const PYODIDE_VERSION = "314.0.2";
export const PYODIDE_CDN_ORIGIN = "https://cdn.jsdelivr.net";
export const PYODIDE_BASE_URL = `${PYODIDE_CDN_ORIGIN}/pyodide/v${PYODIDE_VERSION}/full/`;
export const PYODIDE_MODULE_URL = new URL("pyodide.mjs", PYODIDE_BASE_URL).href;
export const PYODIDE_LOAD_TIMEOUT_MS = 20_000;

export function validatePyodideRuntimeUrl(rawUrl = PYODIDE_MODULE_URL): boolean {
  try {
    const url = new URL(rawUrl);
    return (
      url.protocol === "https:" &&
      url.origin === PYODIDE_CDN_ORIGIN &&
      url.pathname === `/pyodide/v${PYODIDE_VERSION}/full/pyodide.mjs`
    );
  } catch {
    return false;
  }
}
