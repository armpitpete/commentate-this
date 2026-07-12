import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import { createGeminiTtsSegment } from "../src/providers/gemini-tts.js";

const DISCLOSURE = "AI-generated voice; not a human commentator.";
const MODEL = "gemini-3.1-flash-tts-preview";
const VOICES = [
  { id: "Fenrir", trait: "Excitable", reason: "Primary candidate for natural escalation and a committed climax." },
  { id: "Sadachbia", trait: "Lively", reason: "Potentially energetic without sounding like an American announcer." },
  { id: "Orus", trait: "Firm", reason: "Potentially grounded and authoritative during setup." },
  { id: "Puck", trait: "Upbeat", reason: "Potentially fast and responsive during comic escalation." },
  { id: "Iapetus", trait: "Clear", reason: "Clarity benchmark for fast commentary." },
  { id: "Charon", trait: "Informative", reason: "Broadcast-neutral benchmark." }
];
const SEGMENTS = [
  { id: "s01", role: "set_up", text: "Merrin approaches the port with the cable in his right hand. Plenty of time here, and no obvious danger." },
  { id: "s02", role: "escalation", text: "It will not go! He turns it once, turns it again, and now the pressure is building!" },
  { id: "s03", role: "climax", text: "IT'S IN! THE ORIGINAL POSITION HAS WON IT AT THE THIRD ATTEMPT!" }
];

function timestamp() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function buildIndexHtml(folders) {
  const cards = VOICES.map((voice, voiceIndex) => {
    const clips = SEGMENTS.map((segment, segmentIndex) => {
      const file = `${folders[voiceIndex]}/${String(segmentIndex + 1).padStart(2, "0")}-${segment.role}.wav`;
      return `<li><strong>${escapeHtml(segment.role)}</strong><br><audio controls preload="none" src="${escapeHtml(file)}"></audio></li>`;
    }).join("\n");

    return `<section>
      <h2>${voiceIndex + 1}. ${escapeHtml(voice.id)} — ${escapeHtml(voice.trait)}</h2>
      <p>${escapeHtml(voice.reason)}</p>
      <ol>${clips}</ol>
    </section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CT-01 Google Gemini British voice audition</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { max-width: 60rem; margin: 0 auto; padding: 2rem 1rem 4rem; line-height: 1.55; }
    section { border-top: 1px solid currentColor; padding: 1.5rem 0; }
    audio { width: min(100%, 34rem); }
    li { margin-bottom: 1rem; }
  </style>
</head>
<body>
  <main>
    <h1>CT-01 Google Gemini British voice audition</h1>
    <p><strong>Disclosure:</strong> ${escapeHtml(DISCLOSURE)}</p>
    <p>Each voice receives the same explicit ordinary-British, non-posh football-commentary direction. Reject any voice that remains American, posh, flat, synthetic or audiobook-like.</p>
    ${cards}
  </main>
</body>
</html>`;
}

const args = parseArgs(process.argv.slice(2));
const model = args.model ?? MODEL;
const outputRoot = path.resolve(args["output-dir"] ?? path.join("proof-output", `google-gemini-audition-${timestamp()}`));

if (args["dry-run"]) {
  console.log(JSON.stringify({
    provider: "google-gemini",
    stage: "british_voice_audition",
    model,
    freeTier: true,
    voices: VOICES,
    segments: SEGMENTS.length,
    calls: VOICES.length * SEGMENTS.length,
    credential: "GEMINI_API_KEY",
    outputRoot
  }, null, 2));
  process.exit(0);
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is required. Create it in Google AI Studio and set it only in the current shell.");
}

await mkdir(outputRoot, { recursive: true });
const folders = [];
for (const [voiceIndex, voice] of VOICES.entries()) {
  const folder = `${String(voiceIndex + 1).padStart(2, "0")}-${voice.id.toLowerCase()}`;
  folders.push(folder);
  const voiceDir = path.join(outputRoot, folder);
  await mkdir(voiceDir, { recursive: true });
  console.log(`Generating Google Gemini audition for ${voice.id} (${voice.trait})...`);

  for (const [segmentIndex, segment] of SEGMENTS.entries()) {
    const filename = `${String(segmentIndex + 1).padStart(2, "0")}-${segment.role}.wav`;
    const audio = await createGeminiTtsSegment({ apiKey, voice: voice.id, segment, model });
    await writeFile(path.join(voiceDir, filename), audio);
  }
}

const header = ["candidate", "voice", "trait", "british_accent", "not_posh", "emotional_range", "football_authenticity", "climax", "preferred", "notes"];
const rows = VOICES.map((voice, index) => [index + 1, voice.id, voice.trait, "", "", "", "", "", "", ""]);
await writeFile(path.join(outputRoot, "voice-audition-results.csv"), `${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`);
await writeFile(path.join(outputRoot, "listen.html"), buildIndexHtml(folders));
await writeFile(path.join(outputRoot, "voice-audition.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  provider: "google-gemini",
  stage: "british_voice_audition",
  model,
  voices: VOICES.map((voice, index) => ({ ...voice, candidate: index + 1, folder: folders[index] })),
  segments: SEGMENTS,
  player: "listen.html",
  results: "voice-audition-results.csv"
}, null, 2)}\n`);

console.log(`\nGoogle Gemini audition complete: ${outputRoot}`);
console.log(`Open: ${path.join(outputRoot, "listen.html")}`);
