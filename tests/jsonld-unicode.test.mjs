import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { absoluteSiteUrl, buildPageJsonLd } from "../src/config/site.ts";

const root = process.cwd();
const siteSource = fs.readFileSync(path.join(root, "src/config/site.ts"), "utf8");
const mojibakePattern = /(?:Ã|Â|�)/u;

function graphNode(jsonLd, type) {
  return jsonLd["@graph"].find((node) => node["@type"] === type);
}

test("C13 keeps French JSON-LD labels as exact UTF-8 strings", () => {
  const canonicalUrl = absoluteSiteUrl("/mathematiques/college/4eme/calcul-litteral");
  const title = "Énergie, géométrie et évolutions";
  const description = "Réviser les propriétés, méthodes et unités sans perdre les accents français.";

  const jsonLd = buildPageJsonLd({
    title,
    description,
    canonicalUrl,
    schemaType: "Course",
    subject: "mathematiques",
    cycle: "college",
    level: "4eme",
    resourceType: "chapter",
  });

  const course = graphNode(jsonLd, "Course");
  const webpage = graphNode(jsonLd, "WebPage");

  assert.equal(course.about.name, "Mathématiques");
  assert.equal(course.educationalLevel, "Collège - 4eme");
  assert.equal(course.name, title);
  assert.equal(course.description, description);
  assert.equal(webpage.name, title);
  assert.equal(webpage.description, description);
});

test("C13 keeps lycée and fallback educational levels exact", () => {
  const lyceeJsonLd = buildPageJsonLd({
    title: "Ondes et signaux",
    description: "Révision de physique-chimie au lycée.",
    canonicalUrl: absoluteSiteUrl("/physique-chimie/lycee/terminale-spe/physique/ondes"),
    schemaType: "Course",
    subject: "physique-chimie",
    cycle: "lycee",
    level: "terminale-spe",
    resourceType: "chapter",
  });
  const fallbackJsonLd = buildPageJsonLd({
    title: "Ressource scientifique",
    description: "Ressource du collège au lycée.",
    canonicalUrl: absoluteSiteUrl("/ressource-scientifique"),
    schemaType: "Course",
    subject: "enseignement-scientifique",
  });

  assert.equal(graphNode(lyceeJsonLd, "Course").educationalLevel, "Lycée - terminale spe");
  assert.equal(graphNode(fallbackJsonLd, "Course").educationalLevel, "Collège / Lycée");
  assert.equal(graphNode(fallbackJsonLd, "Course").about.name, "Enseignement scientifique");
});

test("C13 serialized JSON-LD contains accents and no mojibake markers", () => {
  const jsonLd = buildPageJsonLd({
    title: "Électricité et énergie",
    description: "Méthode détaillée pour réviser au collège et au lycée.",
    canonicalUrl: absoluteSiteUrl("/physique-chimie/college/3eme/physique/electricite"),
    schemaType: "Course",
    subject: "mathematiques",
    cycle: "college",
    level: "3eme",
    resourceType: "chapter",
  });

  const serialized = JSON.stringify(jsonLd);

  assert.match(serialized, /Mathématiques/u);
  assert.match(serialized, /Collège/u);
  assert.match(serialized, /Électricité/u);
  assert.match(serialized, /énergie/u);
  assert.doesNotMatch(serialized, mojibakePattern);
  assert.doesNotMatch(siteSource, mojibakePattern);
});
