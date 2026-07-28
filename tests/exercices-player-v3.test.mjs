import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ExercicesPlayer from "../src/components/pedagogie/ExercicesPlayer.tsx";

const root = process.cwd();
const playerSource = readFileSync(path.join(root, "src/components/pedagogie/ExercicesPlayer.tsx"), "utf8");

describe("exercices player V3", () => {
  it("keeps corrections hidden before the learner answers", () => {
    const html = renderToStaticMarkup(React.createElement(ExercicesPlayer, {
      data: [
        {
          id: "txt-1",
          title: "Argumenter",
          consigne: "Explique pourquoi la lampe brille.",
          answerType: "text",
          correction: ["CORRECTION_SECRETE : la boucle est fermee."],
        },
      ],
    }));

    assert.match(html, /data-exercices-player-v3/);
    assert.match(html, /Explique pourquoi la lampe brille/);
    assert.match(html, /Voir la correction/);
    assert.doesNotMatch(html, /CORRECTION_SECRETE/);
  });

  it("renders QCM, numeric and text answer modes from current or V3-shaped data", () => {
    const qcmHtml = renderToStaticMarkup(React.createElement(ExercicesPlayer, {
      data: {
        exercices: [
          {
            id: "qcm-1",
            title: "Choisir",
            consigne: "Quel montage laisse passer le courant ?",
            answerType: "qcm",
            choices: ["Circuit ferme", "Circuit ouvert"],
            correctionEssentielle: "Le circuit ferme laisse passer le courant.",
          },
        ],
      },
    }));
    const numericHtml = renderToStaticMarkup(React.createElement(ExercicesPlayer, {
      data: {
        exercices: [
          {
            id: "num-1",
            title: "Calculer",
            statement: "Calculer $3\\times5-2$.",
            answerType: "number",
            hints: { clue: "Remplace x par 5.", method: "Effectue la multiplication avant la soustraction." },
            correction: ["$3\\times5-2=13$."],
          },
        ],
      },
    }));
    const textHtml = renderToStaticMarkup(React.createElement(ExercicesPlayer, {
      data: {
        exercices: [
          {
            id: "text-1",
            title: "Rediger",
            consigne: "Justifie avec une phrase.",
            answerType: "text",
            aides: { indice: "Repere la grandeur demandee." },
            correction: ["La justification cite la grandeur et son unite."],
          },
        ],
      },
    }));

    assert.match(qcmHtml, /Circuit ferme/);
    assert.match(qcmHtml, /Circuit ouvert/);
    assert.match(numericHtml, /Reponse numerique/);
    assert.match(textHtml, /Justifie avec une phrase/);
  });

  it("renders accessible sanitized SVG schemas without user HTML blocks", () => {
    const html = renderToStaticMarkup(React.createElement(ExercicesPlayer, {
      data: [
        {
          id: "schema-1",
          title: "Observer un schema",
          consigne: "Observe le document.",
          correction: ["Le schema montre une boucle fermee."],
          schemaSvg: '<svg viewBox="0 0 20 20" onload="alert(1)"><title>Circuit</title><circle cx="10" cy="10" r="5" /></svg>',
          schemaAlt: "Circuit simple avec une boucle fermee.",
          blocks: [
            {
              id: "diagramme",
              type: "diagram",
              title: "Document 2",
              svg: '<svg viewBox="0 0 20 20"><rect x="2" y="2" width="10" height="10" /></svg>',
              accessibility: { altText: "Carre representant un document de travail." },
            },
          ],
        },
      ],
    }));

    assert.match(html, /Circuit simple avec une boucle fermee/);
    assert.match(html, /Carre representant un document de travail/);
    assert.doesNotMatch(html, /onload/);
    assert.doesNotMatch(html, /alert\(1\)/);
  });

  it("contains the V3 correction and migration safeguards in source", () => {
    assert.match(playerSource, /correctionEssentielle/);
    assert.match(playerSource, /Correction detaillee/);
    assert.match(playerSource, /data-exercices-player-v3/);
    assert.match(playerSource, /data\?\.exercices \?\? data\?\.exercises/);
    assert.match(playerSource, /sanitizeTrustedSvg/);
  });
});
