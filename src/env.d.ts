/// <reference types="astro/client" />

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

export {};