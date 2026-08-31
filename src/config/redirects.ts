import {
  MEMORIZATION_LEGACY_REDIRECTS,
  getPhysicalScienceRoutePairs,
  getFuturePhysicalScienceRedirects,
  getPhysicalScienceRouteContext,
  type PhysicalScienceChapterRouteInput,
} from "../data/contentRoutes";

export type RedirectStatus = 301 | 302 | 307 | 308;

export interface RedirectRule {
  from: string;
  to: string;
  status: RedirectStatus;
  phase: "active" | "prepared";
}

export interface RedirectTargetIssue {
  from: string;
  to: string;
  phase: RedirectRule["phase"];
  reason: "invalid-source" | "invalid-target" | "self-redirect" | "missing-target";
}

export const activeRedirectRules: RedirectRule[] = Object.entries(MEMORIZATION_LEGACY_REDIRECTS).map(([from, to]) => ({
  from,
  to,
  status: 301,
  phase: "active",
}));

export function buildPhysicalScienceRedirectRules(
  chapters: PhysicalScienceChapterRouteInput[],
): RedirectRule[] {
  const contexts = chapters.map((chapter) =>
    getPhysicalScienceRouteContext(chapter.cycle, chapter.niveau, chapter.matiere, chapter.chapitre, { canonicalMode: "explicit" })
  );
  return Object.entries(getFuturePhysicalScienceRedirects(contexts)).map(([from, to]) => ({
    from,
    to,
    status: 301,
    phase: "active",
  }));
}

/** @deprecated C12 redirects are active; use buildPhysicalScienceRedirectRules. */
export const buildPreparedPhysicalScienceRedirectRules = buildPhysicalScienceRedirectRules;

export function normalizeRoutePath(route: string): string {
  const normalized = route.trim().replace(/\\/g, "/").replace(/\/{2,}/g, "/");
  if (!normalized || normalized === "/") return "/";
  return `/${normalized.replace(/^\/|\/$/g, "")}`;
}

export function getPhysicalScienceKnownRoutes(chapters: PhysicalScienceChapterRouteInput[]): string[] {
  return getPhysicalScienceRoutePairs(chapters).flatMap((pair) => [pair.legacyPath, pair.explicitPath]);
}

export function findRedirectTargetIssues(rules: RedirectRule[], availableRoutes: Iterable<string>): RedirectTargetIssue[] {
  const available = new Set(Array.from(availableRoutes, normalizeRoutePath));
  const issues: RedirectTargetIssue[] = [];

  for (const rule of rules) {
    const from = normalizeRoutePath(rule.from);
    const to = normalizeRoutePath(rule.to);

    if (!from.startsWith("/")) {
      issues.push({ from: rule.from, to: rule.to, phase: rule.phase, reason: "invalid-source" });
    }

    if (!to.startsWith("/")) {
      issues.push({ from: rule.from, to: rule.to, phase: rule.phase, reason: "invalid-target" });
      continue;
    }

    if (from === to) {
      issues.push({ from, to, phase: rule.phase, reason: "self-redirect" });
    }

    if (!available.has(to)) {
      issues.push({ from, to, phase: rule.phase, reason: "missing-target" });
    }
  }

  return issues;
}
