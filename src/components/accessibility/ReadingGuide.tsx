// src/components/accessibility/ReadingGuide.tsx
// Regle de lecture utilisable a la souris et au clavier.

import { useEffect, useState } from "react";
import { getA11yEngine } from "../../data/accessibility/a11y-engine";

export default function ReadingGuide() {
  const [engine] = useState(() => getA11yEngine());
  const [enabled, setEnabled] = useState(() => engine.getPrefs().readingGuide);
  const [guideY, setGuideY] = useState(-100);

  useEffect(() => {
    const unsubscribe = engine.subscribe((prefs) => setEnabled(prefs.readingGuide));
    return unsubscribe;
  }, [engine]);

  useEffect(() => {
    if (!enabled) return;

    function handleMouseMove(event: MouseEvent) {
      setGuideY(event.clientY);
    }

    function handleFocusIn(event: FocusEvent) {
      const target = event.target instanceof HTMLElement ? event.target : null;
      const rect = target?.getBoundingClientRect();
      if (rect) setGuideY(rect.top + rect.height / 2);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowDown" || event.key === "PageDown") setGuideY((value) => Math.min(window.innerHeight - 20, Math.max(20, value) + 36));
      if (event.key === "ArrowUp" || event.key === "PageUp") setGuideY((value) => Math.max(20, Math.max(20, value) - 36));
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);

  if (!enabled || guideY < 0) return null;

  const guideHeight = 44;
  const topHeight = Math.max(0, guideY - guideHeight / 2);

  return (
    <div className="reading-guide" aria-hidden="true">
      <div className="reading-guide__shade" style={{ "--ui5-guide-height": `${topHeight}px` } as React.CSSProperties} />
      <div className="reading-guide__line" style={{ "--ui5-guide-top": `${topHeight}px` } as React.CSSProperties} />
      <div className="reading-guide__shade" style={{ "--ui5-guide-top": `${topHeight + guideHeight}px` } as React.CSSProperties} />

    </div>
  );
}
