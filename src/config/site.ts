export type SiteEnvironment = "production" | "preview" | "development";
export type SeoSchemaType = "WebPage" | "Course" | "LearningResource" | "SoftwareApplication";

const DEFAULT_PRODUCTION_URL = "https://physique-chimie-belhomme.vercel.app";

type RuntimeEnv = Record<string, string | undefined>;

const astroEnv = (import.meta as ImportMeta & { env?: RuntimeEnv }).env ?? {};
const nodeProcess = (globalThis as typeof globalThis & { process?: { env?: RuntimeEnv } }).process;
const nodeEnv = nodeProcess?.env ?? {};

function envValue(name: string): string | undefined {
  return astroEnv[name] ?? nodeEnv[name];
}

export function normalizeSiteUrl(value: string | undefined, fallback = DEFAULT_PRODUCTION_URL): string {
  const raw = value?.trim() || fallback;
  try {
    const parsed = new URL(raw);
    return parsed.origin;
  } catch {
    const parsed = new URL(fallback);
    return parsed.origin;
  }
}

const productionUrl = normalizeSiteUrl(envValue("PUBLIC_SITE_URL") ?? envValue("SITE_URL"));

export const siteConfig = {
  name: "Révisions interactives - Physique-Chimie et Mathématiques",
  shortName: "Révisions PC Maths",
  productionUrl,
  urls: {
    production: productionUrl,
    preview: normalizeSiteUrl(envValue("PUBLIC_PREVIEW_SITE_URL"), productionUrl),
    development: normalizeSiteUrl(envValue("PUBLIC_DEV_SITE_URL"), "http://localhost:4321"),
  } satisfies Record<SiteEnvironment, string>,
  defaultDescription:
    "Plateforme gratuite de révision en physique-chimie et mathématiques : cours, exercices, quiz, flashcards, outils et simulations du collège au lycée.",
  author: {
    name: "Ludovic Belhomme",
    email: "contact@physique-chimie.app",
  },
  publisher: {
    name: "Révisions interactives - Physique-Chimie et Mathématiques",
  },
  search: {
    path: "/",
    anchor: "recherche",
    queryInputName: "search_term_string",
    queryParam: "q",
  },
  analytics: {
    googleMeasurementId: envValue("PUBLIC_GA_MEASUREMENT_ID") ?? "G-9JPGPYQZ3C",
    consentStorageKey: "site.analyticsConsent",
    consentGrantedValue: "granted",
    consentDeniedValue: "denied",
    cookieNames: ["_ga", "_ga_*"],
    documentedEvents: ["page_view"],
  },
  assets: {
    faviconSvg: "/favicon.svg",
    faviconIco: "/favicon.ico",
    appleTouchIcon: "/icon-192.png",
    manifest: "/manifest.json",
    ogImage: "/og-image.png",
    icons: {
      any192: "/icon-192.png",
      any512: "/icon-512.png",
      maskable512: "/icon-maskable-512.png",
    },
  },
  pwa: {
    id: "/",
    startUrl: "/",
    display: "standalone",
    backgroundColor: "#eef2f7",
    themeColor: "#4f46e5",
    orientation: "portrait-primary",
    categories: ["education", "productivity"],
    lang: "fr",
  },
} as const;

export function absoluteSiteUrl(pathOrUrl = "/"): string {
  const url = /^https?:\/\//i.test(pathOrUrl)
    ? new URL(pathOrUrl)
    : new URL(pathOrUrl, `${siteConfig.productionUrl}/`);
  if (url.pathname !== "/") {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }
  return url.toString();
}

export function pageDescription(description: string | undefined, title: string, pathname = "/"): string {
  const clean = description?.trim();
  if (clean) return clean;

  if (pathname === "/") return siteConfig.defaultDescription;
  if (pathname.startsWith("/mathematiques")) {
    return `${title} : ressources de mathématiques avec cours, exercices, quiz et flashcards.`;
  }
  if (pathname.startsWith("/laboratoire")) {
    return `${title} : simulation interactive de laboratoire pour explorer une notion scientifique.`;
  }
  if (pathname.startsWith("/outils-methodes")) {
    return `${title} : outil ou méthode pour travailler plus efficacement en sciences et en mathématiques.`;
  }
  if (pathname.startsWith("/memorisation") || pathname.includes("mega-")) {
    return `${title} : entraînement de mémorisation avec quiz, flashcards et révision progressive.`;
  }
  return `${title} : cours, exercices, quiz et flashcards pour réviser du collège au lycée.`;
}

export function resolveSchemaType(schemaType: string | undefined): SeoSchemaType {
  if (schemaType === "Course") return "Course";
  if (schemaType === "SoftwareApplication") return "SoftwareApplication";
  if (schemaType === "EducationalContent" || schemaType === "LearningResource") return "LearningResource";
  return "WebPage";
}

export function resolveRobotsContent(noindex = false): string {
  return noindex ? "noindex, nofollow" : "index, follow";
}

type JsonLdValue = string | number | boolean | null | JsonLdObject | JsonLdValue[];
type JsonLdObject = { [key: string]: JsonLdValue };

