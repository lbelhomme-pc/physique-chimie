// src/components/accessibility/AccessibilityPanel.tsx
// Panneau V3 des préférences DYS et accessibilité.

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
  ["x-large", "Très grand"],
] as const;

const SPACING_OPTIONS = [
  ["normal", "Normal"],
  ["large", "Espace"],
  ["x-large", "Très espacé"],
] as const;

const WIDTH_OPTIONS = [
  ["normal", "Normal"],
  ["narrow", "Étroit"],
  ["very-narrow", "Très étroit"],
] as const;

export default function AccessibilityPanel({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const [engine] = useState(() => getA11yEngine());
  const [prefs, setPrefs] = useState<A11yPreferences>(() => engine.getPrefs());
  const [isOpen, setIsOpen] = useState(initiallyOpen);
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
        aria-label="Ouvrir les paramètres accessibilité et DYS"
        aria-expanded={isOpen}
        aria-controls="a11y-panel-v3"
      >
        <span aria-hidden="true">Aa</span>
      </button>

      {isOpen && <button type="button" className="a11y-panel-overlay" aria-label="Fermer les paramètres accessibilité" onClick={() => setIsOpen(false)} />}

      <aside
        id="a11y-panel-v3"
        className={isOpen ? "a11y-panel is-open" : "a11y-panel"}
        aria-labelledby={panelTitleId}
        aria-hidden={!isOpen}
      >
        <header className="a11y-panel__header">
          <div>
            <p>Préférences</p>
            <h2 id={panelTitleId}>Accessibilité et DYS</h2>
          </div>
          <button ref={closeRef} type="button" className="a11y-panel__close" onClick={() => setIsOpen(false)} aria-label="Fermer le panneau">
            x
          </button>
        </header>

        <p id={statusId} className="a11y-panel__status" aria-live="polite">
          Préférences conservées sur cet appareil.
        </p>

        <div className="a11y-panel__tabs" role="tablist" aria-label="Modes de réglage">
          <button type="button" role="tab" aria-selected={activeTab === "profiles"} onClick={() => setActiveTab("profiles")}>
            Profils
          </button>
          <button type="button" role="tab" aria-selected={activeTab === "custom"} onClick={() => setActiveTab("custom")}>
            Réglages
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
            <section aria-label="Réglages détaillés" className="a11y-panel__settings">
              <OptionGroup title="Thème" options={THEME_OPTIONS} value={prefs.theme} onSelect={(value) => setPref("theme", value)} />
              <OptionGroup title="Police" options={FONT_OPTIONS} value={prefs.fontFamily} onSelect={(value) => setPref("fontFamily", value)} />
              <OptionGroup title="Taille du texte" options={SIZE_OPTIONS} value={prefs.fontSize} onSelect={(value) => setPref("fontSize", value)} />
              <OptionGroup title="Interligne" options={SIZE_OPTIONS} value={prefs.lineHeight} onSelect={(value) => setPref("lineHeight", value)} />
              <OptionGroup title="Espacement lettres" options={SPACING_OPTIONS} value={prefs.letterSpacing} onSelect={(value) => setPref("letterSpacing", value)} />
              <OptionGroup title="Espacement mots" options={SPACING_OPTIONS} value={prefs.wordSpacing} onSelect={(value) => setPref("wordSpacing", value)} />
              <OptionGroup title="Largeur de lecture" options={WIDTH_OPTIONS} value={prefs.maxLineWidth} onSelect={(value) => setPref("maxLineWidth", value)} />

              <fieldset className="a11y-fieldset">
                <legend>Aides de lecture</legend>
                <SwitchButton label="Règle de lecture" checked={prefs.readingGuide} onChange={(value) => setPref("readingGuide", value)} />
                <SwitchButton label="Surligner les liens" checked={prefs.highlightLinks} onChange={(value) => setPref("highlightLinks", value)} />
                <SwitchButton label="Réduire les animations" checked={prefs.reducedMotion} onChange={(value) => setPref("reducedMotion", value)} />
                <SwitchButton label="Mode concentration" checked={prefs.focusMode} onChange={(value) => setPref("focusMode", value)} />
                <SwitchButton label="Curseur agrandi" checked={prefs.cursorSize === "large"} onChange={(value) => setPref("cursorSize", value ? "large" : "normal")} />
              </fieldset>

              <button type="button" className="a11y-panel__reset" onClick={() => engine.reset()}>
                Réinitialiser les réglages
              </button>
            </section>
          )}
        </div>
      </aside>


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
