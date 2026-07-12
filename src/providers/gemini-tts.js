const DEFAULT_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const DEFAULT_MODEL = "gemini-3.1-flash-tts-preview";
const SAMPLE_RATE = 24000;

const ROLE_DIRECTION = {
  set_up: [
    "restrained and observant",
    "ordinary live British football commentary",
    "steady pace",
    "low but engaged energy",
    "no theatrical narration"
  ].join(", "),
  escalation: [
    "urgent and increasingly breathless",
    "faster pace",
    "genuine pressure",
    "clear rising excitement",
    "still intelligible"
  ].join(", "),
  climax: [
    "a full committed football goal shout",
    "explosive and triumphant",
    "loud without distortion",
    "hold the opening exclamation briefly",
    "do not sound amused by the joke"
  ].join(", ")
};

function requireText(value, name) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${name} is required`);
  }
  return value.trim();
}

export function buildGeminiTtsPrompt(segment) {
  const role = segment?.role ?? "set_up";
  const text = requireText(segment?.text, "segment.text");
  const direction = ROLE_DIRECTION[role] ?? ROLE_DIRECTION.set_up;

  return [
    "Audio profile:",
    "A British male football commentator in his forties with an ordinary, non-posh Northern English or neutral everyday English accent.",
    "He sounds like a live UK football broadcast, not an audiobook, advertisement, American sports broadcast or comic impersonation.",
    "The event is ridiculous, but he performs it with complete sincerity and never acknowledges the joke.",
    "",
    "Scene:",
    "Live football-style commentary over a tiny domestic event. The listener must believe the stakes are enormous.",
    "",
    "Director's notes:",
    direction,
    "Use natural British rhythm and pronunciation. Avoid Received Pronunciation, aristocratic polish and American vowels.",
    "Read the transcript exactly. Do not add words, laughter, explanations or sound effects.",
    "",
    "Transcript:",
    text
  ].join("\n");
}

export function buildGeminiTtsRequest({
  apiKey,
  voice,
  segment,
  model = DEFAULT_MODEL,
  endpoint = DEFAULT_ENDPOINT
}) {
  const key = requireText(apiKey, "apiKey");
  const voiceName = requireText(voice, "voice");
  const modelName = requireText(model, "model");

  return {
    url: new URL(endpoint),
    headers: {
      "x-goog-api-key": key,
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: {
      model: modelName,
      input: buildGeminiTtsPrompt(segment),
      response_format: { type: "audio" },
      generation_config: {
        speech_config: [{ voice: voiceName }]
      }
    }
  };
}

export function pcm16MonoToWav(pcm, sampleRate = SAMPLE_RATE) {
  const bytes = Buffer.isBuffer(pcm) ? pcm : Buffer.from(pcm);
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * 2;

  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + bytes.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(bytes.length, 40);

  return Buffer.concat([header, bytes]);
}

function findAudioData(payload) {
  return payload?.output_audio?.data
    ?? payload?.outputAudio?.data
    ?? payload?.interaction?.output_audio?.data
    ?? payload?.interaction?.outputAudio?.data
    ?? null;
}

async function readError(response) {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    return parsed?.error?.message ?? parsed?.message ?? text;
  } catch {
    return text || response.statusText || "Unknown Gemini TTS error";
  }
}

export async function createGeminiTtsSegment({
  apiKey,
  voice,
  segment,
  model = DEFAULT_MODEL,
  endpoint = DEFAULT_ENDPOINT,
  fetchImpl = globalThis.fetch
}) {
  const request = buildGeminiTtsRequest({ apiKey, voice, segment, model, endpoint });
  const response = await fetchImpl(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify(request.body)
  });

  if (!response.ok) {
    throw new Error(`Gemini TTS API failed (${response.status}): ${await readError(response)}`);
  }

  const payload = await response.json();
  const audioData = findAudioData(payload);
  if (typeof audioData !== "string" || audioData.length === 0) {
    throw new Error("Gemini TTS response did not contain output_audio.data");
  }

  return pcm16MonoToWav(Buffer.from(audioData, "base64"));
}
