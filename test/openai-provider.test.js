import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildOpenAICommentaryRequest,
  buildSpeechInstructions,
  createOpenAICommentaryScript,
  createOpenAISpeechSegment,
  normalizeGeneratedCommentaryScript
} from "../src/providers/openai.js";

const fixture = JSON.parse(
  await readFile(new URL("../fixtures/valid-script.json", import.meta.url), "utf8")
);

function responseFor(script) {
  return new Response(
    JSON.stringify({
      output: [
        {
          content: [{ type: "output_text", text: JSON.stringify(script) }]
        }
      ]
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

test("commentary request uses strict JSON schema and stateless storage", () => {
  const request = buildOpenAICommentaryRequest({
    text: fixture.sourceText,
    mode: fixture.mode,
    targetDurationSeconds: fixture.targetDurationSeconds
  });
  assert.equal(request.store, false);
  assert.equal(request.text.format.type, "json_schema");
  assert.equal(request.text.format.strict, true);
  assert.equal(request.text.format.schema.$schema, undefined);
  assert.equal(request.text.format.schema.title, undefined);
  assert.equal(request.text.format.schema.type, "object");
});

test("generated climax timing and performance metadata are repaired deterministically", () => {
  const generated = structuredClone(fixture);
  generated.sourceText = "Model paraphrase that must not replace the source";
  generated.segments[3].delivery.intensity = 4;
  generated.segments[3].delivery.pace = "fast";
  generated.segments[3].delivery.volume = "loud";
  generated.segments[3].delivery.pauseBeforeMs = 0;

  const normalized = normalizeGeneratedCommentaryScript(generated, {
    text: fixture.sourceText,
    mode: fixture.mode,
    targetDurationSeconds: fixture.targetDurationSeconds
  });

  assert.equal(normalized.sourceText, fixture.sourceText);
  assert.equal(normalized.segments[3].delivery.intensity, 5);
  assert.equal(normalized.segments[3].delivery.pace, "shout");
  assert.equal(normalized.segments[3].delivery.volume, "full");
  assert.equal(normalized.segments[3].delivery.pauseBeforeMs, 500);
  assert.equal(generated.segments[3].delivery.pauseBeforeMs, 0);
});

test("provider extracts and validates structured response output", async () => {
  const fetchImpl = async (_url, options) => {
    const request = JSON.parse(options.body);
    assert.equal(request.store, false);
    return responseFor(fixture);
  };

  const result = await createOpenAICommentaryScript({
    apiKey: "test-key",
    text: fixture.sourceText,
    fetchImpl
  });
  assert.equal(result.title, fixture.title);
});

test("provider repairs a missing pre-climax pause without another API call", async () => {
  const generated = structuredClone(fixture);
  generated.segments[3].delivery.pauseBeforeMs = 0;
  let calls = 0;

  const result = await createOpenAICommentaryScript({
    apiKey: "test-key",
    text: fixture.sourceText,
    fetchImpl: async () => {
      calls += 1;
      return responseFor(generated);
    }
  });

  assert.equal(calls, 1);
  assert.equal(result.segments[3].delivery.pauseBeforeMs, 500);
});

test("provider retries once with semantic validation feedback", async () => {
  const invalid = structuredClone(fixture);
  invalid.segments[0].delivery.intensity = 1;
  invalid.segments[1].delivery.intensity = 1;
  invalid.segments[2].delivery.intensity = 1;
  const requests = [];

  const result = await createOpenAICommentaryScript({
    apiKey: "test-key",
    text: fixture.sourceText,
    fetchImpl: async (_url, options) => {
      requests.push(JSON.parse(options.body));
      return responseFor(requests.length === 1 ? invalid : fixture);
    }
  });

  assert.equal(requests.length, 2);
  assert.match(requests[1].input, /must increase tension before the climax/u);
  assert.equal(result.title, fixture.title);
});

test("speech instructions explicitly require British accent and emotional contrast", () => {
  const setup = buildSpeechInstructions(fixture.segments[0]);
  const climax = buildSpeechInstructions(fixture.segments[3]);

  assert.match(setup, /native British English/u);
  assert.match(setup, /Do not use a North American accent/u);
  assert.match(setup, /not an audiobook, advert, documentary voice-over or synthetic assistant/u);
  assert.match(setup, /Do not read neutrally/u);
  assert.match(climax, /last-minute winner/u);
  assert.match(climax, /unmistakably emotional/u);
  assert.match(climax, /authentic loss of composure/u);
  assert.notEqual(setup, climax);
});

test("speech provider sends British performance instructions and returns bytes", async () => {
  let received;
  const fetchImpl = async (_url, options) => {
    received = JSON.parse(options.body);
    return new Response(Uint8Array.from([82, 73, 70, 70]), { status: 200 });
  };
  const bytes = await createOpenAISpeechSegment({
    apiKey: "test-key",
    segment: fixture.segments[3],
    voice: "fable",
    fetchImpl
  });
  assert.equal(received.model, "gpt-4o-mini-tts");
  assert.equal(received.voice, "fable");
  assert.equal(received.response_format, "wav");
  assert.match(received.instructions, /native British English/u);
  assert.match(received.instructions, /single decisive climax/u);
  assert.deepEqual([...bytes], [82, 73, 70, 70]);
});
