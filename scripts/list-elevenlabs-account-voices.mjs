import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import { searchElevenLabsVoices } from "../src/providers/elevenlabs.js";

const DISCLOSURE = "AI-generated voice preview; not a human commentator.";

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

function voiceAccent(voice) {
  return voice?.labels?.accent ?? voice?.verified_languages?.[0]?.accent ?? "";
}

function buildIndexHtml(candidates) {
  const cards = candidates.map((voice) => {
    const preview = voice.preview_url
      ? `<audio controls preload="none" src="${escapeHtml(voice.preview_url)}"></audio>`
      : "<p>No preview is available. Use the ElevenLabs app preview before selecting this voice.</p>";
    return `<section>
      <h2>${voice.candidate}. ${escapeHtml(voice.name)}</h2>
      <p><strong>Category:</strong> ${escapeHtml(voice.category || "not supplied")} · <strong>Accent:</strong> ${escapeHtml(voice.accent || "not supplied")}</p>
      <p>${escapeHtml(voice.description || "No description supplied.")}</p>
      ${preview}
      <p><code>candidate ${voice.candidate}</code></p>
    </section>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CT-01 ElevenLabs account voices</title>
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
    <h1>CT-01 ElevenLabs account voices</h1>
    <p class="notice"><strong>Disclosure:</strong> ${escapeHtml(DISCLOSURE)}</p>
    <p>This page lists voices already saved in the account. Create or design a voice in the ElevenLabs web app first, then return here and select its candidate number.</p>
    ${cards}
  </main>
</body>
</html>`;
}

const args = parseArgs(process.argv.slice(2));
const outputRoot = path.resolve(
  args["output-dir"] ?? path.join("proof-output", `elevenlabs-account-${timestamp()}`)
);

if (args["dry-run"]) {
  console.log(JSON.stringify({
    provider: "elevenlabs",
    stage: "account_voice_discovery",
    endpoint: "/v2/voices",
    mutatesVoiceCollection: false,
    outputRoot,
    nextCommand: "npm run voice:account:audition -- 1"
  }, null, 2));
  process.exit(0);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error("ELEVENLABS_API_KEY is required. Set it only in the local shell.");

const voices = await searchElevenLabsVoices({ apiKey, pageSize: 100 });
if (voices.length === 0) {
  throw new Error("No voices are available in the ElevenLabs account. Create a voice in the ElevenLabs web app, then rerun `npm run voice:account`.");
}

const candidates = voices
  .sort((a, b) => {
    const aCustom = a.category === "generated" || a.category === "cloned" ? 0 : 1;
    const bCustom = b.category === "generated" || b.category === "cloned" ? 0 : 1;
    return aCustom - bCustom || String(a.name).localeCompare(String(b.name));
  })
  .map((voice, index) => ({
    candidate: index + 1,
    voice_id: voice.voice_id,
    name: voice.name,
    category: voice.category,
    accent: voiceAccent(voice),
    description: voice.description,
    preview_url: voice.preview_url,
    labels: voice.labels ?? {}
  }));

await mkdir(outputRoot, { recursive: true });
await writeFile(path.join(outputRoot, "listen.html"), buildIndexHtml(candidates));
await writeFile(path.join(outputRoot, "account-voices.json"), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  provider: "elevenlabs",
  stage: "account_voice_discovery",
  candidates,
  player: "listen.html"
}, null, 2)}\n`);

const header = ["candidate", "voice_id", "name", "category", "accent", "description", "selected", "notes"];
const rows = candidates.map((voice) => [
  voice.candidate,
  voice.voice_id,
  voice.name,
  voice.category,
  voice.accent,
  voice.description,
  "",
  ""
]);
await writeFile(path.join(outputRoot, "account-voices.csv"), `${[header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`);

console.log(`\nAccount voice discovery complete: ${outputRoot}`);
console.log(`Open: ${path.join(outputRoot, "listen.html")}`);
console.log("After selecting a voice, run:");
console.log("npm run voice:account:audition -- 1");
