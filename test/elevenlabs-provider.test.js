import test from "node:test";
import assert from "node:assert/strict";
import {
  addElevenLabsSharedVoice,
  buildElevenLabsSpeechRequest,
  createElevenLabsSpeechSegment,
  searchElevenLabsSharedVoices,
  searchElevenLabsVoices,
  selectBritishCommentatorCandidates
} from "../src/providers/elevenlabs.js";

const climax = {
  role: "climax",
  text: "IT'S IN! THE ORIGINAL POSITION HAS WON IT!"
};

test("ElevenLabs account voice search uses the v2 voices endpoint", async () => {
  let receivedUrl;
  const voices = await searchElevenLabsVoices({
    apiKey: "test-key",
    search: "Northern English",
    fetchImpl: async (url) => {
      receivedUrl = new URL(url);
      return new Response(JSON.stringify({ voices: [{ voice_id: "voice-1", name: "Test" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  });
  assert.equal(receivedUrl.pathname, "/v2/voices");
  assert.equal(voices.length, 1);
});

test("ElevenLabs shared voice search uses the Voice Library endpoint", async () => {
  let receivedUrl;
  let receivedHeaders;
  const voices = await searchElevenLabsSharedVoices({
    apiKey: "test-key",
    search: "Yorkshire",
    fetchImpl: async (url, options) => {
      receivedUrl = new URL(url);
      receivedHeaders = options.headers;
      return new Response(JSON.stringify({ voices: [{ voice_id: "shared-1", public_owner_id: "owner-1", accent: "Yorkshire" }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  });
  assert.equal(receivedUrl.pathname, "/v1/shared-voices");
  assert.equal(receivedUrl.searchParams.get("search"), "Yorkshire");
  assert.equal(receivedUrl.searchParams.get("language"), "en");
  assert.equal(receivedHeaders["xi-api-key"], "test-key");
  assert.equal(voices.length, 1);
});

test("candidate ranking reads top-level Voice Library accent metadata", () => {
  const candidates = selectBritishCommentatorCandidates([
    {
      voice_id: "posh",
      name: "Arthur",
      description: "Refined posh Received Pronunciation narrator",
      accent: "British"
    },
    {
      voice_id: "northern",
      name: "Lee",
      description: "Energetic football commentator",
      accent: "Northern English",
      category: "professional"
    },
    {
      voice_id: "american",
      name: "Sam",
      description: "American sports voice",
      accent: "American"
    }
  ], 5);
  assert.deepEqual(candidates.map((voice) => voice.voice_id), ["northern", "posh"]);
  assert.ok(candidates[0].suitabilityScore > candidates[1].suitabilityScore);
});

test("adding a shared voice uses its owner and voice IDs", async () => {
  let receivedUrl;
  let received;
  const voiceId = await addElevenLabsSharedVoice({
    apiKey: "test-key",
    publicOwnerId: "owner/one",
    voiceId: "voice/one",
    newName: "CT01 Lee",
    fetchImpl: async (url, options) => {
      receivedUrl = new URL(url);
      received = options;
      return new Response(JSON.stringify({ voice_id: "added-voice" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  });
  assert.equal(receivedUrl.pathname, "/v1/voices/add/owner%2Fone/voice%2Fone");
  assert.equal(JSON.parse(received.body).new_name, "CT01 Lee");
  assert.equal(voiceId, "added-voice");
});

test("ElevenLabs v3 request adds regional accent and expressive climax tags", async () => {
  const request = buildElevenLabsSpeechRequest({ voiceId: "voice/one", segment: climax });
  assert.equal(request.url.pathname, "/v1/text-to-speech/voice%2Fone");
  assert.equal(request.body.model_id, "eleven_v3");
  assert.match(request.body.text, /strong Northern English accent/u);
  assert.match(request.body.text, /shouting/u);

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
