import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import { getReferenceSentence } from "../src/proof/reference-sentences.js";
import { buildListeningPlayer } from "../src/proof/build-listening-player.js";
import {
  buildOpenAICommentaryRequest,
  createOpenAICommentaryScript,
  createOpenAISpeechSegment,
  buildSpeechInstructions
} from "../src/providers/openai.js";
import { validateCommentaryScript } from "../src/domain/validate-commentary-script.js";

const DISCLOSURE = "AI-generated voice; not a human commentator.";

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 60) || "proof";
}

const args = parseArgs(process.argv.slice(2));
const reference = args.id ? getReferenceSentence(args.id) : null;
const text = args.text ?? reference?.text;
if (!text) {
  console.error("Use --text \"...\" or --id usb-cable");
  process.exit(1);
}

const mode = args.mode ?? "excessive";
const targetDurationSeconds = Number(args.duration ?? 30);
const model = args.model ?? "gpt-5.6";
const ttsModel = args["tts-model"] ?? "gpt-4o-mini-tts";
const commentatorVoice = args["commentator-voice"] ?? "cedar";
const analystVoice = args["analyst-voice"] ?? "marin";
const request = buildOpenAICommentaryRequest({ text, mode, targetDurationSeconds, model });

if (args["dry-run"]) {
  console.log(JSON.stringify({
    commentaryRequest: request,
    speechDefaults: {
      ttsModel,
      commentatorVoice,
      analystVoice,
      disclosureRequired: true
    }
  }, null, 2));
  process.exit(0);
}

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is required. Do not paste it into source control or chat.");
  process.exit(1);
}

const script = await createOpenAICommentaryScript({
  apiKey,
  text,
  mode,
  targetDurationSeconds,
  model
});
const validation = validateCommentaryScript(script);
const outputName = `${reference?.id ?? slugify(text)}-${Date.now()}`;
const outputDir = path.resolve(
  args["output-dir"] ?? path.join("proof-output", outputName)
);
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, "script.json"), `${JSON.stringify(script, null, 2)}\n`);

const manifest = {
  generatedAt: new Date().toISOString(),
  sourceReference: reference?.id ?? null,
  sourceText: text,
  title: script.title,
  models: { script: model, speech: ttsModel },
  voices: { commentator: commentatorVoice, analyst: analystVoice },
  estimatedDurationSeconds: validation.estimatedDurationSeconds,
  disclosure: DISCLOSURE,
  segments: []
};

for (const [index, segment] of script.segments.entries()) {
  const voice = segment.speaker === "analyst" ? analystVoice : commentatorVoice;
  const filename = `${String(index + 1).padStart(2, "0")}-${segment.id}-${segment.speaker}.wav`;
  const audio = await createOpenAISpeechSegment({
    apiKey,
    segment,
    voice,
    model: ttsModel
  });
  await writeFile(path.join(outputDir, filename), audio);
  manifest.segments.push({
    id: segment.id,
    filename,
    speaker: segment.speaker,
    role: segment.role,
    text: segment.text,
    voice,
    pauseBeforeMs: segment.delivery.pauseBeforeMs,
    pauseAfterMs: segment.delivery.pauseAfterMs,
    crowd: segment.crowd,
    speechInstructions: buildSpeechInstructions(segment)
  });
}

await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(
  path.join(outputDir, "listen.html"),
  buildListeningPlayer({
    title: script.title,
    sourceText: text,
    disclosure: DISCLOSURE,
    segments: manifest.segments
  })
);
console.log(`Generated proof package: ${outputDir}`);
console.log(`Open the complete timed performance: ${path.join(outputDir, "listen.html")}`);
console.log("Human listening must happen before crowd mixing is built.");
