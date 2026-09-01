from pathlib import Path

path = Path("src/styles/design-system.css")
original = path.read_text(encoding="utf-8")
assert len(original.encode()) > 65000, "design-system.css is not the expected C16 monolith"
assert '@import "./tokens-v3.css";' in original

text = original
replacements = {
    "--text-muted: #8896a6;": "--text-muted: #58677a;",
    "--text-muted: #9ca3af;": "--text-muted: #c5ccd6;",
    "--text-muted: #8b7355;": "--text-muted: #766249;",
    "--text-muted: #a08060;": "--text-muted: #b59673;",
    "--accent-success: #10b981;": "--accent-success: #047857;",
    "--accent-danger: #ef4444;": "--accent-danger: #b91c1c;",
    "--accent-purple: #8b5cf6;": "--accent-purple: #6d28d9;",
    "color: #b8860b;": "color: var(--accent-rank);",
}
expected_counts = {
    "--text-muted: #8896a6;": 2,
    "--text-muted: #9ca3af;": 1,
    "--text-muted: #8b7355;": 1,
    "--text-muted: #a08060;": 1,
    "--accent-success: #10b981;": 1,
    "--accent-danger: #ef4444;": 1,
    "--accent-purple: #8b5cf6;": 1,
    "color: #b8860b;": 1,
}
for old, new in replacements.items():
    count = text.count(old)
    assert count == expected_counts[old], f"unexpected count for {old!r}: {count}"
    text = text.replace(old, new)

target = ".box-regle-or h3 {\n  color: #dc2626;"
assert text.count(target) == 1
text = text.replace(target, ".box-regle-or h3 {\n  color: var(--accent-danger);")

root_anchor = "  --accent-orange: #f97316;\n"
assert text.count(root_anchor) == 1
text = text.replace(root_anchor, root_anchor + "  --accent-rank: #765600;\n")

gray_anchor = "  --accent-primary-light: #2a2f5f;\n"
assert text.count(gray_anchor) == 1
text = text.replace(gray_anchor, gray_anchor + "  --accent-rank: #facc15;\n")

dark_anchor = "  --accent-purple-light: #2e1065;\n"
assert text.count(dark_anchor) == 1
text = text.replace(dark_anchor, dark_anchor + "  --accent-rank: #facc15;\n")

blue_anchor = "  --accent-primary-light: #3a2a10;\n"
assert text.count(blue_anchor) == 1
text = text.replace(blue_anchor, blue_anchor + "  --accent-rank: #facc15;\n")


def section(label: str) -> int:
    needle = f"   {label}\n"
    index = text.index(needle)
    start = text.rfind("/*", 0, index)
    assert start >= 0
    return start


theme_start = section("VARIABLES — THÈME CLAIR (défaut)")
global_start = section("GLOBAL")
nav_start = section("NAVIGATION — Barre de pills avec emojis")
course_start = section("COURS MDX — Contenu principal")
animations_start = section("ANIMATIONS (désactivables via a11y)")
reference_start = text.index("/* Reference UI V3 - couche commune pour les pages publiques */")

assert theme_start < global_start < nav_start < course_start < animations_start < reference_start

modules = {
    "theme.css": text[theme_start:global_start],
    "core.css": text[global_start:nav_start],
    "components.css": text[nav_start:course_start],
    "course-content.css": text[course_start:animations_start],
    "utilities.css": text[animations_start:reference_start],
    "reference-v3.css": text[reference_start:],
}

assert "".join(modules.values()) == text[theme_start:], "CSS split changed rule order or contents"
for name, content in modules.items():
    assert content.strip(), f"{name} empty"
    Path("src/styles", name).write_text(content, encoding="utf-8")

entrypoint = '''/* src/styles/design-system.css */
/* Point d'entree du design system V3 — cascade modulaire C17. */
/* L'ordre des imports preserve exactement l'ordre de cascade historique. */

@import "./tokens-v3.css";
@import "./theme.css";
@import "./core.css";
@import "./components.css";
@import "./course-content.css";
@import "./utilities.css";
@import "./reference-v3.css";
'''
path.write_text(entrypoint, encoding="utf-8")

print("C17 CSS migration generated successfully")
for name, content in modules.items():
    print(f"{name}: {len(content.encode('utf-8'))} bytes")