export interface PageJsonLdInput {
  title: string;
  description: string;
  canonicalUrl: string;
  schemaType?: string;
  subject?: string;
  cycle?: string;
  level?: string;
  resourceType?: string;
  imageUrl?: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  mathematiques: "Mathématiques",
  "physique-chimie": "Physique-Chimie",
  "enseignement-scientifique": "Enseignement scientifique",
};

const CYCLE_LABELS: Record<string, string> = {
  college: "Collège",
  lycee: "Lycée",
};

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  chapter: "course",
  course: "course",
  exercise: "exercise",
  exercices: "exercise",
  quiz: "quiz",
  flashcards: "flashcards",
  laboratory: "simulation",
  laboratoire: "simulation",
  method: "method",
  methods: "method",
  resource: "learning resource",
};

function graphId(baseUrl: string, fragment: string): string {
  return `${baseUrl}#${fragment}`;
}

function labelFromCode(value: string | undefined, labels: Record<string, string>): string | undefined {
  if (!value) return undefined;
  return labels[value] ?? value;
}

function educationalLevel(cycle?: string, level?: string): string {
  const levelLabel = level ? level.replace(/-/g, " ") : undefined;
  const cycleLabel = labelFromCode(cycle, CYCLE_LABELS);
  if (cycleLabel && levelLabel) return `${cycleLabel} - ${levelLabel}`;
  if (cycleLabel) return cycleLabel;
  if (levelLabel) return levelLabel;
  return "Collège / Lycée";
}

function subjectNode(subject?: string): JsonLdObject | undefined {
  const name = labelFromCode(subject, SUBJECT_LABELS);
  if (!name) return undefined;
  return {
    "@type": "Thing",
    name,
  };
}

function searchAction(): JsonLdObject {
  const queryName = siteConfig.search.queryInputName;
  const target = `${siteConfig.productionUrl}${siteConfig.search.path}?${siteConfig.search.queryParam}={${queryName}}#${siteConfig.search.anchor}`;
  return {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: target,
    },
    "query-input": `required name=${queryName}`,
  };
}

function baseLearningNode(input: PageJsonLdInput, type: "Course" | "LearningResource"): JsonLdObject {
  const about = subjectNode(input.subject);
  const learningResourceType = labelFromCode(input.resourceType, RESOURCE_TYPE_LABELS) ?? "course";
  return {
    "@type": type,
    "@id": graphId(input.canonicalUrl, type === "Course" ? "course" : "learning-resource"),
    name: input.title,
    description: input.description,
    url: input.canonicalUrl,
    provider: { "@id": graphId(siteConfig.productionUrl, "organization") },
    publisher: { "@id": graphId(siteConfig.productionUrl, "organization") },
    inLanguage: "fr-FR",
    isAccessibleForFree: true,
    educationalLevel: educationalLevel(input.cycle, input.level),
    learningResourceType,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
    ...(about ? { about } : {}),
    mainEntityOfPage: { "@id": graphId(input.canonicalUrl, "webpage") },
  };
}

export function buildPageJsonLd(input: PageJsonLdInput): JsonLdObject {
  const resolvedType = resolveSchemaType(input.schemaType);
  const organizationId = graphId(siteConfig.productionUrl, "organization");
  const webSiteId = graphId(siteConfig.productionUrl, "website");
  const webPageId = graphId(input.canonicalUrl, "webpage");
  const about = subjectNode(input.subject);

  const organization: JsonLdObject = {
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.publisher.name,
    url: siteConfig.productionUrl,
  };

  const website: JsonLdObject = {
    "@type": "WebSite",
    "@id": webSiteId,
    name: siteConfig.name,
    url: siteConfig.productionUrl,
    inLanguage: "fr-FR",
    publisher: { "@id": organizationId },
    potentialAction: searchAction(),
  };

  const webpage: JsonLdObject = {
    "@type": "WebPage",
    "@id": webPageId,
    name: input.title,
    description: input.description,
    url: input.canonicalUrl,
    inLanguage: "fr-FR",
    isPartOf: { "@id": webSiteId },
    publisher: { "@id": organizationId },
    ...(input.imageUrl ? { primaryImageOfPage: input.imageUrl } : {}),
    ...(about ? { about } : {}),
  };

  const primaryNode = resolvedType === "Course"
    ? baseLearningNode(input, "Course")
    : resolvedType === "LearningResource"
      ? baseLearningNode(input, "LearningResource")
      : resolvedType === "SoftwareApplication"
        ? {
            "@type": "SoftwareApplication",
            "@id": graphId(input.canonicalUrl, "software-application"),
            name: input.title,
            description: input.description,
            url: input.canonicalUrl,
            applicationCategory: "EducationalApplication",
            operatingSystem: "Web",
            publisher: { "@id": organizationId },
            inLanguage: "fr-FR",
            isAccessibleForFree: true,
            offers: {
              "@type": "Offer",
              price: 0,
              priceCurrency: "EUR",
            },
            mainEntityOfPage: { "@id": webPageId },
          }
        : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, webpage, ...(primaryNode ? [primaryNode] : [])],
  };
}
