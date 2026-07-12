import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import {
  createElevenLabsDesignedVoice,
  createElevenLabsSpeechSegment
} from "../src/providers/elevenlabs.js";

const DISCLOSURE = "AI-generated designed voice; not a human commentator.";
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

async function findLatestDesignManifest(root = "proof-output") {
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
      } else if (entry.isFile() && entry.name === "voice-design.json") {
        const metadata = await stat(fullPath);
        matches.push({ fullPath, modified: metadata.mtimeMs });
      }
    }
  }
  await walk(path.resolve(root));
  matches.sort((a, b) => b.modified - a.modified);
  return matches[0]?.fullPath ?? null;
}

function buildIndexHtml(files) {
  const clips = files.map((item) => `
    <li>
      <strong>${escapeHtml(item.role)}</strong><br>
      <audio controls preload="none" src="${escapeHtml(item.filename)}"></audio>
    </li>`).join("\n");
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CT-01 designed commentator football audition</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { max-width: 58rem; margin: 0 auto; padding: 2rem 1rem 4rem; line-height: 1.55; }
    audio { width: min(100%, 34rem); }
    li { margin-bottom: 1.25rem; }
  </style>
</head>
<body>
  <main>
    <h1>CT-01 designed commentator football audition</h1>
    <p><strong>Disclosure:</strong> ${escapeHtml(DISCLOSURE)}</p>
    <p>Judge the same voice across restrained setup, urgent escalation and committed climax.</p>
    <ol>${clips}</ol>
  </main>
</body>
</html>`;
}

const args = parseArgs(process.argv.slice(2));
const candidate = Number(args._?.[0] ?? args.candidate);
const model = args.model ?? "eleven_v3";

if (args["dry-run"]) {
  console.log(JSON.stringify({
    provider: "elevenlabs",
    stage: "designed_voice_expressive_audition",
    preferredInvocation: "npm run voice:design:audition -- 1",
    manifestResolution: "latest proof-output/**/voice-design.json",
    createsVoice: true,
    model,
    callsAfterCreation: auditionSegments.length
  }, null, 2));
  process.exit(0);
}

if (!Number.isInteger(candidate) || candidate < 1) {
  throw new Error("Supply one designed-voice candidate number, for example: npm run voice:design:audition -- 1");
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error("ELEVENLABS_API_KEY is required. Set it only in the local shell.");

const manifestPath = await findLatestDesignManifest();
if (!manifestPath) {
  throw new Error("No voice-design.json was found under proof-output. Run `npm run voice:design` first.");
}
console.log(`Using Voice Design manifest: ${manifestPath}`);

const design = JSON.parse(await readFile(manifestPath, "utf8"));
const selected = design.candidates?.find((item) => item.candidate === candidate);
if (!selected) throw new Error(`Candidate ${candidate} does not exist in ${manifestPath}`);

const created = await createElevenLabsDesignedVoice({
  apiKey,
  generatedVoiceId: selected.generated_voice_id,
  name: `CT01 Northern Commentator ${candidate}`,
  description: design.voiceDescription,
  labels: {
    accent: "Northern English",
    gender: "male",
    use_case: "football commentary",
    description: "expressive"
  }
});

const outputRoot = path.resolve(
  args["output-dir"] ?? path.join("proof-output", `elevenlabs-designed-football-${timestamp()}`)
);
await mkdir(outputRoot, { recursive: true });
const files = [];

for (const [index, segment] of auditionSegments.entries()) {
  const filename = `${String(index + 1).padStart(2, "0")}-${segment.role}.mp3`;
  const audio = await createElevenLabsSpeechSegment({
    apiKey,
    voiceId: created.voice_id,
    segment,
    model
  });
  await writeFile(path.join(outputRoot, filename), audio);
  files.push({ role: segment.role, filename, text: segment.text });
}

await writeFile(path.join(outputRoot, "listen.html"), buildIndexHtml(files));
await writeFile(path.join(outputRoot, "voice-audition-results.csv"), [
  '"voice_id","name","british_accent","not_posh","emotional_range","football_authenticity","climax","preferred","notes"',
  `"${created.voice_id}","${String(created.name ?? `CT01 Northern Commentator ${candidate}`).replaceAll('"', '""')}","","","","","","",""`
].join("\n") + "\n");
await writeFile(path.join(outputRoot, "voice-audition.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  provider: "elevenlabs",
  stage: "designed_voice_expressive_audition",
  sourceManifest: manifestPath,
  selectedCandidate: candidate,
  createdVoice: {
    voice_id: created.voice_id,
    name: created.name,
    category: created.category,
    labels: created.labels,
    description: created.description
  },
  model,
  files,
  player: "listen.html",
  results: "voice-audition-results.csv"
}, null, 2)}\n`);

console.log(`\nDesigned football audition complete: ${outputRoot}`);
console.log(`Open: ${path.join(outputRoot, "listen.html")}`);
