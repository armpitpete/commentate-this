const OUTPUT_FORMAT = "audio-24khz-96kbitrate-mono-mp3";
const USER_AGENT = "commentate-this-ct01";

const RYAN_STYLES = {
  set_up: { style: "chat", degree: "1.0" },
  escalation: { style: "cheerful", degree: "1.45" },
  climax: { style: "cheerful", degree: "2.0" }
};

const DELIVERY = {
  set_up: { rate: "-6%", pitch: "-2%", volume: "+0%" },
  escalation: { rate: "+16%", pitch: "+3%", volume: "+18%" },
  climax: { rate: "+8%", pitch: "+5%", volume: "+35%" }
};

function requireText(value, name) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${name} is required`);
  }
  return value.trim();
}

function normaliseRegion(region) {
  const value = requireText(region, "region").toLowerCase();
  if (!/^[a-z0-9-]+$/u.test(value)) {
    throw new TypeError("region must be an Azure region name such as uksouth");
  }
  return value;
}

export function escapeAzureSsml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildAzureSsml({ voice, segment }) {
  const voiceName = requireText(voice, "voice");
  const role = segment?.role;
  const text = requireText(segment?.text, "segment.text");
  const delivery = DELIVERY[role] ?? DELIVERY.set_up;
  const prosody = `<prosody rate="${delivery.rate}" pitch="${delivery.pitch}" volume="${delivery.volume}">${escapeAzureSsml(text)}</prosody>`;
  const style = voiceName === "en-GB-RyanNeural" ? RYAN_STYLES[role] : null;
  const performance = style
    ? `<mstts:express-as style="${style.style}" styledegree="${style.degree}">${prosody}</mstts:express-as>`
    : prosody;

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="en-GB"><voice name="${escapeAzureSsml(voiceName)}">${performance}</voice></speak>`;
}

export function buildAzureSpeechRequest({
  apiKey,
  region,
  voice,
  segment,
  outputFormat = OUTPUT_FORMAT
}) {
  const key = requireText(apiKey, "apiKey");
  const resolvedRegion = normaliseRegion(region);
  return {
    url: new URL(`https://${resolvedRegion}.tts.speech.microsoft.com/cognitiveservices/v1`),
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": outputFormat,
      "User-Agent": USER_AGENT,
      Accept: "audio/mpeg"
    },
    body: buildAzureSsml({ voice, segment })
  };
}

async function readError(response) {
  const text = await response.text();
  return text || response.statusText || "Unknown Azure Speech error";
}

export async function createAzureSpeechSegment({
  apiKey,
  region,
  voice,
  segment,
  outputFormat = OUTPUT_FORMAT,
  fetchImpl = globalThis.fetch
}) {
  const request = buildAzureSpeechRequest({ apiKey, region, voice, segment, outputFormat });
  const response = await fetchImpl(request.url, {
    method: "POST",
    headers: request.headers,
    body: request.body
  });
  if (!response.ok) {
    throw new Error(`Azure Speech API failed (${response.status}): ${await readError(response)}`);
  }
  return Buffer.from(await response.arrayBuffer());
}
