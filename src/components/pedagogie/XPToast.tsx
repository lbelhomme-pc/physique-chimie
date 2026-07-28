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
      <style>{`
        .xp-toast-stack {
          bottom: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: min(22rem, calc(100vw - 2rem));
          pointer-events: none;
          position: fixed;
          right: 1.25rem;
          z-index: 9996;
        }

        .xp-toast-bubble {
          align-items: center;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          color: #fff;
          display: flex;
          font-size: 0.9rem;
          font-weight: 700;
          gap: 0.5rem;
          line-height: 1.35;
          padding: 0.65rem 1rem;
          pointer-events: auto;
          transition: opacity 0.3s ease, transform 0.3s ease;
          width: max-content;
          max-width: 100%;
        }

        .xp-toast-bubble span:last-child {
          overflow-wrap: anywhere;
        }

        @media (max-width: 420px) {
          .xp-toast-stack {
            bottom: auto;
            left: 0.75rem;
            right: 0.75rem;
            top: 0.75rem;
            max-width: none;
          }

          .xp-toast-bubble {
            justify-content: center;
            width: 100%;
          }

          body:has(.analytics-consent:not([hidden])) .xp-toast-stack {
            display: none;
          }
        }
      `}</style>
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
    <div className="xp-toast-bubble" style={{ background: bg, opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(100px)" }}>
      {toast.icon && <span style={{ fontSize: "1.2rem" }}>{toast.icon}</span>}
      <span>{toast.message}</span>
    </div>
  );
}
