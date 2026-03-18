// src/components/accessibility/ReadingGuide.tsx
// Règle de lecture — bande semi-transparente qui suit le curseur
// Aide les dyslexiques à ne pas perdre la ligne en cours

import { useState, useEffect } from "react";
import { getA11yEngine } from "../../data/accessibility/a11y-engine";

export default function ReadingGuide() {
  const [engine] = useState(() => getA11yEngine());
  const [enabled, setEnabled] = useState(() => engine.getPrefs().readingGuide);
  const [mouseY, setMouseY] = useState(-100);

  useEffect(() => {
    const unsub = engine.subscribe((p) => setEnabled(p.readingGuide));
    return unsub;
  }, [engine]);

  useEffect(() => {
    if (!enabled) return;

    function handleMouseMove(e: MouseEvent) {
      setMouseY(e.clientY);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enabled]);

  if (!enabled || mouseY < 0) return null;

  // La règle : une bande transparente de 40px centrée sur le curseur
  // avec des overlays sombres au-dessus et en dessous
  const guideHeight = 40;
  const topHeight = Math.max(0, mouseY - guideHeight / 2);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 9990 }}>
      {/* Zone sombre du haut */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: topHeight,
        background: "rgba(0, 0, 0, 0.15)",
        transition: "height 0.05s linear",
      }} />
      {/* Bande de lecture (transparente) */}
      <div style={{
        position: "absolute",
        top: topHeight,
        left: 0,
        right: 0,
        height: guideHeight,
        borderTop: "2px solid rgba(37, 99, 235, 0.4)",
        borderBottom: "2px solid rgba(37, 99, 235, 0.4)",
        background: "rgba(37, 99, 235, 0.03)",
      }} />
      {/* Zone sombre du bas */}
      <div style={{
        position: "absolute",
        top: topHeight + guideHeight,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.15)",
        transition: "top 0.05s linear",
      }} />
    </div>
  );
}
