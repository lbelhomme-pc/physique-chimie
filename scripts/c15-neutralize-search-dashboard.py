from pathlib import Path


def replace_exact(path_str: str, old: str, new: str, expected: int = 1) -> None:
    path = Path(path_str)
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if count != expected:
        raise SystemExit(f"{path_str}: expected {expected} occurrence(s), got {count}: {old[:80]!r}")
    path.write_text(text.replace(old, new), encoding="utf-8")
    print(f"{path_str}: {count} replacement(s)")


# Search results must use the canonical C12 Physique-Chimie routes directly.
replace_exact(
    "src/pages/index.astro",
    'import { getPublishedMathematicsLevels } from "../data/contentRoutes";',
    'import { getPhysicalScienceExplicitChapterPath, getPublishedMathematicsLevels } from "../data/contentRoutes";',
)
replace_exact(
    "src/pages/index.astro",
    '    path: `/${cycle}/${niveau}/${matiere}/${slug}`,' ,
    '    path: getPhysicalScienceExplicitChapterPath(cycle, niveau, matiere as "physique" | "chimie", slug),',
)

# Public profile identity is transversal, not Physique-Chimie-only.
replace_exact(
    "src/pages/profil.astro",
    '<BaseLayout title="Mon profil — Physique-Chimie">',
    '<BaseLayout\n  title="Mon profil — Mathématiques et Physique-Chimie"\n  description="Progression locale en Mathématiques et Physique-Chimie sur cet appareil."\n  subject="transversal"\n>',
)

# Dashboard subject filter: display-only filtering, with no storage/SRS migration.
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    'type DashboardItem = {\n  resource: GlobalSearchResource;\n  percent: number;\n};',
    'type DashboardItem = {\n  resource: GlobalSearchResource;\n  percent: number;\n};\n\ntype DashboardSubjectFilter = "all" | "mathematiques" | "physique-chimie";\n\nconst dashboardSubjects: Array<{ id: DashboardSubjectFilter; label: string }> = [\n  { id: "all", label: "Toutes" },\n  { id: "mathematiques", label: "Mathématiques" },\n  { id: "physique-chimie", label: "Physique-Chimie" },\n];',
)
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    '  { label: "Exercices", href: "/college", detail: "S\'entrainer" },',
    '  { label: "Cours et exercices", href: "__subject__", detail: "Choisir dans la discipline" },',
)
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    '  { label: "Cours", href: "/college" },\n  { label: "Exercices", href: "/college#exercices" },',
    '  { label: "Cours", href: "__subject__" },\n  { label: "Exercices", href: "__subject__" },',
)
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    '  const [lastChapter, setLastChapter] = useState<LastChapter | null>(null);\n  const [, forceUpdate] = useState(0);',
    '  const [lastChapter, setLastChapter] = useState<LastChapter | null>(null);\n  const [subjectFilter, setSubjectFilter] = useState<DashboardSubjectFilter>("all");\n  const [, forceUpdate] = useState(0);',
)
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    '  const progressItems = useMemo(() => resources\n    .map((resource) => ({ resource, percent: engine.getChapterProgress(resource.id).percent }))\n    .filter((item) => item.percent > 0)\n    .sort((a, b) => b.percent - a.percent || a.resource.title.localeCompare(b.resource.title)), [engine, resources]);\n\n  const priorityItem = getPriorityItem(resources, progressItems, lastChapter);',
    '  const visibleResources = useMemo(\n    () => subjectFilter === "all" ? resources : resources.filter((resource) => resource.subject === subjectFilter),\n    [resources, subjectFilter],\n  );\n  const visibleLastChapter = lastChapter && visibleResources.some(\n    (resource) => lastChapter.path === resource.path || lastChapter.path.startsWith(`${resource.path}#`),\n  ) ? lastChapter : null;\n  const progressItems = useMemo(() => visibleResources\n    .map((resource) => ({ resource, percent: engine.getChapterProgress(resource.id).percent }))\n    .filter((item) => item.percent > 0)\n    .sort((a, b) => b.percent - a.percent || a.resource.title.localeCompare(b.resource.title)), [engine, visibleResources]);\n\n  const priorityItem = getPriorityItem(visibleResources, progressItems, visibleLastChapter);',
)
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    '      resource: resources.find((resource) => resource.id === entry.chapterId),',
    '      resource: visibleResources.find((resource) => resource.id === entry.chapterId),',
)
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    '  const historyItems = progressItems.slice(0, 6);\n  const hasLocalActivity = progressItems.length > 0 || xp > 0 || globalDue > 0 || Boolean(lastChapter);\n  const priorityHref = lastChapter?.path ?? priorityItem?.resource.path ?? "/college";\n  const priorityTitle = lastChapter?.title ?? priorityItem?.resource.title ?? "Choisir un chapitre";',
    '  const historyItems = progressItems.slice(0, 6);\n  const hasLocalActivity = progressItems.length > 0 || xp > 0 || globalDue > 0 || Boolean(visibleLastChapter);\n  const subjectRoot = subjectFilter === "mathematiques" ? "/mathematiques" : subjectFilter === "physique-chimie" ? "/physique-chimie" : "/";\n  const priorityHref = visibleLastChapter?.path ?? priorityItem?.resource.path ?? subjectRoot;\n  const priorityTitle = visibleLastChapter?.title ?? priorityItem?.resource.title ?? "Choisir un chapitre";',
)
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    '          <span aria-hidden="true">PC</span>',
    '          <span aria-hidden="true">R</span>',
)
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    '            <a key={item.href} href={item.href} aria-current={item.href === "/" ? "page" : undefined}>',
    '            <a key={`${item.label}-${item.href}`} href={item.href === "__subject__" ? subjectRoot : item.href} aria-current={item.href === "/" ? "page" : undefined}>',
)
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    '        </header>\n\n        <div className="dashboard-v3__hero-grid" aria-label="Resume de progression">',
    '        </header>\n\n        <div data-dashboard-subject-filter="true" aria-label="Filtrer le tableau de bord par discipline" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>\n          {dashboardSubjects.map((subject) => (\n            <button\n              type="button"\n              key={subject.id}\n              aria-pressed={subjectFilter === subject.id}\n              onClick={() => setSubjectFilter(subject.id)}\n              style={{ border: "1px solid var(--v3-color-border)", borderRadius: "999px", padding: "0.45rem 0.75rem", cursor: "pointer", fontWeight: 800, background: subjectFilter === subject.id ? "var(--v3-color-primary)" : "var(--v3-color-surface)", color: subjectFilter === subject.id ? "#fff" : "var(--v3-color-text)" }}\n            >\n              {subject.label}\n            </button>\n          ))}\n        </div>\n\n        <div className="dashboard-v3__hero-grid" aria-label="Resume de progression">',
)
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    '            <strong>{completedCount} / {resources.length}</strong>\n            <small>{resources.length > 0 ? `${Math.round((completedCount / resources.length) * 100)}% du catalogue` : "Catalogue vide"}</small>',
    '            <strong>{completedCount} / {visibleResources.length}</strong>\n            <small>{visibleResources.length > 0 ? `${Math.round((completedCount / visibleResources.length) * 100)}% du catalogue affiché` : "Catalogue vide"}</small>',
)
replace_exact(
    "src/components/pedagogie/Dashboard.tsx",
    '              <a key={action.href} href={action.href}>',
    '              <a key={`${action.label}-${action.href}`} href={action.href === "__subject__" ? subjectRoot : action.href}>',
)

print("C15 search/dashboard/profile neutralization complete")
