export const PUBLISHED_CONTENT_SCHOOL_YEAR = "2026-2027" as const;

export type SchoolYear = `${number}-${number}`;
export type CurriculumDiscipline = "physique-chimie" | "mathematiques";
export type CurriculumCycle = "college" | "lycee";
export type CurriculumTrack =
  | "physique-chimie"
  | "sciences-technologie"
  | "enseignement-scientifique"
  | "mathematiques"
  | "mathematiques-specialite"
  | "mathematiques-integrees-es"
  | "mathematiques-complementaires"
  | "mathematiques-expertes";

export interface CurriculumApplicationWindow {
  appliesFrom: SchoolYear;
  appliesUntil?: SchoolYear;
}

export interface CurriculumVersionDefinition {
  id: string;
  discipline: CurriculumDiscipline;
  cycle: CurriculumCycle;
  track: CurriculumTrack;
  niveaux: readonly string[];
  officialSourceIds: readonly string[];
  label: string;
  publishedOn: string;
  officialUrl: string;
  applicationByLevel: Readonly<Record<string, CurriculumApplicationWindow>>;
}

export interface ResolvedCurriculumVersion {
  id: string;
  discipline: CurriculumDiscipline;
  cycle: CurriculumCycle;
  track: CurriculumTrack;
  niveau: string;
  officialSourceId: string;
  label: string;
  publishedOn: string;
  officialUrl: string;
  schoolYear: SchoolYear;
  appliesFrom: SchoolYear;
  appliesUntil?: SchoolYear;
}

export interface ResolveCurriculumVersionInput {
  discipline: CurriculumDiscipline;
  cycle: CurriculumCycle;
  niveau: string;
  schoolYear: string;
  sourceId?: string;
  track?: CurriculumTrack;
}

function window(appliesFrom: SchoolYear, appliesUntil?: SchoolYear): CurriculumApplicationWindow {
  return appliesUntil ? { appliesFrom, appliesUntil } : { appliesFrom };
}

