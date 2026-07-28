// src/components/accessibility/AccessibilityPanel.tsx
// Panneau V3 des preferences DYS et accessibilite.

import { useEffect, useId, useRef, useState } from "react";
import { getA11yEngine, PROFILES, type A11yPreferences } from "../../data/accessibility/a11y-engine";

type PanelTab = "profiles" | "custom";

const THEME_OPTIONS = [
  ["light", "Clair"],
  ["gray-light", "Gris clair"],
  ["gray", "Gris"],
  ["dark", "Sombre"],
  ["sepia", "Sepia"],
  ["blue-light", "Nuit"],
  ["auto", "Auto"],
] as const;

const FONT_OPTIONS = [
  ["default", "Standard"],
  ["opendyslexic", "DYS lisible"],
  ["comic-sans", "Comic Sans"],
  ["verdana", "Verdana"],
  ["arial", "Arial"],
] as const;

const SIZE_OPTIONS = [
  ["normal", "Normal"],
  ["large", "Grand"],
  ["x-large", "Tres grand"],
] as const;

const SPACING_OPTIONS = [
  ["normal", "Normal"],
  ["large", "Espace"],
  ["x-large", "Tres espace"],
] as const;

const WIDTH_OPTIONS = [
  ["normal", "Normal"],
  ["narrow", "Etroit"],
  ["very-narrow", "Tres etroit"],
] as const;

