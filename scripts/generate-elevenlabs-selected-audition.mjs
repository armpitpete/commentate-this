import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import {
  addElevenLabsSharedVoice,
  createElevenLabsSpeechSegment
} from "../src/providers/elevenlabs.js";

const DISCLOSURE = "AI-generated voice; not a human commentator.";
const auditionSegments = [
  { id: "s01", speaker: "commentator", role: "set_up", text: "Merrin approaches the port with the cable in his right hand. Plenty of time here, and no obvious danger.", delivery: { pauseBeforeMs: 0, pauseAfterMs: 300 } },
  { id: "s02", speaker: "commentator", role: "escalation", text: "It will not go! He turns it once, turns it again, and now the pressure is building!", delivery: { pauseBeforeMs: 0, pauseAfterMs: 180 } },
  { id: "s03", speaker: "commentator", role: "climax", text: "IT'S IN! THE ORIGINAL POSITION HAS WON IT AT THE THIRD ATTEMPT!", delivery: { pauseBeforeMs: 700, pauseAfterMs: 1000 } }
];

function timestamp() { return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-"); }
function escapeHtml(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
function csvCell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function slug(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "").slice(0, 32) || "voice"; }
function parseCandidates(raw) {
  const values = String(raw ?? "").split(",").map((value) => Number(value.trim())).filter(Number.isInteger);
  return [...new Set(values)];
}

async function findLatestVoiceLibraryManifest(root = "proof-output") {
  const matches = [];

  async function walk(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error?.code === "ENOENT") return;
      throw error;
    }

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name === "voice-library.json") {
        const metadata = await stat(fullPath);
        matches.push({ fullPath, modified: metadata.mtimeMs });
      }
    }
  }

  await walk(path.resolve(root));
  matches.sort((a, b) => b.modified - a.modified);
  return matches[0]?.fullPath ?? null;
}

function resolveCliInputs(args) {
  let manifest = args.manifest ?? process.env.CT01_ELEVENLABS_MANIFEST ?? null;
  let candidates = args.candidates ?? process.env.CT01_ELEVENLABS_CANDIDATES ?? null;

  if (!manifest && typeof args._?.[0] === "string" && args._[0].toLowerCase().endsWith(".json")) {
    manifest = args._[0];
    candidates ??= args._[1] ?? null;
  } else {
    candidates ??= args._?.[0] ?? null;
  }

  return { manifest, candidates };
}

