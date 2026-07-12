import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import { createAzureSpeechSegment } from "../src/providers/azure.js";

const DISCLOSURE = "AI-generated voice; not a human commentator.";
const VOICES = [
  { id: "en-GB-RyanNeural", name: "Ryan", notes: "Male en-GB voice with chat and cheerful styles." },
  { id: "en-GB-OliverNeural", name: "Oliver", notes: "Male en-GB standard neural voice." },
  { id: "en-GB-ThomasNeural", name: "Thomas", notes: "Male en-GB standard neural voice." },
  { id: "en-GB-AlfieNeural", name: "Alfie", notes: "Male en-GB standard neural voice." }
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
      const file = `${folders[voiceIndex]}/${String(segmentIndex + 1).padStart(2, "0")}-${segment.role}.mp3`;
      return `<li><strong>${escapeHtml(segment.role)}</strong><br><audio controls preload="none" src="${escapeHtml(file)}"></audio></li>`;
    }).join("\n");
    return `<section><h2>${voiceIndex + 1}. ${escapeHtml(voice.name)}</h2><p><code>${escapeHtml(voice.id)}</code></p><p>${escapeHtml(voice.notes)}</p><ol>${clips}</ol></section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CT-01 Azure British voice audition</title>
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
    <h1>CT-01 Azure British voice audition</h1>
    <p><strong>Disclosure:</strong> ${escapeHtml(DISCLOSURE)}</p>
    <p>Each native en-GB male voice performs the same restrained setup, urgent escalation and committed climax. Reject voices that sound posh, flat, synthetic or unlike live football commentary.</p>
    ${cards}
  </main>
</body>
</html>`;
}

const args = parseArgs(process.argv.slice(2));
const outputRoot = path.resolve(args["output-dir"] ?? path.join("proof-output", `azure-audition-${timestamp()}`));

if (args["dry-run"]) {
  console.log(JSON.stringify({
    provider: "azure",
    stage: "british_voice_audition",
    voices: VOICES,
    segments: SEGMENTS.length,
    calls: VOICES.length * SEGMENTS.length,
    credentials: ["AZURE_SPEECH_KEY", "AZURE_SPEECH_REGION"],
    outputRoot
  }, null, 2));
  process.exit(0);
}

const apiKey = process.env.AZURE_SPEECH_KEY;
const region = process.env.AZURE_SPEECH_REGION;
if (!apiKey || !region) {
  throw new Error("AZURE_SPEECH_KEY and AZURE_SPEECH_REGION are required. Set them only in the local shell.");
}

await mkdir(outputRoot, { recursive: true });
const folders = [];
for (const [voiceIndex, voice] of VOICES.entries()) {
  const folder = `${String(voiceIndex + 1).padStart(2, "0")}-${voice.name.toLowerCase()}`;
  folders.push(folder);
  const voiceDir = path.join(outputRoot, folder);
  await mkdir(voiceDir, { recursive: true });
  console.log(`Generating Azure audition for ${voice.name} (${voice.id})...`);
  for (const [segmentIndex, segment] of SEGMENTS.entries()) {
    const filename = `${String(segmentIndex + 1).padStart(2, "0")}-${segment.role}.mp3`;
    const audio = await createAzureSpeechSegment({ apiKey, region, voice: voice.id, segment });
    await writeFile(path.join(voiceDir, filename), audio);
  }
}

const header = ["candidate", "voice", "voice_id", "british_accent", "not_posh", "emotional_range", "football_authenticity", "climax", "preferred", "notes"];
const rows = VOICES.map((voice, index) => [index + 1, voice.name, voice.id, "", "", "", "", "", "", ""]);
await writeFile(path.join(outputRoot, "voice-audition-results.csv"), `${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`);
await writeFile(path.join(outputRoot, "listen.html"), buildIndexHtml(folders));
await writeFile(path.join(outputRoot, "voice-audition.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  provider: "azure",
  stage: "british_voice_audition",
  region,
  voices: VOICES.map((voice, index) => ({ ...voice, candidate: index + 1, folder: folders[index] })),
  segments: SEGMENTS,
  player: "listen.html",
  results: "voice-audition-results.csv"
}, null, 2)}\n`);

console.log(`\nAzure audition complete: ${outputRoot}`);
console.log(`Open: ${path.join(outputRoot, "listen.html")}`);