export default function AccessibilityPanel() {
  const [engine] = useState(() => getA11yEngine());
  const [prefs, setPrefs] = useState<A11yPreferences>(() => engine.getPrefs());
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>("profiles");
  const panelTitleId = useId();
  const statusId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const unsubscribe = engine.subscribe((nextPrefs) => setPrefs(nextPrefs));
    return unsubscribe;
  }, [engine]);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function setPref<K extends keyof A11yPreferences>(key: K, value: A11yPreferences[K]) {
    engine.setPref(key, value);
  }

  function applyProfile(id: string) {
    engine.applyProfile(id);
  }

  const activeProfile = PROFILES.find((profile) =>
    Object.entries(profile.overrides).every(([key, value]) => prefs[key as keyof A11yPreferences] === value)
  )?.id ?? "custom";

  return (
    <>
      <button
        type="button"
        className="a11y-panel-toggle"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Ouvrir les parametres accessibilite et DYS"
        aria-expanded={isOpen}
        aria-controls="a11y-panel-v3"
      >
        <span aria-hidden="true">Aa</span>
      </button>

      {isOpen && <button type="button" className="a11y-panel-overlay" aria-label="Fermer les parametres accessibilite" onClick={() => setIsOpen(false)} />}

      <aside
        id="a11y-panel-v3"
        className={isOpen ? "a11y-panel is-open" : "a11y-panel"}
        aria-labelledby={panelTitleId}
        aria-hidden={!isOpen}
      >
        <header className="a11y-panel__header">
          <div>
            <p>Preferences</p>
            <h2 id={panelTitleId}>Accessibilite et DYS</h2>
          </div>
          <button ref={closeRef} type="button" className="a11y-panel__close" onClick={() => setIsOpen(false)} aria-label="Fermer le panneau">
            x
          </button>
        </header>

        <p id={statusId} className="a11y-panel__status" aria-live="polite">
          Preferences conservees sur cet appareil.
        </p>

        <div className="a11y-panel__tabs" role="tablist" aria-label="Modes de reglage">
          <button type="button" role="tab" aria-selected={activeTab === "profiles"} onClick={() => setActiveTab("profiles")}>
            Profils
          </button>
          <button type="button" role="tab" aria-selected={activeTab === "custom"} onClick={() => setActiveTab("custom")}>
            Reglages
          </button>
        </div>

        <div className="a11y-panel__body">
          {activeTab === "profiles" && (
            <section aria-label="Profils rapides" className="a11y-panel__profiles">
              <p className="a11y-panel__hint">Choisis un profil, puis ajuste finement si besoin.</p>
              {PROFILES.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  className={activeProfile === profile.id ? "a11y-profile is-active" : "a11y-profile"}
                  onClick={() => applyProfile(profile.id)}
                  aria-describedby={statusId}
                >
                  <span>
                    <strong>{profile.name}</strong>
                    <small>{profile.description}</small>
                  </span>
                  <b>{activeProfile === profile.id ? "Actif" : "Choisir"}</b>
                </button>
              ))}
            </section>
          )}

          {activeTab === "custom" && (
            <section aria-label="Reglages detailles" className="a11y-panel__settings">
              <OptionGroup title="Theme" options={THEME_OPTIONS} value={prefs.theme} onSelect={(value) => setPref("theme", value)} />
              <OptionGroup title="Police" options={FONT_OPTIONS} value={prefs.fontFamily} onSelect={(value) => setPref("fontFamily", value)} />
              <OptionGroup title="Taille du texte" options={SIZE_OPTIONS} value={prefs.fontSize} onSelect={(value) => setPref("fontSize", value)} />
              <OptionGroup title="Interligne" options={SIZE_OPTIONS} value={prefs.lineHeight} onSelect={(value) => setPref("lineHeight", value)} />
              <OptionGroup title="Espacement lettres" options={SPACING_OPTIONS} value={prefs.letterSpacing} onSelect={(value) => setPref("letterSpacing", value)} />
              <OptionGroup title="Espacement mots" options={SPACING_OPTIONS} value={prefs.wordSpacing} onSelect={(value) => setPref("wordSpacing", value)} />
              <OptionGroup title="Largeur de lecture" options={WIDTH_OPTIONS} value={prefs.maxLineWidth} onSelect={(value) => setPref("maxLineWidth", value)} />

              <fieldset className="a11y-fieldset">
                <legend>Aides de lecture</legend>
                <SwitchButton label="Regle de lecture" checked={prefs.readingGuide} onChange={(value) => setPref("readingGuide", value)} />
                <SwitchButton label="Surligner les liens" checked={prefs.highlightLinks} onChange={(value) => setPref("highlightLinks", value)} />
                <SwitchButton label="Reduire les animations" checked={prefs.reducedMotion} onChange={(value) => setPref("reducedMotion", value)} />
                <SwitchButton label="Mode concentration" checked={prefs.focusMode} onChange={(value) => setPref("focusMode", value)} />
                <SwitchButton label="Curseur agrandi" checked={prefs.cursorSize === "large"} onChange={(value) => setPref("cursorSize", value ? "large" : "normal")} />
              </fieldset>

              <button type="button" className="a11y-panel__reset" onClick={() => engine.reset()}>
                Reinitialiser les reglages
              </button>
            </section>
          )}
        </div>
      </aside>

      <style>{`
        .a11y-panel-toggle {
          align-items: center;
          background: var(--v3-color-surface-raised, #fff);
          border: 1px solid var(--v3-color-border-default, #e2e8f0);
          border-radius: var(--v3-radius-pill, 999px);
          bottom: 1rem;
          box-shadow: var(--v3-shadow-md, 0 8px 18px rgba(15, 23, 42, 0.08));
          color: var(--v3-color-action, #2563eb);
          cursor: pointer;
          display: inline-flex;
          font: 900 1rem/1 var(--font-family, sans-serif);
          height: 3rem;
          justify-content: center;
          left: 1rem;
          position: fixed;
          width: 3rem;
          z-index: 9998;
        }

        .a11y-panel-toggle:focus-visible,
        .a11y-panel__close:focus-visible,
        .a11y-panel__tabs button:focus-visible,
        .a11y-profile:focus-visible,
        .a11y-option:focus-visible,
        .a11y-switch:focus-visible,
        .a11y-panel__reset:focus-visible {
          box-shadow: var(--v3-shadow-focus, 0 0 0 3px rgba(37, 99, 235, 0.28));
          outline: none;
        }

        .a11y-panel-overlay {
          background: rgba(15, 23, 42, 0.42);
          border: 0;
          inset: 0;
          position: fixed;
          z-index: 9997;
        }

        .a11y-panel {
          background: var(--v3-color-surface-raised, #fff);
          border-right: 1px solid var(--v3-color-border-default, #e2e8f0);
          box-shadow: var(--v3-shadow-md, 0 8px 18px rgba(15, 23, 42, 0.08));
          color: var(--v3-color-text-main, #0f172a);
          display: flex;
          flex-direction: column;
          height: 100vh;
          left: 0;
          max-width: min(26rem, 94vw);
          position: fixed;
          top: 0;
          transform: translateX(-105%);
          transition: transform var(--v3-motion-base, 180ms ease);
          width: 26rem;
          z-index: 9999;
        }

        .a11y-panel.is-open {
          transform: translateX(0);
        }

        .a11y-panel__header {
          align-items: center;
          border-bottom: 1px solid var(--v3-color-border-default, #e2e8f0);
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem;
        }

        .a11y-panel__header p {
          color: var(--v3-color-action, #2563eb);
          font-size: var(--v3-font-size-xs, 0.75rem);
          font-weight: 900;
          margin: 0 0 0.2rem;
          text-transform: uppercase;
        }

        .a11y-panel__header h2 {
          font-size: var(--v3-font-size-xl, 1.25rem);
          letter-spacing: 0;
          margin: 0;
        }

        .a11y-panel__close {
          background: var(--v3-color-surface-muted, #f5f7fa);
          border: 1px solid var(--v3-color-border-default, #e2e8f0);
          border-radius: var(--v3-radius-pill, 999px);
          color: var(--v3-color-text-subtle, #475569);
          cursor: pointer;
          font: inherit;
          font-weight: 900;
          height: 2.25rem;
          width: 2.25rem;
        }

        .a11y-panel__status,
        .a11y-panel__hint {
          color: var(--v3-color-text-subtle, #475569);
          font-size: var(--v3-font-size-sm, 0.875rem);
          margin: 0;
        }

        .a11y-panel__status {
          padding: 0.75rem 1rem 0;
        }

        .a11y-panel__tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.25rem;
          padding: 0.75rem 1rem 0;
        }

        .a11y-panel__tabs button,
        .a11y-option,
        .a11y-switch,
        .a11y-profile,
        .a11y-panel__reset {
          border-radius: var(--v3-radius-md, 8px);
          cursor: pointer;
          font: inherit;
        }

        .a11y-panel__tabs button {
          background: var(--v3-color-surface-muted, #f5f7fa);
          border: 1px solid var(--v3-color-border-default, #e2e8f0);
          color: var(--v3-color-text-subtle, #475569);
          min-height: 2.5rem;
        }

        .a11y-panel__tabs button[aria-selected="true"] {
          background: var(--v3-color-action, #2563eb);
          border-color: var(--v3-color-action, #2563eb);
          color: #fff;
          font-weight: 850;
        }

        .a11y-panel__body {
          overflow-y: auto;
          padding: 1rem;
        }

        .a11y-panel__profiles,
        .a11y-panel__settings {
          display: grid;
          gap: 0.75rem;
        }

        .a11y-profile {
          align-items: center;
          background: var(--v3-color-surface-muted, #f5f7fa);
          border: 1px solid var(--v3-color-border-default, #e2e8f0);
          color: inherit;
          display: flex;
          gap: 0.75rem;
          justify-content: space-between;
          min-height: 4.25rem;
          padding: 0.75rem;
          text-align: left;
          width: 100%;
        }

        .a11y-profile.is-active {
          background: var(--v3-color-action-subtle, #eff6ff);
          border-color: var(--v3-color-action, #2563eb);
        }

        .a11y-profile strong,
        .a11y-profile small {
          display: block;
        }

        .a11y-profile small {
          color: var(--v3-color-text-subtle, #475569);
          margin-top: 0.2rem;
        }

        .a11y-profile b,
        .a11y-switch b {
          color: var(--v3-color-action, #2563eb);
          font-size: var(--v3-font-size-xs, 0.75rem);
          white-space: nowrap;
        }

        .a11y-fieldset {
          border: 0;
          display: grid;
          gap: 0.5rem;
          margin: 0;
          padding: 0;
        }

        .a11y-fieldset legend {
          color: var(--v3-color-text-main, #0f172a);
          font-weight: 850;
          margin-bottom: 0.4rem;
        }

        .a11y-option-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }

        .a11y-option {
          background: var(--v3-color-surface-muted, #f5f7fa);
          border: 1px solid var(--v3-color-border-default, #e2e8f0);
          color: var(--v3-color-text-subtle, #475569);
          min-height: 2.25rem;
          padding: 0.4rem 0.65rem;
        }

        .a11y-option[aria-pressed="true"] {
          background: var(--v3-color-action, #2563eb);
          border-color: var(--v3-color-action, #2563eb);
          color: #fff;
          font-weight: 850;
        }

        .a11y-switch {
          align-items: center;
          background: var(--v3-color-surface-muted, #f5f7fa);
          border: 1px solid var(--v3-color-border-default, #e2e8f0);
          color: var(--v3-color-text-main, #0f172a);
          display: flex;
          justify-content: space-between;
          min-height: 2.75rem;
          padding: 0.5rem 0.65rem;
          text-align: left;
          width: 100%;
        }

        .a11y-switch[aria-checked="true"] {
          border-color: var(--v3-color-action, #2563eb);
        }

        .a11y-panel__reset {
          background: var(--v3-color-surface-raised, #fff);
          border: 1px solid var(--v3-color-border-default, #e2e8f0);
          color: var(--v3-color-text-subtle, #475569);
          min-height: 2.75rem;
          padding: 0.55rem 0.75rem;
        }

        @media (prefers-reduced-motion: reduce) {
          .a11y-panel {
            transition: none;
          }
        }

        @media (max-width: 420px) {
          .a11y-panel-toggle {
            bottom: calc(9.75rem + env(safe-area-inset-bottom, 0px));
            left: 0.75rem;
          }

          body:has(.analytics-consent:not([hidden])) .a11y-panel-toggle {
            bottom: auto;
            left: auto;
            right: 0.75rem;
            top: 0.75rem;
          }
        }
      `}</style>
    </>
  );
}

function OptionGroup<T extends string>({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: readonly (readonly [T, string])[];
  value: T;
  onSelect: (value: T) => void;
}) {
  return (
    <fieldset className="a11y-fieldset">
      <legend>{title}</legend>
      <div className="a11y-option-grid">
        {options.map(([optionValue, label]) => (
          <button
            key={optionValue}
            type="button"
            className="a11y-option"
            aria-pressed={value === optionValue}
            onClick={() => onSelect(optionValue)}
          >
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function SwitchButton({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" className="a11y-switch" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
      <span>{label}</span>
      <b>{checked ? "Active" : "Inactive"}</b>
    </button>
  );
}
