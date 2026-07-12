import test from "node:test";
import assert from "node:assert/strict";
import {
  addElevenLabsSharedVoice,
  buildElevenLabsSpeechRequest,
  buildElevenLabsVoiceDesignRequest,
  createElevenLabsDesignedVoice,
  createElevenLabsSpeechSegment,
  designElevenLabsVoicePreviews,
  isElevenLabsSharedVoiceFree,
  searchElevenLabsSharedVoices,
  searchElevenLabsVoices,
  selectBritishCommentatorCandidates
} from "../src/providers/elevenlabs.js";

const climax = {
  role: "climax",
  text: "IT'S IN! THE ORIGINAL POSITION HAS WON IT!"
};

const designDescription = "An ordinary Northern English male football commentator with broad emotional range and no posh or American cadence.";
const designText = "The cable approaches the socket with time to spare. It will not go, the pressure is building, and now one final attempt—IT'S IN! The original position has won it at the third attempt.";

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

test("shared voice free-plan availability reads top-level or sharing metadata", () => {
  assert.equal(isElevenLabsSharedVoiceFree({ free_users_allowed: true }), true);
  assert.equal(isElevenLabsSharedVoiceFree({ sharing: { free_users_allowed: true } }), true);
  assert.equal(isElevenLabsSharedVoiceFree({ free_users_allowed: false }), false);
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

test("voice design request targets text-to-voice v3 with bounded controls", () => {
  const request = buildElevenLabsVoiceDesignRequest({
    voiceDescription: designDescription,
    text: designText
  });
  assert.equal(request.url, "https://api.elevenlabs.io/v1/text-to-voice/design");
  assert.equal(request.body.model_id, "eleven_ttv_v3");
  assert.equal(request.body.seed, 1964);
  assert.equal(request.body.auto_generate_text, false);
});

test("voice design returns preview candidates", async () => {
  let received;
  const result = await designElevenLabsVoicePreviews({
    apiKey: "test-key",
    voiceDescription: designDescription,
    text: designText,
    fetchImpl: async (_url, options) => {
      received = JSON.parse(options.body);
      return new Response(JSON.stringify({
        text: designText,
        previews: [{
          audio_base_64: "SUQz",
          generated_voice_id: "generated-1",
          media_type: "audio/mpeg",
          duration_secs: 5,
          language: "en"
        }]
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  });
  assert.equal(received.voice_description, designDescription);
  assert.equal(result.previews[0].generated_voice_id, "generated-1");
});

test("selected designed preview can be created as an account voice", async () => {
  let receivedUrl;
  let receivedBody;
  const voice = await createElevenLabsDesignedVoice({
    apiKey: "test-key",
    generatedVoiceId: "generated-1",
    name: "CT01 Northern Commentator",
    description: designDescription,
    fetchImpl: async (url, options) => {
      receivedUrl = new URL(url);
      receivedBody = JSON.parse(options.body);
      return new Response(JSON.stringify({
        voice_id: "designed-voice-1",
        name: "CT01 Northern Commentator",
        category: "generated"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  });
  assert.equal(receivedUrl.pathname, "/v1/text-to-voice");
  assert.equal(receivedBody.generated_voice_id, "generated-1");
  assert.equal(voice.voice_id, "designed-voice-1");
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
