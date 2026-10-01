// src/components/pedagogie/XPToast.tsx
// v2 : utilise les variables CSS pour le fond de base

import { useState, useEffect } from "react";

export interface ToastItem {
  id: string;
  type: "xp" | "rank_up" | "badge" | "streak_bonus" | "chapter_complete";
  message: string;
  icon?: string;
}

interface XPToastProps { toasts: ToastItem[]; onDismiss: (id: string) => void; }

export default function XPToast({ toasts, onDismiss }: XPToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="xp-toast-stack">
      {toasts.map((t) => <ToastBubble key={t.id} toast={t} onDismiss={onDismiss} />)}

    </div>
  );
}

function ToastBubble({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVis(true));
    const timer = setTimeout(() => { setVis(false); setTimeout(() => onDismiss(toast.id), 300); }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bg = { xp: "var(--ui5-action)", rank_up: "#d4af37", badge: "var(--accent-purple)", streak_bonus: "var(--accent-warning)", chapter_complete: "var(--accent-success)" }[toast.type] ?? "var(--ui5-action)";

  return (
    <div  className={"xp-toast-bubble ui5-u-background-ui5-value-background" + " " + (vis ? "ui5-u-opacity-1" : "ui5-u-opacity-0") + " " + (vis ? "ui5-u-transform-translatex-0" : "ui5-u-transform-translatex-100px")} style={{ "--ui5-value-background": bg } as React.CSSProperties}>
      {toast.icon && <span className="ui5-u-font-size-1-2rem">{toast.icon}</span>}
      <span>{toast.message}</span>
    </div>
  );
}
