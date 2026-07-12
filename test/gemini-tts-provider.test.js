import test from "node:test";
import assert from "node:assert/strict";
import {
  buildGeminiTtsPrompt,
  buildGeminiTtsRequest,
  createGeminiTtsSegment,
  pcm16MonoToWav
} from "../src/providers/gemini-tts.js";

const climax = {
  role: "climax",
  text: "IT'S IN! THE ORIGINAL POSITION HAS WON IT!"
};

test("Gemini TTS prompt locks British accent and sincere football delivery", () => {
  const prompt = buildGeminiTtsPrompt(climax);
  assert.match(prompt, /British male football commentator/u);
  assert.match(prompt, /non-posh Northern English/u);
  assert.match(prompt, /full committed football goal shout/u);
  assert.match(prompt, /never acknowledges the joke/u);
  assert.match(prompt, /Read the transcript exactly/u);
});

test("Gemini TTS request uses the Interactions API and selected voice", () => {
  const request = buildGeminiTtsRequest({
    apiKey: "test-key",
    voice: "Fenrir",
    segment: climax
  });

  assert.equal(request.url.href, "https://generativelanguage.googleapis.com/v1beta/interactions");
  assert.equal(request.headers["x-goog-api-key"], "test-key");
  assert.equal(request.body.model, "gemini-3.1-flash-tts-preview");
  assert.deepEqual(request.body.response_format, { type: "audio" });
  assert.deepEqual(request.body.generation_config.speech_config, [{ voice: "Fenrir" }]);
});

test("PCM audio is wrapped in a playable 24 kHz mono WAV container", () => {
  const wav = pcm16MonoToWav(Uint8Array.from([0, 1, 2, 3]));
  assert.equal(wav.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(wav.subarray(8, 12).toString("ascii"), "WAVE");
  assert.equal(wav.readUInt32LE(24), 24000);
  assert.equal(wav.readUInt16LE(22), 1);
  assert.equal(wav.readUInt16LE(34), 16);
  assert.deepEqual([...wav.subarray(44)], [0, 1, 2, 3]);
});

test("Gemini TTS provider decodes output_audio data into WAV bytes", async () => {
  let received;
  const pcm = Buffer.from([4, 3, 2, 1]);
  const bytes = await createGeminiTtsSegment({
    apiKey: "test-key",
    voice: "Orus",
    segment: climax,
    fetchImpl: async (url, options) => {
      received = { url: new URL(url), options };
      return new Response(JSON.stringify({
        output_audio: { data: pcm.toString("base64") }
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  });

  assert.equal(received.options.method, "POST");
  assert.equal(received.options.headers["x-goog-api-key"], "test-key");
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
  assert.deepEqual([...bytes.subarray(44)], [4, 3, 2, 1]);
});

test("Gemini TTS provider reports API errors clearly", async () => {
  await assert.rejects(
    createGeminiTtsSegment({
      apiKey: "test-key",
      voice: "Puck",
      segment: climax,
      fetchImpl: async () => new Response(JSON.stringify({
        error: { message: "Model unavailable" }
      }), {
        status: 429,
        headers: { "Content-Type": "application/json" }
      })
    }),
    /Gemini TTS API failed \(429\): Model unavailable/u
  );
});