export const CURRICULUM_VERSIONS: readonly CurriculumVersionDefinition[] = [
  {
    id: "sciences-technologie-cycle3-2023",
    discipline: "physique-chimie",
    cycle: "college",
    track: "sciences-technologie",
    niveaux: ["6eme"],
    officialSourceIds: ["bo-cycle3-sciences-technologie-2023"],
    label: "Sciences et technologie — cycle 3 — programme 2023",
    publishedOn: "2023-06-22",
    officialUrl: "https://www.education.gouv.fr/bo/2023/Hebdo25/MENE2314101A",
    applicationByLevel: { "6eme": window("2023-2024", "2026-2027") },
  },
  {
    id: "sciences-technologie-cycle3-2026",
    discipline: "physique-chimie",
    cycle: "college",
    track: "sciences-technologie",
    niveaux: ["6eme"],
    officialSourceIds: ["bo-cycle3-sciences-technologie-2026"],
    label: "Sciences et technologie — cycle 3 — programme 2026",
    publishedOn: "2026-06-11",
    officialUrl: "https://www.education.gouv.fr/bo/2026/Hebdo24/MENE2611650A",
    applicationByLevel: { "6eme": window("2027-2028") },
  },
  {
    id: "physique-chimie-cycle4-2020",
    discipline: "physique-chimie",
    cycle: "college",
    track: "physique-chimie",
    niveaux: ["5eme", "4eme", "3eme"],
    officialSourceIds: ["bo-cycle4-physique-chimie-2020"],
    label: "Physique-Chimie — cycle 4 — programme 2020",
    publishedOn: "2020-07-30",
    officialUrl: "https://www.education.gouv.fr/bo/20/Hebdo31/MENE2018714A.htm",
    applicationByLevel: {
      "5eme": window("2020-2021"),
      "4eme": window("2020-2021"),
      "3eme": window("2020-2021"),
    },
  },
  {
    id: "mathematiques-cycle4-2020",
    discipline: "mathematiques",
    cycle: "college",
    track: "mathematiques",
    niveaux: ["5eme", "4eme", "3eme"],
    officialSourceIds: ["bo-cycle4-mathematiques-2020"],
    label: "Mathématiques — cycle 4 — programme antérieur à la réforme 2026",
    publishedOn: "2020-07-30",
    officialUrl: "https://www.education.gouv.fr/bo/20/Hebdo31/MENE2018714A.htm",
    applicationByLevel: {
      "5eme": window("2020-2021", "2025-2026"),
      "4eme": window("2020-2021", "2026-2027"),
      "3eme": window("2020-2021", "2027-2028"),
    },
  },
  {
    id: "mathematiques-cycle4-2026",
    discipline: "mathematiques",
    cycle: "college",
    track: "mathematiques",
    niveaux: ["5eme", "4eme", "3eme"],
    officialSourceIds: ["bo-cycle4-mathematiques-2026"],
    label: "Mathématiques — cycle 4 — programme 2026",
    publishedOn: "2026-03-05",
    officialUrl: "https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A",
    applicationByLevel: {
      "5eme": window("2026-2027"),
      "4eme": window("2027-2028"),
      "3eme": window("2028-2029"),
    },
  },
  {
    id: "mathematiques-seconde-2019",
    discipline: "mathematiques",
    cycle: "lycee",
    track: "mathematiques",
    niveaux: ["2nde"],
    officialSourceIds: ["bo-2019-mathematiques-seconde-gt"],
    label: "Mathématiques — seconde générale et technologique — programme 2019",
    publishedOn: "2019-01-22",
    officialUrl: "https://www.education.gouv.fr/bo/19/Special1/MENE1901631A.htm",
    applicationByLevel: { "2nde": window("2019-2020", "2025-2026") },
  },
  {
    id: "mathematiques-seconde-2026",
    discipline: "mathematiques",
    cycle: "lycee",
    track: "mathematiques",
    niveaux: ["2nde"],
    officialSourceIds: ["bo-2026-mathematiques-seconde-gt"],
    label: "Mathématiques — seconde générale et technologique — programme 2026",
    publishedOn: "2026-04-02",
    officialUrl: "https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602914A",
    applicationByLevel: { "2nde": window("2026-2027") },
  },
  {
    id: "mathematiques-premiere-specialite-2019",
    discipline: "mathematiques",
    cycle: "lycee",
    track: "mathematiques-specialite",
    niveaux: ["1ere-spe", "1ere-specialite-mathematiques"],
    officialSourceIds: ["bo-2019-mathematiques-premiere-specialite"],
    label: "Mathématiques — première spécialité — programme 2019",
    publishedOn: "2019-01-22",
    officialUrl: "https://www.education.gouv.fr/bo/19/Special1/MENE1901632A.htm",
    applicationByLevel: {
      "1ere-spe": window("2019-2020", "2025-2026"),
      "1ere-specialite-mathematiques": window("2019-2020", "2025-2026"),
    },
  },
  {
    id: "mathematiques-premiere-specialite-2026",
    discipline: "mathematiques",
    cycle: "lycee",
    track: "mathematiques-specialite",
    niveaux: ["1ere-spe", "1ere-specialite-mathematiques"],
    officialSourceIds: ["bo-2026-mathematiques-premiere-specialite"],
    label: "Mathématiques — première spécialité — programme 2026",
    publishedOn: "2026-04-02",
    officialUrl: "https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602917A",
    applicationByLevel: {
      "1ere-spe": window("2026-2027"),
      "1ere-specialite-mathematiques": window("2026-2027"),
    },
  },
  {
    id: "mathematiques-integrees-es-premiere-2022",
    discipline: "mathematiques",
    cycle: "lycee",
    track: "mathematiques-integrees-es",
    niveaux: ["1ere-ens-scientifique"],
    officialSourceIds: ["bo-2022-mathematiques-integrees-es-premiere"],
    label: "Mathématiques intégrées à l'enseignement scientifique — première — programme 2022",
    publishedOn: "2022-07-07",
    officialUrl: "https://www.education.gouv.fr/bo/22/Hebdo27/MENE2218178A.htm",
    applicationByLevel: { "1ere-ens-scientifique": window("2022-2023", "2025-2026") },
  },
  {
    id: "mathematiques-integrees-es-premiere-2026",
    discipline: "mathematiques",
    cycle: "lycee",
    track: "mathematiques-integrees-es",
    niveaux: ["1ere-ens-scientifique"],
    officialSourceIds: ["bo-2026-mathematiques-integrees-es-premiere"],
    label: "Mathématiques intégrées à l'enseignement scientifique — première — programme 2026",
    publishedOn: "2026-04-02",
    officialUrl: "https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602916A",
    applicationByLevel: { "1ere-ens-scientifique": window("2026-2027") },
  },
  {
    id: "mathematiques-terminale-specialite-2019",
    discipline: "mathematiques",
    cycle: "lycee",
    track: "mathematiques-specialite",
    niveaux: ["terminale-spe"],
    officialSourceIds: ["bo-2019-mathematiques-terminale-specialite"],
    label: "Mathématiques — terminale spécialité — programme 2019",
    publishedOn: "2019-07-25",
    officialUrl: "https://www.education.gouv.fr/bo/19/Special8/MENE1921246A.htm",
    applicationByLevel: { "terminale-spe": window("2020-2021", "2026-2027") },
  },
  {
    id: "mathematiques-terminale-specialite-2026",
    discipline: "mathematiques",
    cycle: "lycee",
    track: "mathematiques-specialite",
    niveaux: ["terminale-spe"],
    officialSourceIds: ["bo-2026-mathematiques-terminale-specialite"],
    label: "Mathématiques — terminale spécialité — programme 2026",
    publishedOn: "2026-04-02",
    officialUrl: "https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2602919A",
    applicationByLevel: { "terminale-spe": window("2027-2028") },
  },
  {
    id: "mathematiques-complementaires-2019",
    discipline: "mathematiques",
    cycle: "lycee",
    track: "mathematiques-complementaires",
    niveaux: ["terminale-complementaires"],
    officialSourceIds: ["bo-2019-mathematiques-complementaires-terminale"],
    label: "Mathématiques complémentaires — terminale — programme 2019",
    publishedOn: "2019-07-25",
    officialUrl: "https://www.education.gouv.fr/bo/19/Special8/MENE1921265A.htm",
    applicationByLevel: { "terminale-complementaires": window("2020-2021", "2026-2027") },
  },
  {
    id: "mathematiques-complementaires-2026",
    discipline: "mathematiques",
    cycle: "lycee",
    track: "mathematiques-complementaires",
    niveaux: ["terminale-complementaires"],
    officialSourceIds: ["bo-2026-mathematiques-complementaires-terminale"],
    label: "Mathématiques complémentaires — terminale — programme 2026",
    publishedOn: "2026-04-02",
    officialUrl: "https://www.education.gouv.fr/bo/2026/Hebdo14/MENE2902920A",
    applicationByLevel: { "terminale-complementaires": window("2027-2028") },
  },
  {
    id: "mathematiques-expertes-2019",
    discipline: "mathematiques",
    cycle: "lycee",
    track: "mathematiques-expertes",
    niveaux: ["terminale-expertes"],
    officialSourceIds: ["bo-2019-mathematiques-expertes-terminale"],
    label: "Mathématiques expertes — terminale — programme 2019",
    publishedOn: "2019-07-25",
    officialUrl: "https://www.education.gouv.fr/bo/19/Special8/MENE1921264A.htm",
    applicationByLevel: { "terminale-expertes": window("2020-2021") },
  },
  {
    id: "physique-chimie-seconde-2019",
    discipline: "physique-chimie",
    cycle: "lycee",
    track: "physique-chimie",
    niveaux: ["2nde"],
    officialSourceIds: ["bo-lycee-pc-seconde"],
    label: "Physique-Chimie — seconde générale et technologique — programme 2019",
    publishedOn: "2019-01-22",
    officialUrl: "https://www.education.gouv.fr/bo/19/Special1/MENE1901634A.htm",
    applicationByLevel: { "2nde": window("2019-2020") },
  },
  {
    id: "physique-chimie-premiere-specialite-2019",
    discipline: "physique-chimie",
    cycle: "lycee",
    track: "physique-chimie",
    niveaux: ["1ere-spe"],
    officialSourceIds: ["bo-lycee-pc-premiere-specialite"],
    label: "Physique-Chimie — première spécialité — programme 2019",
    publishedOn: "2019-01-22",
    officialUrl: "https://www.education.gouv.fr/bo/19/Special1/MENE1901635A.htm",
    applicationByLevel: { "1ere-spe": window("2019-2020") },
  },
  {
    id: "physique-chimie-terminale-specialite-2019",
    discipline: "physique-chimie",
    cycle: "lycee",
    track: "physique-chimie",
    niveaux: ["terminale-spe"],
    officialSourceIds: ["bo-lycee-pc-terminale-specialite"],
    label: "Physique-Chimie — terminale spécialité — programme 2019",
    publishedOn: "2019-07-25",
    officialUrl: "https://www.education.gouv.fr/bo/19/Special8/MENE1921249A.htm",
    applicationByLevel: { "terminale-spe": window("2020-2021") },
  },
  {
    id: "enseignement-scientifique-premiere-2023",
    discipline: "physique-chimie",
    cycle: "lycee",
    track: "enseignement-scientifique",
    niveaux: ["1ere-ens-scientifique"],
    officialSourceIds: ["bo-enseignement-scientifique-premiere-2023"],
    label: "Enseignement scientifique — première générale — programme 2023",
    publishedOn: "2023-06-22",
    officialUrl: "https://www.education.gouv.fr/bo/2023/Hebdo25/MENE2312806A",
    applicationByLevel: { "1ere-ens-scientifique": window("2023-2024") },
  },
  {
    id: "enseignement-scientifique-terminale-2023",
    discipline: "physique-chimie",
    cycle: "lycee",
    track: "enseignement-scientifique",
    niveaux: ["terminale-ens-scientifique"],
    officialSourceIds: ["bo-enseignement-scientifique-terminale-2023"],
    label: "Enseignement scientifique — terminale générale — programme 2023",
    publishedOn: "2023-06-22",
    officialUrl: "https://www.education.gouv.fr/bo/2023/Hebdo25/MENE2312807A",
    applicationByLevel: { "terminale-ens-scientifique": window("2024-2025") },
  },
] as const;

