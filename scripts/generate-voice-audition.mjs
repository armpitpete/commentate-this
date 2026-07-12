import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import {
  buildSpeechInstructions,
  createOpenAISpeechSegment
} from "../src/providers/openai.js";
import {
  buildListeningPlayer,
  buildProofSetIndex
} from "../src/proof/build-listening-player.js";

const DISCLOSURE = "AI-generated voice; not a human commentator.";
const SUPPORTED_VOICES = [
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar"
];
const DEFAULT_VOICES = ["fable", "ash", "onyx", "cedar"];

const auditionSegments = [
  {
    id: "s01",
    speaker: "commentator",
    role: "set_up",
    text: "Merrin approaches the port with the cable in his right hand. Plenty of time here, and no obvious danger.",
    delivery: {
      intensity: 1,
      pace: "calm",
      volume: "normal",
      emotion: "focused",
      pauseBeforeMs: 0,
      pauseAfterMs: 300
    },
    crowd: { bed: "silent", reaction: "none", ducking: 1 }
  },
  {
    id: "s02",
    speaker: "commentator",
    role: "escalation",
    text: "It will not go! He turns it once, turns it again, and now the pressure is building!",
    delivery: {
      intensity: 4,
      pace: "breathless",
      volume: "loud",
      emotion: "urgent",
      pauseBeforeMs: 0,
      pauseAfterMs: 180
    },
    crowd: { bed: "silent", reaction: "none", ducking: 1 }
  },
  {
    id: "s03",
    speaker: "commentator",
    role: "climax",
    text: "IT'S IN! THE ORIGINAL POSITION HAS WON IT AT THE THIRD ATTEMPT!",
    delivery: {
      intensity: 5,
      pace: "shout",
      volume: "full",
      emotion: "triumphant",
      pauseBeforeMs: 700,
      pauseAfterMs: 1000
    },
    crowd: { bed: "silent", reaction: "none", ducking: 1 }
  }
];

function timestamp() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function parseVoices(raw) {
  const voices = (raw ?? DEFAULT_VOICES.join(","))
    .split(",")
    .map((voice) => voice.trim().toLowerCase())
    .filter(Boolean);
  const unique = [...new Set(voices)];
  const invalid = unique.filter((voice) => !SUPPORTED_VOICES.includes(voice));
  if (invalid.length > 0) {
    throw new Error(`Unsupported voice(s): ${invalid.join(", ")}. Supported: ${SUPPORTED_VOICES.join(", ")}`);
  }
  if (unique.length === 0) throw new Error("At least one voice is required");
  return unique;
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

const args = parseArgs(process.argv.slice(2));
const voices = parseVoices(args.voices);
const ttsModel = args["tts-model"] ?? "gpt-4o-mini-tts";
const outputRoot = path.resolve(
  args["output-dir"] ?? path.join("proof-output", `voice-audition-${timestamp()}`)
);

if (args["dry-run"]) {
  console.log(JSON.stringify({
    voices,
    ttsModel,
    outputRoot,
    calls: voices.length * auditionSegments.length,
    accentContract: "native British English; neutral UK football-broadcast accent",
    measures: ["british_accent", "emotional_range", "football_authenticity", "climax"]
  }, null, 2));
  process.exit(0);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is required. Set it in the local shell; never save it in the repository or paste it into chat.");
  process.exit(1);
}

await mkdir(outputRoot, { recursive: true });
const cases = [];

for (const voice of voices) {
  console.log(`\n=== Auditioning ${voice} ===`);
  const voiceDir = path.join(outputRoot, voice);
  await mkdir(voiceDir, { recursive: true });
  const manifestSegments = [];

  for (const [index, segment] of auditionSegments.entries()) {
    const filename = `${String(index + 1).padStart(2, "0")}-${segment.role}.wav`;
    const audio = await createOpenAISpeechSegment({
      apiKey,
      segment,
      voice,
      model: ttsModel
    });
    await writeFile(path.join(voiceDir, filename), audio);
    manifestSegments.push({
      id: segment.id,
      filename,
      speaker: segment.speaker,
      role: segment.role,
      text: segment.text,
      voice,
      pauseBeforeMs: segment.delivery.pauseBeforeMs,
      pauseAfterMs: segment.delivery.pauseAfterMs,
      speechInstructions: buildSpeechInstructions(segment)
    });
  }

  await writeFile(
    path.join(voiceDir, "manifest.json"),
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      voice,
      ttsModel,
      disclosure: DISCLOSURE,
      accentContract: "native British English; neutral UK football-broadcast accent",
      segments: manifestSegments
    }, null, 2)}\n`
  );
  await writeFile(
    path.join(voiceDir, "listen.html"),
    buildListeningPlayer({
      title: `Voice audition — ${voice}`,
      sourceText: "The same controlled setup, rising pressure and shouted climax for every voice.",
      disclosure: DISCLOSURE,
      segments: manifestSegments
    })
  );
  cases.push({
    id: voice,
    text: "Rate British accent, emotional contrast, football authenticity and the climax."
  });
}

const csvRows = [
  ["voice", "british_accent", "emotional_range", "football_authenticity", "climax", "notes", "preferred"],
  ...voices.map((voice) => [voice, "", "", "", "", "", ""])
];
const csv = csvRows.map((row) => row.map(csvCell).join(",")).join("\n");

await writeFile(path.join(outputRoot, "voice-audition-results.csv"), `${csv}\n`);
await writeFile(
  path.join(outputRoot, "listen.html"),
  buildProofSetIndex({
    title: "CT-01 British commentator voice audition",
    disclosure: DISCLOSURE,
    cases
  })
);
await writeFile(
  path.join(outputRoot, "voice-audition.json"),
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    voices,
    ttsModel,
    accentContract: "native British English; neutral UK football-broadcast accent",
    player: "listen.html",
    results: "voice-audition-results.csv"
  }, null, 2)}\n`
);

console.log(`\nVoice audition complete: ${outputRoot}`);
console.log(`Open: ${path.join(outputRoot, "listen.html")}`);
console.log("Choose a voice only after scoring its British accent and emotional range by ear.");
