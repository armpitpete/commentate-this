import test from "node:test";
import assert from "node:assert/strict";
import {
  buildAzureSpeechRequest,
  buildAzureSsml,
  createAzureSpeechSegment,
  escapeAzureSsml
} from "../src/providers/azure.js";

const climax = {
  role: "climax",
  text: "IT'S IN & IT COUNTS!"
};

test("Azure SSML escapes text and applies Ryan expressive style", () => {
  const ssml = buildAzureSsml({ voice: "en-GB-RyanNeural", segment: climax });
  assert.match(ssml, /xml:lang="en-GB"/u);
  assert.match(ssml, /name="en-GB-RyanNeural"/u);
  assert.match(ssml, /mstts:express-as style="cheerful" styledegree="2.0"/u);
  assert.match(ssml, /IT&apos;S IN &amp; IT COUNTS!/u);
  assert.match(ssml, /volume="\+35%"/u);
});

test("Azure SSML uses prosody without unsupported style for other voices", () => {
  const ssml = buildAzureSsml({
    voice: "en-GB-OliverNeural",
    segment: { role: "escalation", text: "Pressure building" }
  });
  assert.doesNotMatch(ssml, /mstts:express-as/u);
  assert.match(ssml, /rate="\+16%"/u);
  assert.match(ssml, /pitch="\+3%"/u);
});

test("Azure request targets the regional TTS endpoint with required headers", () => {
  const request = buildAzureSpeechRequest({
    apiKey: "test-key",
    region: "uksouth",
    voice: "en-GB-ThomasNeural",
    segment: climax
  });
  assert.equal(request.url.href, "https://uksouth.tts.speech.microsoft.com/cognitiveservices/v1");
  assert.equal(request.headers["Ocp-Apim-Subscription-Key"], "test-key");
  assert.equal(request.headers["Content-Type"], "application/ssml+xml");
  assert.equal(request.headers["X-Microsoft-OutputFormat"], "audio-24khz-96kbitrate-mono-mp3");
});

test("Azure speech provider returns audio bytes", async () => {
  let received;
  const bytes = await createAzureSpeechSegment({
    apiKey: "test-key",
    region: "uksouth",
    voice: "en-GB-AlfieNeural",
    segment: climax,
    fetchImpl: async (url, options) => {
      received = { url: new URL(url), options };
      return new Response(Uint8Array.from([73, 68, 51]), { status: 200 });
    }
  });
  assert.equal(received.options.method, "POST");
  assert.match(received.options.body, /en-GB-AlfieNeural/u);
  assert.deepEqual([...bytes], [73, 68, 51]);
});

test("Azure SSML escaping covers XML metacharacters", () => {
  assert.equal(escapeAzureSsml(`<tag a="b">Tom's & Jerry</tag>`), "&lt;tag a=&quot;b&quot;&gt;Tom&apos;s &amp; Jerry&lt;/tag&gt;");
});
