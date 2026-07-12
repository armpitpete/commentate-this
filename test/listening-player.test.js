import test from "node:test";
import assert from "node:assert/strict";
import { buildListeningPlayer, buildProofSetIndex } from "../src/proof/build-listening-player.js";

test("listening player embeds ordered files, pauses and disclosure", () => {
  const html = buildListeningPlayer({
    title: "USB <Final>",
    sourceText: "A cable & a port",
    disclosure: "AI-generated voice; not a human commentator.",
    segments: [
      {
        filename: "01-s01-commentator.wav",
        speaker: "commentator",
        role: "set_up",
        text: "He approaches.",
        pauseBeforeMs: 0,
        pauseAfterMs: 250
      },
      {
        filename: "02-s02-commentator.wav",
        speaker: "commentator",
        role: "climax",
        text: "IT IS IN!",
        pauseBeforeMs: 700,
        pauseAfterMs: 1200
      }
    ]
  });

  assert.match(html, /Play complete commentary/u);
  assert.match(html, /01-s01-commentator\.wav/u);
  assert.match(html, /"pauseBeforeMs":700/u);
  assert.match(html, /AI-generated voice/u);
  assert.match(html, /USB &lt;Final&gt;/u);
  assert.doesNotMatch(html, /<Final>/u);
});

test("proof-set index links every case to its local player", () => {
  const html = buildProofSetIndex({
    title: "Proof set",
    disclosure: "AI-generated voice.",
    cases: [
      { id: "usb-cable", text: "USB cable" },
      { id: "biscuit-tea", text: "Biscuit in tea" }
    ]
  });

  assert.match(html, /usb-cable\/listen\.html/u);
  assert.match(html, /biscuit-tea\/listen\.html/u);
  assert.match(html, /listening-results\.csv/u);
});
