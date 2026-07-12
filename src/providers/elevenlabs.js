const ACCOUNT_VOICES_URL = "https://api.elevenlabs.io/v2/voices";
const SHARED_VOICES_URL = "https://api.elevenlabs.io/v1/shared-voices";
const ADD_SHARED_VOICE_URL = "https://api.elevenlabs.io/v1/voices/add";
const SPEECH_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const VOICE_DESIGN_URL = "https://api.elevenlabs.io/v1/text-to-voice/design";
const VOICE_CREATE_URL = "https://api.elevenlabs.io/v1/text-to-voice";

function requireApiKey(apiKey) {
  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    throw new Error("ELEVENLABS_API_KEY is required for ElevenLabs generation");
  }
}

async function readError(response) {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text);
    return parsed?.detail?.message ?? parsed?.detail ?? parsed?.message ?? text;
  } catch {
    return text;
  }
}

function voiceText(voice) {
  const labels = Object.entries(voice?.labels ?? {})
    .map(([key, value]) => `${key} ${value}`)
    .join(" ");
  const verified = (voice?.verified_languages ?? [])
    .map((item) => `${item?.language ?? ""} ${item?.accent ?? ""} ${item?.locale ?? ""}`)
    .join(" ");
  return [
    voice?.name,
    voice?.description,
    voice?.accent,
    voice?.descriptive,
    voice?.use_case,
    voice?.language,
    voice?.locale,
    labels,
    verified
  ].filter(Boolean).join(" ").toLowerCase();
}

const POSITIVE_TERMS = new Map([
  ["northern english", 14],
  ["yorkshire", 13],
  ["manchester", 12],
  ["mancunian", 12],
  ["liverpool", 12],
  ["scouse", 12],
  ["newcastle", 11],
  ["geordie", 11],
  ["midlands", 9],
  ["working class", 9],
  ["regional", 6],
  ["british", 5],
  ["england", 5],
  ["english", 4],
  ["uk", 4],
  ["sports", 9],
  ["football", 11],
  ["commentator", 11],
  ["commentary", 9],
  ["energetic", 4],
  ["dynamic", 4],
  ["excited", 3]
]);

const NEGATIVE_TERMS = new Map([
  ["received pronunciation", -18],
  ["upper class", -16],
  ["aristocratic", -16],
  ["queen's english", -15],
  ["posh", -15],
  ["refined", -7],
  ["formal", -4],
  ["sophisticated", -4]
]);

const BRITISH_MARKERS = [
  "british",
  "english",
  "england",
  "en-gb",
  "uk",
  "northern",
  "yorkshire",
  "manchester",
  "mancunian",
  "liverpool",
  "scouse",
  "newcastle",
  "geordie",
  "midlands",
  "scottish",
  "welsh"
];

export function scoreBritishCommentatorVoice(voice) {
  const text = voiceText(voice);
  let score = 0;
  for (const [term, value] of POSITIVE_TERMS) {
    if (text.includes(term)) score += value;
  }
  for (const [term, value] of NEGATIVE_TERMS) {
    if (text.includes(term)) score += value;
  }
  if (voice?.category === "professional") score += 2;
  if (voice?.recording_quality === "studio") score += 2;
  return score;
}

export function isElevenLabsSharedVoiceFree(voice) {
  return voice?.free_users_allowed === true || voice?.sharing?.free_users_allowed === true;
}

export function selectBritishCommentatorCandidates(voices, limit = 8) {
  const unique = new Map();
  for (const voice of voices ?? []) {
    if (!voice?.voice_id || unique.has(voice.voice_id)) continue;
    const text = voiceText(voice);
    if (!BRITISH_MARKERS.some((marker) => text.includes(marker))) continue;
    unique.set(voice.voice_id, voice);
  }
  return [...unique.values()]
    .map((voice) => ({ ...voice, suitabilityScore: scoreBritishCommentatorVoice(voice) }))
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore || String(a.name).localeCompare(String(b.name)))
    .slice(0, limit);
}

export async function searchElevenLabsVoices({
  apiKey,
  search,
  pageSize = 100,
  fetchImpl = globalThis.fetch
}) {
  requireApiKey(apiKey);
  const url = new URL(ACCOUNT_VOICES_URL);
  url.searchParams.set("page_size", String(Math.min(Math.max(pageSize, 1), 100)));
  url.searchParams.set("include_total_count", "false");
  if (search) url.searchParams.set("search", search);

  const response = await fetchImpl(url, {
    headers: { "xi-api-key": apiKey }
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs account voice search failed (${response.status}): ${await readError(response)}`);
  }
  const payload = await response.json();
  return Array.isArray(payload?.voices) ? payload.voices : [];
}

export async function searchElevenLabsSharedVoices({
  apiKey,
  search,
  accent,
  language = "en",
  pageSize = 100,
  page = 0,
  fetchImpl = globalThis.fetch
}) {
  requireApiKey(apiKey);
  const url = new URL(SHARED_VOICES_URL);
  url.searchParams.set("page_size", String(Math.min(Math.max(pageSize, 1), 100)));
  url.searchParams.set("page", String(Math.max(page, 0)));
  if (search) url.searchParams.set("search", search);
  if (accent) url.searchParams.set("accent", accent);
  if (language) url.searchParams.set("language", language);

  const response = await fetchImpl(url, {
    headers: { "xi-api-key": apiKey }
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs shared voice search failed (${response.status}): ${await readError(response)}`);
  }
  const payload = await response.json();
  return Array.isArray(payload?.voices) ? payload.voices : [];
}

