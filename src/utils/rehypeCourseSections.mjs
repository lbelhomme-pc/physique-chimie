function getText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  if (!Array.isArray(node.children)) return "";
  return node.children.map(getText).join("");
}

function normalizeTitle(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function headingRank(node) {
  if (node?.type !== "element") return null;
  const match = /^h([1-6])$/.exec(node.tagName ?? "");
  return match ? Number(match[1]) : null;
}

function isBlankText(node) {
  return node?.type === "text" && !String(node.value ?? "").trim();
}

function sectionKind(node) {
  const rank = headingRank(node);
  if (rank !== 2 && rank !== 3) return null;
  const title = normalizeTitle(getText(node));

  if (title === "objectifs" || title === "objectifs du cours" || title === "objectifs du chapitre") {
    return "objectives";
  }

  if (title === "a retenir" || title === "points cles") {
    return "summary";
  }

  if (title === "cours" || title === "le cours") {
    return "course";
  }

  return null;
}

function hiddenSectionKind(node) {
  const rank = headingRank(node);
  if (rank !== 2 && rank !== 3) return null;
  const title = normalizeTitle(getText(node));

  if (
    title === "prerequis" ||
    title === "pre-requis" ||
    title === "problematique" ||
    title.startsWith("activite") ||
    title.startsWith("situation") ||
    title.startsWith("decouverte")
  ) {
    return "hidden";
  }

  return null;
}

function hasClass(node, className) {
  const current = node?.properties?.className;
  const classes = Array.isArray(current)
    ? current
    : typeof current === "string"
      ? current.split(/\s+/).filter(Boolean)
      : [];

  return classes.includes(className);
}

function isStandaloneHiddenBlock(node) {
  if (node?.type !== "element") return false;
  return (
    hasClass(node, "activite-box") ||
    hasClass(node, "activity-box") ||
    hasClass(node, "discovery-box") ||
    hasClass(node, "prerequis-box") ||
    hasClass(node, "problem-box")
  );
}

function addClass(node, className) {
  node.properties ??= {};
  const current = node.properties.className;
  const classes = Array.isArray(current)
    ? current
    : typeof current === "string"
      ? current.split(/\s+/).filter(Boolean)
      : [];

  if (!classes.includes(className)) classes.push(className);
  node.properties.className = classes;
}

function setHeadingText(node, value) {
  node.children = [{ type: "text", value }];
}

function createCourseHeading() {
  return {
    type: "element",
    tagName: "h2",
    properties: {
      id: "cours",
      className: ["course-main-heading"],
      "data-course-section": "course",
    },
    children: [{ type: "text", value: "Cours" }],
  };
}

function isSignificantCourseNode(node) {
  if (!node || isBlankText(node)) return false;
  const kind = sectionKind(node);
  if (kind === "objectives" || kind === "summary") return false;
  if (hiddenSectionKind(node) || isStandaloneHiddenBlock(node)) return false;
  return true;
}

function addCourseHeadingIfNeeded(children) {
  const courseHeadingIndex = children.findIndex((child) => sectionKind(child) === "course");
  if (courseHeadingIndex >= 0) {
    const heading = children[courseHeadingIndex];
    addClass(heading, "course-main-heading");
    heading.properties ??= {};
    heading.properties["data-course-section"] = "course";
    setHeadingText(heading, "Cours");
    return children;
  }

  const firstSummaryIndex = children.findIndex((child) => {
    if (child?.properties?.["data-course-section"] === "summary") return true;
    return sectionKind(child) === "summary";
  });

  let insertIndex = -1;
  for (let index = 0; index < children.length; index += 1) {
    if (firstSummaryIndex >= 0 && index >= firstSummaryIndex) break;
    const child = children[index];
    if (!isSignificantCourseNode(child)) continue;
    if (child?.properties?.["data-course-section"] === "objectives") continue;
    insertIndex = index;
    break;
  }

  if (insertIndex >= 0) {
    children.splice(insertIndex, 0, createCourseHeading());
  }

  return children;
}

function transformChildren(parent, options = {}) {
  if (!Array.isArray(parent.children)) return;

  const nextChildren = [];

  for (let index = 0; index < parent.children.length;) {
    const child = parent.children[index];
    const kind = sectionKind(child);
    const hiddenKind = hiddenSectionKind(child);

    if (isStandaloneHiddenBlock(child)) {
      index += 1;
      continue;
    }

    if (hiddenKind) {
      const rank = headingRank(child) ?? 2;
      index += 1;

      while (index < parent.children.length) {
        const candidate = parent.children[index];
        const candidateRank = headingRank(candidate);
        if (candidateRank !== null && candidateRank <= rank) break;
        index += 1;
      }

      continue;
    }

    if (!kind) {
      transformChildren(child);
      nextChildren.push(child);
      index += 1;
      continue;
    }

    if (kind === "course") {
      addClass(child, "course-main-heading");
      child.properties ??= {};
      child.properties["data-course-section"] = "course";
      setHeadingText(child, "Cours");
      nextChildren.push(child);
      index += 1;
      continue;
    }

    const rank = headingRank(child) ?? 2;
    addClass(child, "course-special-heading");
    addClass(child, kind === "objectives" ? "course-objectives-heading" : "course-summary-heading");
    child.properties ??= {};
    child.properties["data-course-section"] = kind;
    setHeadingText(child, kind === "objectives" ? "Objectifs" : "À retenir");

    const sectionChildren = [child];
    index += 1;

    while (index < parent.children.length) {
      const candidate = parent.children[index];
      const candidateRank = headingRank(candidate);
      if (candidateRank !== null && candidateRank <= rank) break;
      sectionChildren.push(candidate);
      index += 1;
    }

    nextChildren.push({
      type: "element",
      tagName: "section",
      properties: {
        className: [
          "course-special-card",
          kind === "objectives" ? "course-objectives-card" : "course-summary-card",
        ],
        "data-course-section": kind,
      },
      children: sectionChildren,
    });
  }

  parent.children = options.injectCourseHeading ? addCourseHeadingIfNeeded(nextChildren) : nextChildren;
}

export default function rehypeCourseSections() {
  return (tree) => {
    transformChildren(tree, { injectCourseHeading: true });
  };
}
