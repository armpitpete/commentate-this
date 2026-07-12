import test from "node:test";
import assert from "node:assert/strict";
import {
  buildElevenLabsSpeechRequest,
  createElevenLabsSpeechSegment,
  searchElevenLabsVoices,
  selectBritishCommentatorCandidates
} from "../src/providers/elevenlabs.js";

const climax = {
  role: "climax",
  text: "IT'S IN! THE ORIGINAL POSITION HAS WON IT!"
};

test("ElevenLabs voice search uses the v2 voices endpoint and API-key header", async () => {
  let receivedUrl;
  let receivedHeaders;
  const voices = await searchElevenLabsVoices({
    apiKey: "test-key",
    search: "Northern English",
    fetchImpl: async (url, options) => {
      receivedUrl = new URL(url);
      receivedHeaders = options.headers;
      return new Response(JSON.stringify({ voices: [{ voice_id: "voice-1", name: "Test" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  });

  assert.equal(receivedUrl.origin + receivedUrl.pathname, "https://api.elevenlabs.io/v2/voices");
  assert.equal(receivedUrl.searchParams.get("search"), "Northern English");
  assert.equal(receivedUrl.searchParams.get("page_size"), "100");
  assert.equal(receivedHeaders["xi-api-key"], "test-key");
  assert.equal(voices.length, 1);
});

test("candidate ranking prefers regional sports voices and penalises posh RP voices", () => {
  const candidates = selectBritishCommentatorCandidates([
    {
      voice_id: "posh",
      name: "Arthur",
      description: "Refined posh Received Pronunciation narrator",
      labels: { accent: "British" }
    },
    {
      voice_id: "northern",
      name: "Lee",
      description: "Energetic Yorkshire football commentator",
      labels: { accent: "Northern English" },
      category: "professional",
      recording_quality: "studio"
    },
    {
      voice_id: "american",
      name: "Sam",
      description: "American sports voice",
      labels: { accent: "American" }
    }
  ], 5);

  assert.deepEqual(candidates.map((voice) => voice.voice_id), ["northern", "posh"]);
  assert.ok(candidates[0].suitabilityScore > candidates[1].suitabilityScore);
});

test("ElevenLabs v3 request adds regional accent and expressive climax tags", async () => {
  const request = buildElevenLabsSpeechRequest({ voiceId: "voice/one", segment: climax });
  assert.equal(request.url.pathname, "/v1/text-to-speech/voice%2Fone");
  assert.equal(request.url.searchParams.get("output_format"), "mp3_44100_128");
  assert.equal(request.body.model_id, "eleven_v3");
  assert.match(request.body.text, /strong Northern English accent/u);
  assert.match(request.body.text, /shouting/u);
  assert.equal(request.body.voice_settings.stability, 0.35);

  let received;
  const bytes = await createElevenLabsSpeechSegment({
    apiKey: "test-key",
    voiceId: "voice-one",
    segment: climax,
    fetchImpl: async (_url, options) => {
      received = options;
      return new Response(Uint8Array.from([73, 68, 51]), { status: 200 });
    }
  });
  assert.equal(received.headers["xi-api-key"], "test-key");
  assert.deepEqual([...bytes], [73, 68, 51]);
});
