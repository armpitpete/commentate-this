import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import {
  searchElevenLabsSharedVoices,
  selectBritishCommentatorCandidates
} from "../src/providers/elevenlabs.js";

const DISCLOSURE = "AI-generated voice preview; not a human commentator.";
const DEFAULT_QUERIES = [
  "British",
  "English",
  "Northern",
  "Yorkshire",
  "Manchester",
  "football",
  "sports commentator"
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
  return voice?.accent ?? voice?.labels?.accent ?? voice?.verified_languages?.[0]?.accent ?? "";
}

function buildIndexHtml({ candidates }) {
  const cards = candidates.map((voice, index) => {
    const preview = voice.preview_url
      ? `<audio controls preload="none" src="${escapeHtml(voice.preview_url)}"></audio>`
      : "<p>No public preview was supplied for this voice.</p>";
    return `<section>
      <h2>${index + 1}. ${escapeHtml(voice.name)}</h2>
      <p><strong>Accent:</strong> ${escapeHtml(voiceAccent(voice) || "not supplied")} · <strong>Category:</strong> ${escapeHtml(voice.category || "not supplied")} · <strong>Score:</strong> ${voice.suitabilityScore}</p>
      <p><strong>Use case:</strong> ${escapeHtml(voice.use_case || "not supplied")} · <strong>Style:</strong> ${escapeHtml(voice.descriptive || "not supplied")}</p>
      <p>${escapeHtml(voice.description || "No description supplied.")}</p>
      ${preview}
      <p><code>candidate ${index + 1}</code></p>
    </section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CT-01 ElevenLabs Voice Library discovery</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { max-width: 60rem; margin: 0 auto; padding: 2rem 1rem 4rem; line-height: 1.55; }
    section { border-top: 1px solid currentColor; padding: 1.5rem 0; }
    audio { width: min(100%, 34rem); }
    .notice { border-left: 0.3rem solid currentColor; padding-left: 1rem; }
  </style>
</head>
<body>
  <main>
    <h1>CT-01 ElevenLabs Voice Library discovery</h1>
    <p class="notice"><strong>Disclosure:</strong> ${escapeHtml(DISCLOSURE)}</p>
    <p>This is the accent-selection stage. Reject posh/RP, American, audiobook and unsuitable voices. Choose at most three candidates for the expressive football audition.</p>
    ${cards}
  </main>
</body>
</html>`;
}

const args = parseArgs(process.argv.slice(2));
const queries = parseQueries(args.queries);
const limit = Number(args.limit ?? 12);
const outputRoot = path.resolve(
  args["output-dir"] ?? path.join("proof-output", `elevenlabs-library-${timestamp()}`)
);

if (!Number.isInteger(limit) || limit < 1 || limit > 30) {
  console.error("--limit must be an integer from 1 to 30");
  process.exit(1);
}

if (args["dry-run"]) {
  console.log(JSON.stringify({
    provider: "elevenlabs",
    stage: "shared_voice_library_discovery",
    endpoint: "/v1/shared-voices",
    queries,
    limit,
    outputRoot,
    mutatesVoiceCollection: false,
    nextCommand: "npm run voice:elevenlabs:audition -- 1,2"
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
  console.log(`Searching ElevenLabs shared Voice Library for: ${query}`);
  found.push(...await searchElevenLabsSharedVoices({ apiKey, search: query }));
}

const candidates = selectBritishCommentatorCandidates(found, limit);
if (candidates.length === 0) {
  throw new Error("The shared Voice Library returned results, but none contained British or regional-UK metadata. Retry with --queries \"British|English|Northern|Yorkshire|Manchester|Liverpool|Newcastle\".");
}

await mkdir(outputRoot, { recursive: true });
const manifestCandidates = candidates.map((voice, index) => ({
  candidate: index + 1,
  voice_id: voice.voice_id,
  public_owner_id: voice.public_owner_id,
  name: voice.name,
  accent: voiceAccent(voice),
  category: voice.category,
  descriptive: voice.descriptive,
  use_case: voice.use_case,
  description: voice.description,
  preview_url: voice.preview_url,
  suitabilityScore: voice.suitabilityScore
}));

const header = [
  "candidate", "voice_id", "public_owner_id", "name", "accent", "description",
  "british_accent", "not_posh", "football_potential", "selected", "notes"
];
const rows = manifestCandidates.map((voice) => [
  voice.candidate, voice.voice_id, voice.public_owner_id, voice.name, voice.accent,
  voice.description, "", "", "", "", ""
]);

await writeFile(path.join(outputRoot, "voice-library-results.csv"), `${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`);
await writeFile(path.join(outputRoot, "listen.html"), buildIndexHtml({ candidates }));
await writeFile(path.join(outputRoot, "voice-library.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  provider: "elevenlabs",
  stage: "shared_voice_library_discovery",
  queries,
  accentTarget: "regional or neutral everyday British; Northern English preferred; not posh or RP",
  candidates: manifestCandidates,
  player: "listen.html",
  results: "voice-library-results.csv"
}, null, 2)}\n`);

console.log(`\nVoice Library discovery complete: ${outputRoot}`);
console.log(`Open: ${path.join(outputRoot, "listen.html")}`);
console.log("After choosing up to three candidates, run:");
console.log("npm run voice:elevenlabs:audition -- 1,2");