function buildIndexHtml({ candidates, folders }) {
  const cards = candidates.map((voice, index) => {
    const clips = auditionSegments.map((segment, segmentIndex) => {
      const file = `${folders[index]}/${String(segmentIndex + 1).padStart(2, "0")}-${segment.role}.mp3`;
      return `<li><strong>${escapeHtml(segment.role)}</strong><br><audio controls preload="none" src="${escapeHtml(file)}"></audio></li>`;
    }).join("\n");
    return `<section><h2>${index + 1}. ${escapeHtml(voice.name)}</h2><p><strong>Accent:</strong> ${escapeHtml(voice.accent || "not supplied")}</p><p>${escapeHtml(voice.description || "")}</p><ol>${clips}</ol></section>`;
  }).join("\n");
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>CT-01 expressive football voice audition</title><style>:root{color-scheme:light dark;font-family:system-ui,sans-serif}body{max-width:60rem;margin:0 auto;padding:2rem 1rem 4rem;line-height:1.55}section{border-top:1px solid currentColor;padding:1.5rem 0}audio{width:min(100%,34rem)}li{margin-bottom:1rem}</style></head><body><main><h1>CT-01 expressive football voice audition</h1><p><strong>Disclosure:</strong> ${escapeHtml(DISCLOSURE)}</p><p>Each selected Voice Library candidate performs the same calm setup, urgent escalation and shouted climax.</p>${cards}</main></body></html>`;
}

const args = parseArgs(process.argv.slice(2));
const model = args.model ?? "eleven_v3";
const cliInputs = resolveCliInputs(args);

if (args["dry-run"]) {
  console.log(JSON.stringify({
    provider: "elevenlabs",
    stage: "selected_expressive_audition",
    preferredInvocation: "npm run voice:elevenlabs:audition -- 1,3",
    manifestResolution: "latest proof-output/**/voice-library.json unless explicitly supplied",
    mutatesVoiceCollection: true,
    model,
    callsPerCandidate: auditionSegments.length
  }, null, 2));
  process.exit(0);
}

const manifestPath = cliInputs.manifest
  ? path.resolve(cliInputs.manifest)
  : await findLatestVoiceLibraryManifest();

if (!manifestPath) {
  throw new Error("No voice-library.json was found under proof-output. Run `npm run voice:elevenlabs` first, listen to the previews, then rerun this command with candidate numbers.");
}

const requested = parseCandidates(cliInputs.candidates);
if (requested.length === 0 || requested.length > 3) {
  throw new Error("Supply one to three candidate numbers positionally, for example: npm run voice:elevenlabs:audition -- 1,3");
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error("ELEVENLABS_API_KEY is required. Set it only in the local shell.");

const discovery = JSON.parse(await readFile(manifestPath, "utf8"));
const candidates = requested.map((number) => {
  const voice = discovery.candidates?.find((item) => item.candidate === number);
  if (!voice) throw new Error(`Candidate ${number} does not exist in ${manifestPath}`);
  if (!voice.public_owner_id) throw new Error(`Candidate ${number} has no public_owner_id and cannot be added from the Voice Library`);
  return voice;
});

const outputRoot = path.resolve(args["output-dir"] ?? path.join("proof-output", `elevenlabs-expressive-${timestamp()}`));
await mkdir(outputRoot, { recursive: true });
const folders = [];
const generatedVoices = [];

console.log(`Using Voice Library manifest: ${manifestPath}`);

for (const [index, voice] of candidates.entries()) {
  const folder = `${String(index + 1).padStart(2, "0")}-${slug(voice.name)}-${voice.voice_id.slice(0, 8)}`;
  folders.push(folder);
  const voiceDir = path.join(outputRoot, folder);
  await mkdir(voiceDir, { recursive: true });
  console.log(`Adding and auditioning ${voice.name}...`);
  const addedVoiceId = await addElevenLabsSharedVoice({
    apiKey,
    publicOwnerId: voice.public_owner_id,
    voiceId: voice.voice_id,
    newName: `CT01 ${voice.name}`.slice(0, 100)
  });

  for (const [segmentIndex, segment] of auditionSegments.entries()) {
    const filename = `${String(segmentIndex + 1).padStart(2, "0")}-${segment.role}.mp3`;
    const audio = await createElevenLabsSpeechSegment({ apiKey, voiceId: addedVoiceId, segment, model });
    await writeFile(path.join(voiceDir, filename), audio);
  }
  generatedVoices.push({ ...voice, added_voice_id: addedVoiceId, folder });
}

const header = ["candidate", "voice_id", "added_voice_id", "name", "accent", "british_accent", "not_posh", "emotional_range", "football_authenticity", "climax", "preferred", "notes"];
const rows = generatedVoices.map((voice) => [voice.candidate, voice.voice_id, voice.added_voice_id, voice.name, voice.accent, "", "", "", "", "", "", ""]);
await writeFile(path.join(outputRoot, "voice-audition-results.csv"), `${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`);
await writeFile(path.join(outputRoot, "listen.html"), buildIndexHtml({ candidates: generatedVoices, folders }));
await writeFile(path.join(outputRoot, "voice-audition.json"), `${JSON.stringify({ generatedAt: new Date().toISOString(), provider: "elevenlabs", stage: "selected_expressive_audition", model, sourceManifest: manifestPath, candidates: generatedVoices, player: "listen.html", results: "voice-audition-results.csv" }, null, 2)}\n`);
console.log(`\nExpressive audition complete: ${outputRoot}`);
console.log(`Open: ${path.join(outputRoot, "listen.html")}`);
