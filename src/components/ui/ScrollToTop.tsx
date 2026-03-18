// src/components/ui/ScrollToTop.tsx
// Bouton flottant "Retour en haut" en bas à droite

import { useState, useEffect } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Retour en haut"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: "none",
        background: "var(--accent-primary)",
        color: "#fff",
        fontSize: "1.2rem",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s, opacity 0.2s",
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.8)",
      }}
    >
      ⬆️
    </button>
  );
}
