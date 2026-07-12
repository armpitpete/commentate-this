import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import { designElevenLabsVoicePreviews } from "../src/providers/elevenlabs.js";

const DISCLOSURE = "AI-generated voice design preview; not a human commentator.";
const DESCRIPTION = [
  "A British male football commentator in his forties with an ordinary Northern English accent.",
  "Warm, grounded and conversational at low intensity, then fast, urgent and genuinely excited as play develops.",
  "Capable of a full committed goal shout without becoming shrill or distorted.",
  "Not posh, not Received Pronunciation, not aristocratic, not an audiobook narrator, and not an American sports announcer.",
  "Clear consonants, natural British football rhythm, broad emotional range, and believable live-broadcast energy."
].join(" ");
const PREVIEW_TEXT = [
  "Merrin approaches the socket with the cable in his right hand. Plenty of time here, and no obvious danger.",
  "It will not go! He turns it once, turns it again, and the pressure is building now.",
  "One final attempt—IT'S IN! THE ORIGINAL POSITION HAS WON IT AT THE THIRD ATTEMPT!"
].join(" ");

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

function buildIndexHtml(previews) {
  const cards = previews.map((preview, index) => `
    <section>
      <h2>Candidate ${index + 1}</h2>
      <audio controls preload="none" src="${escapeHtml(preview.filename)}"></audio>
      <p><code>candidate ${index + 1}</code></p>
    </section>`).join("\n");
  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CT-01 designed British commentator voices</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { max-width: 58rem; margin: 0 auto; padding: 2rem 1rem 4rem; line-height: 1.55; }
    section { border-top: 1px solid currentColor; padding: 1.5rem 0; }
    audio { width: min(100%, 34rem); }
    .notice { border-left: 0.3rem solid currentColor; padding-left: 1rem; }
  </style>
</head>
<body>
  <main>
    <h1>CT-01 free-plan Voice Design</h1>
    <p class="notice"><strong>Disclosure:</strong> ${escapeHtml(DISCLOSURE)}</p>
    <p>These voices were designed specifically for ordinary, non-posh British football commentary. Choose one candidate only if the accent and basic energy are credible.</p>
    ${cards}
  </main>
</body>
</html>`;
}

const args = parseArgs(process.argv.slice(2));
const model = args.model ?? "eleven_ttv_v3";
const seed = Number(args.seed ?? 1964);
const outputRoot = path.resolve(
  args["output-dir"] ?? path.join("proof-output", `elevenlabs-designed-${timestamp()}`)
);

if (!Number.isInteger(seed) || seed < 0 || seed > 2147483647) {
  throw new Error("--seed must be an integer from 0 to 2147483647");
}

if (args["dry-run"]) {
  console.log(JSON.stringify({
    provider: "elevenlabs",
    stage: "free_voice_design",
    endpoint: "/v1/text-to-voice/design",
    model,
    seed,
    description: DESCRIPTION,
    previewText: PREVIEW_TEXT,
    outputRoot,
    nextCommand: "npm run voice:design:audition -- 1"
  }, null, 2));
  process.exit(0);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error("ELEVENLABS_API_KEY is required. Set it only in the local shell.");

const result = await designElevenLabsVoicePreviews({
  apiKey,
  voiceDescription: DESCRIPTION,
  text: PREVIEW_TEXT,
  model,
  seed,
  loudness: 0.85,
  guidanceScale: 4,
  quality: 0.85
});

await mkdir(outputRoot, { recursive: true });
const previews = [];
for (const [index, preview] of result.previews.entries()) {
  const filename = `${String(index + 1).padStart(2, "0")}-designed-commentator.mp3`;
  await writeFile(path.join(outputRoot, filename), Buffer.from(preview.audio_base_64, "base64"));
  previews.push({
    candidate: index + 1,
    generated_voice_id: preview.generated_voice_id,
    filename,
    media_type: preview.media_type,
    duration_secs: preview.duration_secs,
    language: preview.language
  });
}

await writeFile(path.join(outputRoot, "listen.html"), buildIndexHtml(previews));
await writeFile(path.join(outputRoot, "voice-design.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  provider: "elevenlabs",
  stage: "free_voice_design",
  model,
  seed,
  voiceDescription: DESCRIPTION,
  previewText: result.text,
  candidates: previews,
  player: "listen.html"
}, null, 2)}\n`);

console.log(`\nDesigned voice previews complete: ${outputRoot}`);
console.log(`Open: ${path.join(outputRoot, "listen.html")}`);
console.log("After choosing one candidate, run:");
console.log("npm run voice:design:audition -- 1");
