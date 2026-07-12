import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import { createElevenLabsSpeechSegment } from "../src/providers/elevenlabs.js";

const DISCLOSURE = "AI-generated voice; not a human commentator.";
const auditionSegments = [
  { id: "s01", speaker: "commentator", role: "set_up", text: "Merrin approaches the port with the cable in his right hand. Plenty of time here, and no obvious danger.", delivery: { pauseBeforeMs: 0, pauseAfterMs: 300 } },
  { id: "s02", speaker: "commentator", role: "escalation", text: "It will not go! He turns it once, turns it again, and now the pressure is building!", delivery: { pauseBeforeMs: 0, pauseAfterMs: 180 } },
  { id: "s03", speaker: "commentator", role: "climax", text: "IT'S IN! THE ORIGINAL POSITION HAS WON IT AT THE THIRD ATTEMPT!", delivery: { pauseBeforeMs: 700, pauseAfterMs: 1000 } }
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

async function findLatestManifest(root = "proof-output") {
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
      } else if (entry.isFile() && entry.name === "account-voices.json") {
        const metadata = await stat(fullPath);
        matches.push({ fullPath, modified: metadata.mtimeMs });
      }
    }
  }

  await walk(path.resolve(root));
  matches.sort((a, b) => b.modified - a.modified);
  return matches[0]?.fullPath ?? null;
}

function buildIndexHtml(voice, files) {
  const clips = auditionSegments.map((segment, index) => `
    <li>
      <strong>${escapeHtml(segment.role)}</strong><br>
      <audio controls preload="none" src="${escapeHtml(files[index])}"></audio>
    </li>`).join("\n");

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CT-01 account voice football audition</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { max-width: 58rem; margin: 0 auto; padding: 2rem 1rem 4rem; line-height: 1.55; }
    audio { width: min(100%, 34rem); }
    li { margin-bottom: 1.2rem; }
  </style>
</head>
<body>
  <main>
    <h1>${escapeHtml(voice.name)} — football audition</h1>
    <p><strong>Disclosure:</strong> ${escapeHtml(DISCLOSURE)}</p>
    <p><strong>Category:</strong> ${escapeHtml(voice.category || "not supplied")} · <strong>Accent:</strong> ${escapeHtml(voice.accent || "not supplied")}</p>
    <ol>${clips}</ol>
  </main>
</body>
</html>`;
}

const args = parseArgs(process.argv.slice(2));
const model = args.model ?? "eleven_v3";

if (args["dry-run"]) {
  console.log(JSON.stringify({
    provider: "elevenlabs",
    stage: "account_voice_expressive_audition",
    preferredInvocation: "npm run voice:account:audition -- 1",
    manifestResolution: "latest proof-output/**/account-voices.json",
    createsVoice: false,
    callsPerCandidate: auditionSegments.length,
    model
  }, null, 2));
  process.exit(0);
}

const candidateNumber = Number(args._?.[0]);
if (!Number.isInteger(candidateNumber) || candidateNumber < 1) {
  throw new Error("Supply one account-voice candidate number, for example: npm run voice:account:audition -- 1");
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error("ELEVENLABS_API_KEY is required. Set it only in the local shell.");

const manifestPath = await findLatestManifest();
if (!manifestPath) {
  throw new Error("No account-voices.json was found. Run `npm run voice:account` first.");
}

const discovery = JSON.parse(await readFile(manifestPath, "utf8"));
const voice = discovery.candidates?.find((item) => item.candidate === candidateNumber);
if (!voice) throw new Error(`Candidate ${candidateNumber} does not exist in ${manifestPath}`);

const outputRoot = path.resolve(args["output-dir"] ?? path.join("proof-output", `elevenlabs-account-expressive-${timestamp()}`));
await mkdir(outputRoot, { recursive: true });

console.log(`Using account voice: ${voice.name} (${voice.voice_id})`);
const files = [];
for (const [index, segment] of auditionSegments.entries()) {
  const filename = `${String(index + 1).padStart(2, "0")}-${segment.role}.mp3`;
  const audio = await createElevenLabsSpeechSegment({ apiKey, voiceId: voice.voice_id, segment, model });
  await writeFile(path.join(outputRoot, filename), audio);
  files.push(filename);
}

await writeFile(path.join(outputRoot, "listen.html"), buildIndexHtml(voice, files));
await writeFile(path.join(outputRoot, "voice-audition.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  provider: "elevenlabs",
  stage: "account_voice_expressive_audition",
  model,
  sourceManifest: manifestPath,
  voice,
  segments: auditionSegments.map((segment, index) => ({ ...segment, filename: files[index] })),
  player: "listen.html"
}, null, 2)}\n`);

console.log(`\nAccount voice audition complete: ${outputRoot}`);
console.log(`Open: ${path.join(outputRoot, "listen.html")}`);
