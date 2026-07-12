import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildOpenAICommentaryRequest,
  createOpenAICommentaryScript,
  createOpenAISpeechSegment
} from "../src/providers/openai.js";

const fixture = JSON.parse(
  await readFile(new URL("../fixtures/valid-script.json", import.meta.url), "utf8")
);

test("commentary request uses strict JSON schema and stateless storage", () => {
  const request = buildOpenAICommentaryRequest({
    text: fixture.sourceText,
    mode: fixture.mode,
    targetDurationSeconds: fixture.targetDurationSeconds
  });
  assert.equal(request.store, false);
  assert.equal(request.text.format.type, "json_schema");
  assert.equal(request.text.format.strict, true);
  assert.equal(request.text.format.schema.title, "Commentate This commentary script");
});

test("provider extracts and validates structured response output", async () => {
  const fetchImpl = async (_url, options) => {
    const request = JSON.parse(options.body);
    assert.equal(request.store, false);
    return new Response(
      JSON.stringify({
        output: [
          {
            content: [{ type: "output_text", text: JSON.stringify(fixture) }]
          }
        ]
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  };

  const result = await createOpenAICommentaryScript({
    apiKey: "test-key",
    text: fixture.sourceText,
    fetchImpl
  });
  assert.equal(result.title, fixture.title);
});

test("speech provider sends performance instructions and returns bytes", async () => {
  let received;
  const fetchImpl = async (_url, options) => {
    received = JSON.parse(options.body);
    return new Response(Uint8Array.from([82, 73, 70, 70]), { status: 200 });
  };
  const bytes = await createOpenAISpeechSegment({
    apiKey: "test-key",
    segment: fixture.segments[3],
    voice: "cedar",
    fetchImpl
  });
  assert.equal(received.model, "gpt-4o-mini-tts");
  assert.equal(received.voice, "cedar");
  assert.equal(received.response_format, "wav");
  assert.match(received.instructions, /single decisive climax/u);
  assert.deepEqual([...bytes], [82, 73, 70, 70]);
});