export function parseSchoolYear(value: string): { start: number; end: number } {
  const match = /^(\d{4})-(\d{4})$/.exec(value);
  if (!match) throw new Error(`Invalid school year: ${value}`);
  const start = Number(match[1]);
  const end = Number(match[2]);
  if (end !== start + 1) throw new Error(`School year must contain consecutive years: ${value}`);
  return { start, end };
}

export function compareSchoolYears(left: string, right: string): number {
  return parseSchoolYear(left).start - parseSchoolYear(right).start;
}

export function isSchoolYearInWindow(schoolYear: string, application: CurriculumApplicationWindow): boolean {
  parseSchoolYear(schoolYear);
  parseSchoolYear(application.appliesFrom);
  if (application.appliesUntil) parseSchoolYear(application.appliesUntil);
  if (compareSchoolYears(schoolYear, application.appliesFrom) < 0) return false;
  if (application.appliesUntil && compareSchoolYears(schoolYear, application.appliesUntil) > 0) return false;
  return true;
}

export function resolveCurriculumVersion(input: ResolveCurriculumVersionInput): ResolvedCurriculumVersion | null {
  const schoolYear = `${parseSchoolYear(input.schoolYear).start}-${parseSchoolYear(input.schoolYear).end}` as SchoolYear;
  const candidates = CURRICULUM_VERSIONS.filter((definition) => {
    if (definition.discipline !== input.discipline || definition.cycle !== input.cycle) return false;
    if (!definition.niveaux.includes(input.niveau)) return false;
    if (input.track && definition.track !== input.track) return false;
    if (input.sourceId && !definition.officialSourceIds.includes(input.sourceId)) return false;
    const application = definition.applicationByLevel[input.niveau];
    return Boolean(application && isSchoolYearInWindow(schoolYear, application));
  });

  if (candidates.length === 0) return null;
  if (candidates.length > 1) {
    throw new Error(
      `Ambiguous curriculum version for ${input.discipline}/${input.cycle}/${input.niveau}/${schoolYear}: ${candidates.map((item) => item.id).join(", ")}`,
    );
  }

  const definition = candidates[0];
  const application = definition.applicationByLevel[input.niveau];
  const officialSourceId = input.sourceId ?? definition.officialSourceIds[0];
  return {
    id: definition.id,
    discipline: definition.discipline,
    cycle: definition.cycle,
    track: definition.track,
    niveau: input.niveau,
    officialSourceId,
    label: definition.label,
    publishedOn: definition.publishedOn,
    officialUrl: definition.officialUrl,
    schoolYear,
    appliesFrom: application.appliesFrom,
    ...(application.appliesUntil ? { appliesUntil: application.appliesUntil } : {}),
  };
}

export function getCurriculumVersionById(id: string): CurriculumVersionDefinition | null {
  return CURRICULUM_VERSIONS.find((definition) => definition.id === id) ?? null;
}