export async function addElevenLabsSharedVoice({
  apiKey,
  publicOwnerId,
  voiceId,
  newName,
  fetchImpl = globalThis.fetch
}) {
  requireApiKey(apiKey);
  if (!publicOwnerId) throw new TypeError("publicOwnerId is required");
  if (!voiceId) throw new TypeError("voiceId is required");
  if (!newName) throw new TypeError("newName is required");

  const url = `${ADD_SHARED_VOICE_URL}/${encodeURIComponent(publicOwnerId)}/${encodeURIComponent(voiceId)}`;
  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ new_name: newName, bookmarked: true })
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs add shared voice failed (${response.status}): ${await readError(response)}`);
  }
  const payload = await response.json();
  return payload?.voice_id ?? voiceId;
}

export function buildElevenLabsVoiceDesignRequest({
  voiceDescription,
  text,
  model = "eleven_ttv_v3",
  seed = 1964,
  loudness = 0.8,
  guidanceScale = 4,
  quality = 0.8
}) {
  if (typeof voiceDescription !== "string" || voiceDescription.length < 20 || voiceDescription.length > 1000) {
    throw new TypeError("voiceDescription must contain 20 to 1000 characters");
  }
  if (typeof text !== "string" || text.length < 100 || text.length > 1000) {
    throw new TypeError("text must contain 100 to 1000 characters");
  }
  return {
    url: VOICE_DESIGN_URL,
    body: {
      voice_description: voiceDescription,
      text,
      model_id: model,
      auto_generate_text: false,
      loudness,
      seed,
      guidance_scale: guidanceScale,
      should_enhance: false,
      quality
    }
  };
}

export async function designElevenLabsVoicePreviews({
  apiKey,
  voiceDescription,
  text,
  model = "eleven_ttv_v3",
  seed = 1964,
  loudness = 0.8,
  guidanceScale = 4,
  quality = 0.8,
  fetchImpl = globalThis.fetch
}) {
  requireApiKey(apiKey);
  const request = buildElevenLabsVoiceDesignRequest({
    voiceDescription,
    text,
    model,
    seed,
    loudness,
    guidanceScale,
    quality
  });
  const response = await fetchImpl(request.url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request.body)
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs voice design failed (${response.status}): ${await readError(response)}`);
  }
  const payload = await response.json();
  const previews = Array.isArray(payload?.previews) ? payload.previews : [];
  if (previews.length === 0) throw new Error("ElevenLabs voice design returned no previews");
  return { previews, text: payload?.text ?? text };
}

export async function createElevenLabsDesignedVoice({
  apiKey,
  generatedVoiceId,
  name,
  description,
  labels = {
    accent: "Northern English",
    gender: "male",
    use_case: "football commentary"
  },
  fetchImpl = globalThis.fetch
}) {
  requireApiKey(apiKey);
  if (!generatedVoiceId) throw new TypeError("generatedVoiceId is required");
  if (!name) throw new TypeError("name is required");
  if (typeof description !== "string" || description.length < 20) {
    throw new TypeError("description must contain at least 20 characters");
  }
  const response = await fetchImpl(VOICE_CREATE_URL, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      voice_name: name,
      voice_description: description,
      generated_voice_id: generatedVoiceId,
      labels
    })
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs create designed voice failed (${response.status}): ${await readError(response)}`);
  }
  const payload = await response.json();
  if (!payload?.voice_id) throw new Error("ElevenLabs created voice response did not include voice_id");
  return payload;
}

export function buildElevenLabsAuditionText(segment) {
  const roleTag = {
    set_up: "[calm] [controlled]",
    escalation: "[excited] [fast]",
    climax: "[shouting] [triumphant]"
  }[segment.role] ?? "[focused]";
  return `[strong Northern English accent] ${roleTag} ${segment.text}`;
}

export function buildElevenLabsSpeechRequest({
  voiceId,
  segment,
  model = "eleven_v3",
  outputFormat = "mp3_44100_128"
}) {
  if (!voiceId) throw new TypeError("voiceId is required");
  const url = new URL(`${SPEECH_URL}/${encodeURIComponent(voiceId)}`);
  url.searchParams.set("output_format", outputFormat);
  return {
    url,
    body: {
      text: buildElevenLabsAuditionText(segment),
      model_id: model,
      language_code: "en",
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.75,
        style: 0.7,
        use_speaker_boost: true,
        speed: segment.role === "escalation" ? 1.12 : segment.role === "climax" ? 1.05 : 0.96
      }
    }
  };
}

export async function createElevenLabsSpeechSegment({
  apiKey,
  voiceId,
  segment,
  model = "eleven_v3",
  outputFormat = "mp3_44100_128",
  fetchImpl = globalThis.fetch
}) {
  requireApiKey(apiKey);
  const request = buildElevenLabsSpeechRequest({ voiceId, segment, model, outputFormat });
  const response = await fetchImpl(request.url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg"
    },
    body: JSON.stringify(request.body)
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs speech API failed (${response.status}): ${await readError(response)}`);
  }
  return Buffer.from(await response.arrayBuffer());
}
