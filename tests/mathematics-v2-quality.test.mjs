import test from "node:test";
import assert from "node:assert/strict";

import { auditMathsV2 } from "../scripts/audit-maths-v2.mjs";

test("Maths V2 tracks the complete published mathematics corpus", () => {
  const audit = auditMathsV2();
  assert.equal(audit.summary.total, 86);
});

test("every chapter explicitly migrated to Maths V2 satisfies the V2 editorial contract", () => {
  const audit = auditMathsV2();
  const invalid = audit.rows
    .filter((row) => row.qualityVersion === 2 && row.errors.length > 0)
    .map((row) => row.relative + " :: " + row.errors.join(" | "));

  assert.deepEqual(invalid, []);
});
