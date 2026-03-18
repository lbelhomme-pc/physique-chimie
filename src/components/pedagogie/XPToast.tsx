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
    <div style={{ position: "fixed", bottom: 20, right: 20, display: "flex", flexDirection: "column", gap: 8, zIndex: 9999, pointerEvents: "none" }}>
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

  const bg = { xp: "var(--accent-primary)", rank_up: "#d4af37", badge: "var(--accent-purple)", streak_bonus: "var(--accent-warning)", chapter_complete: "var(--accent-success)" }[toast.type] ?? "var(--accent-primary)";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: "0.9rem", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", transition: "all 0.3s ease", pointerEvents: "auto", background: bg, opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(100px)" }}>
      {toast.icon && <span style={{ fontSize: "1.2rem" }}>{toast.icon}</span>}
      <span style={{ whiteSpace: "nowrap" }}>{toast.message}</span>
    </div>
  );
}
