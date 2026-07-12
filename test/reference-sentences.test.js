import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { referenceSentences } from "../src/proof/reference-sentences.js";

test("reference corpus contains ten distinct proof cases", async () => {
  assert.equal(referenceSentences.length, 10);
  assert.equal(new Set(referenceSentences.map((item) => item.id)).size, 10);
  const saved = JSON.parse(
    await readFile(new URL("../fixtures/reference-sentences.json", import.meta.url), "utf8")
  );
  assert.deepEqual(saved, referenceSentences);
});
