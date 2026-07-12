import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCommentaryInput,
  buildCommentaryInstructions
} from "../src/prompt/build-commentary-prompt.js";

test("prompt preserves the source event and dramatic mode", () => {
  const prompt = buildCommentaryInput({
    text: "The toast landed butter-side down.",
    mode: "cup_final",
    targetDurationSeconds: 25
  });
  assert.match(prompt, /toast landed butter-side down/u);
  assert.match(prompt, /cup_final/u);
  assert.match(prompt, /25 seconds/u);
});

test("instructions prohibit winking at the joke and named imitation", () => {
  const instructions = buildCommentaryInstructions();
  assert.match(instructions, /never explain, wink at, or acknowledge the joke/u);
  assert.match(instructions, /Do not imitate, name, quote, or describe any real commentator/u);
});

test("invalid duration is rejected", () => {
  assert.throws(
    () => buildCommentaryInput({ text: "A cup fell.", targetDurationSeconds: 5 }),
    /15 to 60/u
  );
});
