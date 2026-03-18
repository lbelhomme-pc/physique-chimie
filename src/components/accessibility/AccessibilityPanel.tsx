// src/components/accessibility/AccessibilityPanel.tsx
// Panneau d'accessibilité — réglages DYS complets
// Bouton ⚙️ discret qui ouvre un volet de réglages

import { useState, useEffect } from "react";
import { getA11yEngine, PROFILES, type A11yPreferences } from "../../data/accessibility/a11y-engine";

export default function AccessibilityPanel() {
  const [engine] = useState(() => getA11yEngine());
  const [prefs, setPrefs] = useState<A11yPreferences>(() => engine.getPrefs());
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profiles" | "custom">("profiles");

  useEffect(() => {
    const unsub = engine.subscribe((p) => setPrefs(p));
    return unsub;
  }, [engine]);

  function setPref<K extends keyof A11yPreferences>(key: K, value: A11yPreferences[K]) {
    engine.setPref(key, value);
  }

  function applyProfile(id: string) {
    engine.applyProfile(id);
  }

  function reset() {
    engine.reset();
  }

  // Déterminer le profil actif
  const activeProfile = PROFILES.find((p) => {
    const o = p.overrides;
    return Object.entries(o).every(([k, v]) => prefs[k as keyof A11yPreferences] === v);
  })?.id ?? "custom";

  return (
    <>
      {/* Bouton d'ouverture — discret en bas à gauche */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={styles.toggleBtn}
        aria-label="Ouvrir les paramètres d'accessibilité"
        title="Accessibilité"
      >
        <span style={styles.toggleIcon}>⚙️</span>
      </button>

      {/* Overlay */}
      {isOpen && <div style={styles.overlay} onClick={() => setIsOpen(false)} />}

      {/* Panneau */}
      <div style={{
        ...styles.panel,
        transform: isOpen ? "translateX(0)" : "translateX(-110%)",
      }}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>♿ Accessibilité</h2>
          <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>✕</button>
        </div>

        {/* Onglets Profils / Personnalisé */}
        <div style={styles.tabRow}>
          <button
            onClick={() => setActiveTab("profiles")}
            style={activeTab === "profiles" ? styles.tabActive : styles.tab}
          >
            Profils
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            style={activeTab === "custom" ? styles.tabActive : styles.tab}
          >
            Personnalisé
          </button>
        </div>

        <div style={styles.panelBody}>

          {/* ─── ONGLET PROFILS ─────────────────────── */}
          {activeTab === "profiles" && (
            <div>
              <p style={styles.hint}>Choisis un profil adapté à tes besoins :</p>
              <div style={styles.profileGrid}>
                {PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyProfile(p.id)}
                    style={{
                      ...styles.profileCard,
                      borderColor: activeProfile === p.id ? "#2563eb" : "#e2e8f0",
                      background: activeProfile === p.id ? "#eff6ff" : "#ffffff",
                    }}
                  >
                    <span style={styles.profileIcon}>{p.icon}</span>
                    <span style={styles.profileName}>{p.name}</span>
                    <span style={styles.profileDesc}>{p.description}</span>
                    {activeProfile === p.id && <span style={styles.profileActive}>✓ Actif</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── ONGLET PERSONNALISÉ ────────────────── */}
          {activeTab === "custom" && (
            <div style={styles.settingsGrid}>

              {/* Thème */}
              <fieldset style={styles.fieldset}>
                <legend style={styles.legend}>🎨 Thème</legend>
                <div style={styles.optionRow}>
                  {([
                    ["light", "☀️ Clair"],
                    ["gray-light", "🌤️ Gris clair"],
                    ["gray", "🌥️ Gris"],
                    ["dark", "🌙 Sombre"],
                    ["sepia", "📜 Sépia"],
                    ["blue-light", "🌅 Nuit"],
                    ["auto", "🔄 Auto"],
                  ] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPref("theme", val)}
                      style={prefs.theme === val ? styles.optionBtnActive : styles.optionBtn}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {prefs.theme === "auto" && (
                  <p style={{ fontSize: "0.7rem", color: "#94a3b8", marginTop: "0.3rem" }}>
                    Clair (7h-17h) → Gris clair (17h-20h) → Gris (20h-22h) → Sombre (22h-7h)
                  </p>
                )}
              </fieldset>

              {/* Police */}
              <fieldset style={styles.fieldset}>
                <legend style={styles.legend}>🔤 Police</legend>
                <div style={styles.optionRow}>
                  {([
                    ["default", "Standard"],
                    ["opendyslexic", "OpenDyslexic"],
                    ["comic-sans", "Comic Sans"],
                    ["verdana", "Verdana"],
                  ] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPref("fontFamily", val)}
                      style={prefs.fontFamily === val ? styles.optionBtnActive : styles.optionBtn}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Taille */}
              <fieldset style={styles.fieldset}>
                <legend style={styles.legend}>🔍 Taille du texte</legend>
                <div style={styles.optionRow}>
                  {([
                    ["normal", "Normal"],
                    ["large", "Grand"],
                    ["x-large", "Très grand"],
                  ] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPref("fontSize", val)}
                      style={prefs.fontSize === val ? styles.optionBtnActive : styles.optionBtn}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Interlignage */}
              <fieldset style={styles.fieldset}>
                <legend style={styles.legend}>↕️ Interlignage</legend>
                <div style={styles.optionRow}>
                  {([
                    ["normal", "Normal"],
                    ["large", "Aéré"],
                    ["x-large", "Très aéré"],
                  ] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPref("lineHeight", val)}
                      style={prefs.lineHeight === val ? styles.optionBtnActive : styles.optionBtn}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Espacement lettres */}
              <fieldset style={styles.fieldset}>
                <legend style={styles.legend}>↔️ Espacement des lettres</legend>
                <div style={styles.optionRow}>
                  {([
                    ["normal", "Normal"],
                    ["large", "Espacé"],
                    ["x-large", "Très espacé"],
                  ] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPref("letterSpacing", val)}
                      style={prefs.letterSpacing === val ? styles.optionBtnActive : styles.optionBtn}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Espacement mots */}
              <fieldset style={styles.fieldset}>
                <legend style={styles.legend}>📏 Espacement des mots</legend>
                <div style={styles.optionRow}>
                  {([
                    ["normal", "Normal"],
                    ["large", "Espacé"],
                    ["x-large", "Très espacé"],
                  ] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPref("wordSpacing", val)}
                      style={prefs.wordSpacing === val ? styles.optionBtnActive : styles.optionBtn}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Largeur de ligne */}
              <fieldset style={styles.fieldset}>
                <legend style={styles.legend}>📐 Largeur de ligne</legend>
                <div style={styles.optionRow}>
                  {([
                    ["normal", "Normal (75 car.)"],
                    ["narrow", "Étroit (60 car.)"],
                    ["very-narrow", "Très étroit (45 car.)"],
                  ] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPref("maxLineWidth", val)}
                      style={prefs.maxLineWidth === val ? styles.optionBtnActive : styles.optionBtn}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Toggles */}
              <fieldset style={styles.fieldset}>
                <legend style={styles.legend}>🛠️ Aides</legend>
                <div style={styles.toggleGrid}>
                  <ToggleSwitch
                    label="Règle de lecture"
                    icon="📏"
                    checked={prefs.readingGuide}
                    onChange={(v) => setPref("readingGuide", v)}
                  />
                  <ToggleSwitch
                    label="Surligner les liens"
                    icon="🔗"
                    checked={prefs.highlightLinks}
                    onChange={(v) => setPref("highlightLinks", v)}
                  />
                  <ToggleSwitch
                    label="Désactiver les animations"
                    icon="⏸️"
                    checked={prefs.reducedMotion}
                    onChange={(v) => setPref("reducedMotion", v)}
                  />
                  <ToggleSwitch
                    label="Mode concentration"
                    icon="🎯"
                    checked={prefs.focusMode}
                    onChange={(v) => setPref("focusMode", v)}
                  />
                  <ToggleSwitch
                    label="Curseur agrandi"
                    icon="🖱️"
                    checked={prefs.cursorSize === "large"}
                    onChange={(v) => setPref("cursorSize", v ? "large" : "normal")}
                  />
                </div>
              </fieldset>

              {/* Bouton reset */}
              <button onClick={reset} style={styles.resetBtn}>
                🔄 Réinitialiser tous les paramètres
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Sous-composant Toggle ───────────────────────────────

function ToggleSwitch({ label, icon, checked, onChange }: {
  label: string; icon: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label style={styles.toggleRow}>
      <span style={styles.toggleLabel}>{icon} {label}</span>
      <div
        onClick={() => onChange(!checked)}
        style={{
          ...styles.toggleTrack,
          background: checked ? "#2563eb" : "#cbd5e1",
        }}
      >
        <div style={{
          ...styles.toggleThumb,
          transform: checked ? "translateX(20px)" : "translateX(2px)",
        }} />
      </div>
    </label>
  );
}

// ─── Styles ──────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  // Toggle button
  toggleBtn: {
    position: "fixed",
    bottom: 20,
    left: 20,
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "2px solid #e2e8f0",
    background: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    cursor: "pointer",
    zIndex: 9998,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  toggleIcon: { fontSize: "1.4rem" },

  // Overlay
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.3)",
    zIndex: 9998,
  },

  // Panel
  panel: {
    position: "fixed",
    top: 0,
    left: 0,
    width: 360,
    maxWidth: "90vw",
    height: "100vh",
    background: "#ffffff",
    boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
    zIndex: 9999,
    overflowY: "auto",
    transition: "transform 0.3s ease",
    display: "flex",
    flexDirection: "column",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 1.25rem",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  panelTitle: { fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#1e293b" },
  closeBtn: {
    width: 32,
    height: 32,
    border: "none",
    background: "#f1f5f9",
    borderRadius: "50%",
    fontSize: "1rem",
    cursor: "pointer",
    color: "#64748b",
  },

  // Tabs
  tabRow: {
    display: "flex",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    padding: "0.65rem",
    border: "none",
    background: "transparent",
    fontSize: "0.85rem",
    fontWeight: 500,
    color: "#64748b",
    cursor: "pointer",
    borderBottom: "2px solid transparent",
  },
  tabActive: {
    flex: 1,
    padding: "0.65rem",
    border: "none",
    background: "transparent",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#2563eb",
    cursor: "pointer",
    borderBottom: "2px solid #2563eb",
  },

  panelBody: {
    padding: "1rem 1.25rem",
    flex: 1,
    overflowY: "auto",
  },

  hint: { fontSize: "0.85rem", color: "#64748b", marginBottom: "0.75rem" },

  // Profiles
  profileGrid: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  profileCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.15rem",
    padding: "0.75rem 1rem",
    border: "2px solid #e2e8f0",
    borderRadius: 10,
    background: "#ffffff",
    cursor: "pointer",
    textAlign: "left",
    position: "relative",
    width: "100%",
  },
  profileIcon: { fontSize: "1.3rem" },
  profileName: { fontSize: "0.9rem", fontWeight: 700, color: "#1e293b" },
  profileDesc: { fontSize: "0.75rem", color: "#64748b" },
  profileActive: {
    position: "absolute",
    top: 8,
    right: 10,
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#2563eb",
  },

  // Settings
  settingsGrid: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  fieldset: {
    border: "none",
    padding: 0,
    margin: 0,
  },
  legend: {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#475569",
    marginBottom: "0.4rem",
    display: "block",
  },
  optionRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.3rem",
  },
  optionBtn: {
    padding: "0.35rem 0.65rem",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    background: "#ffffff",
    fontSize: "0.75rem",
    cursor: "pointer",
    color: "#475569",
  },
  optionBtnActive: {
    padding: "0.35rem 0.65rem",
    border: "2px solid #2563eb",
    borderRadius: 6,
    background: "#eff6ff",
    fontSize: "0.75rem",
    cursor: "pointer",
    color: "#1e40af",
    fontWeight: 600,
  },

  // Toggles
  toggleGrid: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    padding: "0.25rem 0",
  },
  toggleLabel: { fontSize: "0.8rem", color: "#334155" },
  toggleTrack: {
    width: 42,
    height: 22,
    borderRadius: 99,
    position: "relative",
    cursor: "pointer",
    flexShrink: 0,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    position: "absolute",
    top: 2,
    transition: "transform 0.2s",
  },

  resetBtn: {
    width: "100%",
    padding: "0.6rem",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    background: "#f8fafc",
    fontSize: "0.8rem",
    cursor: "pointer",
    color: "#64748b",
    marginTop: "0.5rem",
  },
};
