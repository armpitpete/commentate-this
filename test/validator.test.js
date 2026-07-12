import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  estimateDurationSeconds,
  validateCommentaryScript
} from "../src/domain/validate-commentary-script.js";

const fixture = JSON.parse(
  await readFile(new URL("../fixtures/valid-script.json", import.meta.url), "utf8")
);

test("valid fixture passes semantic validation", () => {
  const result = validateCommentaryScript(fixture);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.ok(result.estimatedDurationSeconds > 15);
});

test("duration estimator includes speech and pauses", () => {
  const duration = estimateDurationSeconds(fixture);
  assert.ok(duration > 15 && duration < 47);
});

test("missing climax fails", () => {
  const broken = structuredClone(fixture);
  broken.segments[3].role = "aftermath";
  const result = validateCommentaryScript(broken);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.message.includes("exactly one climax")));
});

test("duplicate segment IDs fail", () => {
  const broken = structuredClone(fixture);
  broken.segments[1].id = broken.segments[0].id;
  const result = validateCommentaryScript(broken);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.message === "must be unique"));
});

test("analyst cannot interrupt before climax", () => {
  const broken = structuredClone(fixture);
  broken.segments[1].speaker = "analyst";
  const result = validateCommentaryScript(broken);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.message.includes("must not interrupt")));
});
