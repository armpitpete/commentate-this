import { commentaryScriptSchema } from "../domain/commentary-schema.js";
import { assertValidCommentaryScript } from "../domain/validate-commentary-script.js";
import {
  buildCommentaryInput,
  buildCommentaryInstructions
} from "../prompt/build-commentary-prompt.js";

const RESPONSES_URL = "https://api.openai.com/v1/responses";
const SPEECH_URL = "https://api.openai.com/v1/audio/speech";

function requireApiKey(apiKey) {
  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    throw new Error("OPENAI_API_KEY is required for live proof generation");
  }
}

async function readError(response) {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    return parsed?.error?.message ?? text;
  } catch {
    return text;
  }
}

function extractOutputText(payload) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }
  throw new Error("OpenAI response did not contain output text");
}

function buildStructuredOutputSchema() {
  const { $schema: _draft, title: _title, ...apiSchema } = commentaryScriptSchema;
  return apiSchema;
}

export function buildOpenAICommentaryRequest({
  text,
  mode = "excessive",
  targetDurationSeconds = 30,
  model = "gpt-5.6"
}) {
  return {
    model,
    store: false,
    instructions: buildCommentaryInstructions(),
    input: buildCommentaryInput({ text, mode, targetDurationSeconds }),
    text: {
      format: {
        type: "json_schema",
        name: "commentary_script",
        strict: true,
        schema: buildStructuredOutputSchema()
      }
    }
  };
}

export async function createOpenAICommentaryScript({
  apiKey,
  text,
  mode = "excessive",
  targetDurationSeconds = 30,
  model = "gpt-5.6",
  fetchImpl = globalThis.fetch
}) {
  requireApiKey(apiKey);
  const body = buildOpenAICommentaryRequest({ text, mode, targetDurationSeconds, model });
  const response = await fetchImpl(RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`OpenAI Responses API failed (${response.status}): ${await readError(response)}`);
  }

  const payload = await response.json();
  const textOutput = extractOutputText(payload);
  let script;
  try {
    script = JSON.parse(textOutput);
  } catch (error) {
    throw new Error(`OpenAI returned non-JSON output: ${error.message}`);
  }
  return assertValidCommentaryScript(script);
}

export function buildSpeechInstructions(segment) {
  const delivery = segment.delivery;
  const speaker = segment.speaker === "analyst" ? "co-commentator analyst" : "live football commentator";
  const paceNotes = {
    calm: "Use controlled, spacious broadcast pacing.",
    measured: "Use steady professional broadcast pacing.",
    building: "Increase pace and tension through the line.",
    fast: "Speak quickly and urgently while remaining clear.",
    breathless: "Sound breathless and under severe match pressure, but keep every word intelligible.",
    shout: "Deliver one committed, sustained goal-style shout without distortion or laughter."
  };
  const volumeNotes = {
    quiet: "Keep the voice restrained.",
    normal: "Use normal broadcast volume.",
    loud: "Project strongly.",
    full: "Use full emotional volume, avoiding digital clipping."
  };

  return [
    `Perform as a British ${speaker}.`,
    "Treat the event as genuinely important. Never sound amused and never wink at the joke.",
    paceNotes[delivery.pace],
    volumeNotes[delivery.volume],
    `Emotional direction: ${delivery.emotion.replaceAll("_", " ")}.`,
    segment.role === "climax"
      ? "This is the single decisive climax. Commit fully to it."
      : "Do not turn this line into the main climax."
  ].join(" ");
}

export async function createOpenAISpeechSegment({
  apiKey,
  segment,
  voice,
  model = "gpt-4o-mini-tts",
  fetchImpl = globalThis.fetch
}) {
  requireApiKey(apiKey);
  const response = await fetchImpl(SPEECH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      voice,
      input: segment.text,
      instructions: buildSpeechInstructions(segment),
      response_format: "wav"
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI Speech API failed (${response.status}): ${await readError(response)}`);
  }

  return Buffer.from(await response.arrayBuffer());
}
