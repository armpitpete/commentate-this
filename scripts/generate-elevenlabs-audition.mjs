import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import {
  createElevenLabsSpeechSegment,
  searchElevenLabsVoices,
  selectBritishCommentatorCandidates
} from "../src/providers/elevenlabs.js";

const DISCLOSURE = "AI-generated voice; not a human commentator.";
const DEFAULT_QUERIES = [
  "Northern English",
  "Yorkshire",
  "Manchester",
  "British sports",
  "British commentator",
  "football commentary"
];

const auditionSegments = [
  {
    id: "s01",
    speaker: "commentator",
    role: "set_up",
    text: "Merrin approaches the port with the cable in his right hand. Plenty of time here, and no obvious danger.",
    delivery: { pauseBeforeMs: 0, pauseAfterMs: 300 }
  },
  {
    id: "s02",
    speaker: "commentator",
    role: "escalation",
    text: "It will not go! He turns it once, turns it again, and now the pressure is building!",
    delivery: { pauseBeforeMs: 0, pauseAfterMs: 180 }
  },
  {
    id: "s03",
    speaker: "commentator",
    role: "climax",
    text: "IT'S IN! THE ORIGINAL POSITION HAS WON IT AT THE THIRD ATTEMPT!",
    delivery: { pauseBeforeMs: 700, pauseAfterMs: 1000 }
  }
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

function parseQueries(raw) {
  const queries = (raw ?? DEFAULT_QUERIES.join("|"))
    .split("|")
    .map((query) => query.trim())
    .filter(Boolean);
  return [...new Set(queries)];
}

function voiceAccent(voice) {
  return voice?.labels?.accent ?? voice?.verified_languages?.[0]?.accent ?? "";
}

function voiceDescription(voice) {
  return voice?.description ?? "";
}

function folderName(voice, index) {
  const name = String(voice.name ?? `voice-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 35);
  return `${String(index + 1).padStart(2, "0")}-${name || "voice"}-${voice.voice_id.slice(0, 8)}`;
}

function buildIndexHtml({ candidates, folders, model }) {
  const cards = candidates.map((voice, index) => {
    const folder = folders[index];
    const audio = auditionSegments.map((segment, segmentIndex) => {
      const filename = `${String(segmentIndex + 1).padStart(2, "0")}-${segment.role}.mp3`;
      return `<li><strong>${escapeHtml(segment.role)}</strong><br><audio controls preload="none" src="${escapeHtml(`${folder}/${filename}`)}"></audio></li>`;
    }).join("\n");
    return `<section>
      <h2>${index + 1}. ${escapeHtml(voice.name)}</h2>
      <p><strong>Accent label:</strong> ${escapeHtml(voiceAccent(voice) || "not supplied")}</p>
      <p><strong>Category:</strong> ${escapeHtml(voice.category || "not supplied")} · <strong>Suitability score:</strong> ${voice.suitabilityScore}</p>
      <p>${escapeHtml(voiceDescription(voice) || "No description supplied.")}</p>
      <ol>${audio}</ol>
    </section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CT-01 ElevenLabs regional British voice audition</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { max-width: 60rem; margin: 0 auto; padding: 2rem 1rem 4rem; line-height: 1.55; }
    section { border-top: 1px solid currentColor; padding: 1.5rem 0; }
    audio { width: min(100%, 34rem); margin-top: 0.4rem; }
    li { margin-bottom: 1rem; }
    .notice { border-left: 0.3rem solid currentColor; padding-left: 1rem; }
  </style>
</head>
<body>
  <main>
    <h1>CT-01 ElevenLabs regional British voice audition</h1>
    <p class="notice"><strong>Disclosure:</strong> ${escapeHtml(DISCLOSURE)}</p>
    <p>Model: <code>${escapeHtml(model)}</code>. Every voice performs identical restrained setup, urgent escalation and shouted climax material.</p>
    <p>Reject posh, Received Pronunciation, American, audiobook and emotionally flat voices. Score the accompanying CSV before selecting a candidate.</p>
    ${cards}
  </main>
</body>
</html>`;
}

const args = parseArgs(process.argv.slice(2));
const queries = parseQueries(args.queries);
const limit = Number(args.limit ?? 6);
const model = args.model ?? "eleven_v3";
const outputRoot = path.resolve(
  args["output-dir"] ?? path.join("proof-output", `elevenlabs-audition-${timestamp()}`)
);

if (!Number.isInteger(limit) || limit < 1 || limit > 12) {
  console.error("--limit must be an integer from 1 to 12");
  process.exit(1);
}

if (args["dry-run"]) {
  console.log(JSON.stringify({
    provider: "elevenlabs",
    queries,
    limit,
    model,
    outputRoot,
    callsAfterSearch: limit * auditionSegments.length,
    accentTarget: "regional or neutral everyday British; Northern English preferred; not posh or RP",
    measures: ["british_accent", "not_posh", "emotional_range", "football_authenticity", "climax"]
  }, null, 2));
  process.exit(0);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("ELEVENLABS_API_KEY is required. Set it in the local shell; never save it in the repository or paste it into chat.");
  process.exit(1);
}

const found = [];
for (const query of queries) {
  console.log(`Searching ElevenLabs voices for: ${query}`);
  found.push(...await searchElevenLabsVoices({ apiKey, search: query }));
}

const candidates = selectBritishCommentatorCandidates(found, limit);
if (candidates.length === 0) {
  throw new Error("No British-labelled ElevenLabs voices were found. Try --queries with regional terms or save suitable Voice Library voices to the account first.");
}

await mkdir(outputRoot, { recursive: true });
const folders = [];

for (const [voiceIndex, voice] of candidates.entries()) {
  const folder = folderName(voice, voiceIndex);
  folders.push(folder);
  const voiceDir = path.join(outputRoot, folder);
  await mkdir(voiceDir, { recursive: true });
  console.log(`\n=== Auditioning ${voice.name} (${voiceAccent(voice) || "unlabelled accent"}) ===`);

  const generatedSegments = [];
  for (const [segmentIndex, segment] of auditionSegments.entries()) {
    const filename = `${String(segmentIndex + 1).padStart(2, "0")}-${segment.role}.mp3`;
    const audio = await createElevenLabsSpeechSegment({
      apiKey,
      voiceId: voice.voice_id,
      segment,
      model
    });
    await writeFile(path.join(voiceDir, filename), audio);
    generatedSegments.push({ ...segment, filename });
  }

  await writeFile(path.join(voiceDir, "manifest.json"), `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    provider: "elevenlabs",
    model,
    voice: {
      voice_id: voice.voice_id,
      name: voice.name,
      accent: voiceAccent(voice),
      category: voice.category,
      description: voiceDescription(voice),
      suitabilityScore: voice.suitabilityScore
    },
    disclosure: DISCLOSURE,
    segments: generatedSegments
  }, null, 2)}\n`);
}

const header = [
  "voice_id",
  "name",
  "accent_label",
  "category",
  "description",
  "suitability_score",
  "british_accent",
  "not_posh",
  "emotional_range",
  "football_authenticity",
  "climax",
  "preferred",
  "notes"
];
const rows = candidates.map((voice) => [
  voice.voice_id,
  voice.name,
  voiceAccent(voice),
  voice.category,
  voiceDescription(voice),
  voice.suitabilityScore,
  "", "", "", "", "", "", ""
]);
const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");

await writeFile(path.join(outputRoot, "voice-audition-results.csv"), `${csv}\n`);
await writeFile(path.join(outputRoot, "listen.html"), buildIndexHtml({ candidates, folders, model }));
await writeFile(path.join(outputRoot, "voice-audition.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  provider: "elevenlabs",
  model,
  queries,
  accentTarget: "regional or neutral everyday British; Northern English preferred; not posh or RP",
  candidates: candidates.map((voice, index) => ({
    voice_id: voice.voice_id,
    name: voice.name,
    accent: voiceAccent(voice),
    category: voice.category,
    description: voiceDescription(voice),
    suitabilityScore: voice.suitabilityScore,
    folder: folders[index]
  })),
  player: "listen.html",
  results: "voice-audition-results.csv"
}, null, 2)}\n`);

console.log(`\nElevenLabs audition complete: ${outputRoot}`);
console.log(`Open: ${path.join(outputRoot, "listen.html")}`);
console.log("Select a voice only if it is British, non-posh, emotionally responsive and recognisably football commentary.");
