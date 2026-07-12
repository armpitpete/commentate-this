import { commentaryScriptSchema } from "../domain/commentary-schema.js";
import { validateCommentaryScript } from "../domain/validate-commentary-script.js";
import {
  buildCommentaryInput,
  buildCommentaryInstructions,
  buildCommentaryRepairInput
} from "../prompt/build-commentary-prompt.js";

const RESPONSES_URL = "https://api.openai.com/v1/responses";
const SPEECH_URL = "https://api.openai.com/v1/audio/speech";
const MIN_CLIMAX_PAUSE_MS = 500;
const MAX_SCRIPT_ATTEMPTS = 2;

function requireApiKey(apiKey) {
  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    throw new Error("OPENAI_API_KEY is required for live proof generation");
  }
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
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

export function normalizeGeneratedCommentaryScript(
  script,
  { text, mode, targetDurationSeconds } = {}
) {
  if (!isObject(script)) return script;

  const normalized = structuredClone(script);

  if (typeof text === "string" && text.trim().length > 0) {
    normalized.sourceText = text.trim();
  }
  if (typeof mode === "string") normalized.mode = mode;
  if (Number.isInteger(targetDurationSeconds)) {
    normalized.targetDurationSeconds = targetDurationSeconds;
  }

  const climaxSegments = Array.isArray(normalized.segments)
    ? normalized.segments.filter((segment) => segment?.role === "climax")
    : [];

  if (climaxSegments.length === 1 && isObject(climaxSegments[0].delivery)) {
    const delivery = climaxSegments[0].delivery;
    delivery.intensity = 5;
    delivery.pace = "shout";
    delivery.volume = "full";
    delivery.pauseBeforeMs = Math.max(
      MIN_CLIMAX_PAUSE_MS,
      Number.isInteger(delivery.pauseBeforeMs) ? delivery.pauseBeforeMs : 0
    );
  }

  return normalized;
}

export function buildOpenAICommentaryRequest({
  text,
  mode = "excessive",
  targetDurationSeconds = 30,
  model = "gpt-5.6",
  previousScript = null,
  validationErrors = null
}) {
  const input = previousScript
    ? buildCommentaryRepairInput({
        text,
        mode,
        targetDurationSeconds,
        previousScript,
        validationErrors
      })
    : buildCommentaryInput({ text, mode, targetDurationSeconds });

  return {
    model,
    store: false,
    instructions: buildCommentaryInstructions(),
    input,
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

async function requestCommentaryScript({ apiKey, body, fetchImpl }) {
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
  try {
    return JSON.parse(textOutput);
  } catch (error) {
    throw new Error(`OpenAI returned non-JSON output: ${error.message}`);
  }
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

  let previousScript = null;
  let validationErrors = null;

  for (let attempt = 1; attempt <= MAX_SCRIPT_ATTEMPTS; attempt += 1) {
    const body = buildOpenAICommentaryRequest({
      text,
      mode,
      targetDurationSeconds,
      model,
      previousScript,
      validationErrors
    });
    const generated = await requestCommentaryScript({ apiKey, body, fetchImpl });
    const normalized = normalizeGeneratedCommentaryScript(generated, {
      text,
      mode,
      targetDurationSeconds
    });
    const validation = validateCommentaryScript(normalized);

    if (validation.valid) return normalized;

    previousScript = normalized;
    validationErrors = validation.errors;
  }

  const details = validationErrors
    .map((error) => `${error.path}: ${error.message}`)
    .join("\n");
  throw new Error(
    `Invalid commentary script after ${MAX_SCRIPT_ATTEMPTS} attempts:\n${details}`
  );
}

const ROLE_NOTES = {
  set_up: "Begin composed and observant. Keep the opening restrained so later escalation has somewhere to go.",
  build: "Let interest become clearly audible. Quicken slightly and lift the pitch without shouting.",
  obstacle: "React to the obstruction with genuine concern. Put a sharper attack on the important words.",
  escalation: "Drive the action forward urgently. Shorten the gaps, raise the pitch and let pressure enter the breathing.",
  pause: "Deliver this as a tense holding line. Do not fill or rush the silence that follows.",
  climax: "Explode as though a dramatic last-minute winner has just been scored. Start sharply, raise pitch and volume, sustain the decisive words and allow genuine astonishment. This must be unmistakably emotional, not merely louder.",
  aftermath: "Recover audibly from the climax. Sound breathless and amazed rather than returning instantly to neutral.",
  analysis: "Drop into a dry, measured British co-commentary voice with restrained disbelief and tactical seriousness."
};

const INTENSITY_NOTES = {
  0: "Emotional intensity 0 of 5: almost neutral, but still live and attentive.",
  1: "Emotional intensity 1 of 5: controlled professional interest.",
  2: "Emotional intensity 2 of 5: clear concern or anticipation is emerging.",
  3: "Emotional intensity 3 of 5: obvious urgency and rising tension.",
  4: "Emotional intensity 4 of 5: severe danger; sound breathless and close to losing composure.",
  5: "Emotional intensity 5 of 5: full emotional release at the decisive moment."
};

export function buildSpeechInstructions(segment) {
  const delivery = segment.delivery;
  const speaker = segment.speaker === "analyst"
    ? "football co-commentator and analyst"
    : "live football commentator";
  const paceNotes = {
    calm: "Use controlled, spacious live-broadcast pacing.",
    measured: "Use steady professional football-broadcast pacing.",
    building: "Increase pace and tension through the line; do not remain flat.",
    fast: "Speak quickly and urgently while keeping every word clear.",
    breathless: "Sound genuinely breathless under severe match pressure, with audible urgency and rising pitch.",
    shout: "Deliver one committed, sustained goal-style shout with a sharp attack, rising pitch and genuine emotional release. Keep it intelligible and free from distortion."
  };
  const volumeNotes = {
    quiet: "Keep the voice restrained but alive.",
    normal: "Use normal live-broadcast volume with expressive intonation.",
    loud: "Project strongly and let excitement become unmistakable.",
    full: "Use full emotional volume while avoiding digital clipping."
  };

  return [
    `Perform as a ${speaker}.`,
    "Use native British English in a neutral UK football-broadcast accent.",
    "Do not use a North American accent, rhotic post-vocalic R, American sports-announcer cadence or American football terminology.",
    "Sound like live British radio or television football commentary, not an audiobook, advert, documentary voice-over or synthetic assistant.",
    "Treat the event as genuinely important. Never sound amused and never wink at the joke.",
    "Do not read neutrally. Make the emotional contrast between calm, pressure and release unmistakable.",
    INTENSITY_NOTES[delivery.intensity] ?? "Follow the requested emotional intensity precisely.",
    ROLE_NOTES[segment.role] ?? "Match the emotional performance to the segment's dramatic role.",
    paceNotes[delivery.pace],
    volumeNotes[delivery.volume],
    `Emotional direction: ${delivery.emotion.replaceAll("_", " ")}.`,
    segment.role === "climax"
      ? "This is the single decisive climax. Commit fully and allow a brief, authentic loss of composure."
      : "Do not turn this line into the main climax. Preserve contrast for the decisive moment."
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
