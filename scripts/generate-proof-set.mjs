import { mkdir, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parseArgs } from "./args.mjs";
import { referenceSentences } from "../src/proof/reference-sentences.js";
import { buildProofSetIndex } from "../src/proof/build-listening-player.js";

const DISCLOSURE = "AI-generated voice; not a human commentator.";
const SCORE_COLUMNS = [
  "football_authenticity",
  "british_accent",
  "emotional_range",
  "tension_curve",
  "pause",
  "shout",
  "continuity",
  "comedy",
  "restraint"
];

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function timestamp() {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

function buildChildArgs({ item, mode, duration, model, ttsModel, commentatorVoice, analystVoice, outputDir }) {
  return [
    fileURLToPath(new URL("./generate-audio-proof.mjs", import.meta.url)),
    "--id",
    item.id,
    "--mode",
    mode,
    "--duration",
    String(duration),
    "--model",
    model,
    "--tts-model",
    ttsModel,
    "--commentator-voice",
    commentatorVoice,
    "--analyst-voice",
    analystVoice,
    "--output-dir",
    outputDir
  ];
}

const args = parseArgs(process.argv.slice(2));
const mode = args.mode ?? "excessive";
const duration = Number(args.duration ?? 30);
const model = args.model ?? "gpt-5.6";
const ttsModel = args["tts-model"] ?? "gpt-4o-mini-tts";
const commentatorVoice = args["commentator-voice"] ?? "fable";
const analystVoice = args["analyst-voice"] ?? "cedar";

if (!Number.isInteger(duration) || duration < 15 || duration > 60) {
  console.error("--duration must be an integer from 15 to 60");
  process.exit(1);
}

const outputRoot = path.resolve(
  args["output-dir"] ?? path.join("proof-output", `ct-01-set-${timestamp()}`)
);
const cases = referenceSentences.map((item) => ({
  ...item,
  outputDir: path.join(outputRoot, item.id)
}));

if (args["dry-run"]) {
  console.log(
    JSON.stringify(
      {
        count: cases.length,
        outputRoot,
        mode,
        duration,
        models: { script: model, speech: ttsModel },
        voices: { commentator: commentatorVoice, analyst: analystVoice },
        accentContract: "native British English; neutral UK football-broadcast accent",
        emotionalContrastRequired: true,
        commands: cases.map((item) => ({
          id: item.id,
          argv: [process.execPath, ...buildChildArgs({
            item,
            mode,
            duration,
            model,
            ttsModel,
            commentatorVoice,
            analystVoice,
            outputDir: item.outputDir
          })]
        }))
      },
      null,
      2
    )
  );
  process.exit(0);
}

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is required. Set it in the local shell; never save it in the repository or paste it into chat.");
  process.exit(1);
}

await mkdir(outputRoot, { recursive: true });

for (const item of cases) {
  console.log(`\n=== Generating ${item.id} ===`);
  const result = spawnSync(
    process.execPath,
    buildChildArgs({
      item,
      mode,
      duration,
      model,
      ttsModel,
      commentatorVoice,
      analystVoice,
      outputDir: item.outputDir
    }),
    { stdio: "inherit", env: process.env }
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Proof generation failed for ${item.id} with exit code ${result.status}`);
  }
}

const csvHeader = [
  "id",
  "source_text",
  "proof_folder",
  ...SCORE_COLUMNS,
  "failure_note",
  "replay"
];
const csvRows = cases.map((item) => [
  item.id,
  item.text,
  item.id,
  ...SCORE_COLUMNS.map(() => ""),
  "",
  ""
]);
const csv = [csvHeader, ...csvRows]
  .map((row) => row.map(csvCell).join(","))
  .join("\n");

const setManifest = {
  generatedAt: new Date().toISOString(),
  disclosure: DISCLOSURE,
  mode,
  targetDurationSeconds: duration,
  models: { script: model, speech: ttsModel },
  voices: { commentator: commentatorVoice, analyst: analystVoice },
  accentContract: "native British English; neutral UK football-broadcast accent",
  cases: cases.map(({ outputDir: _outputDir, ...item }) => ({
    ...item,
    folder: item.id,
    player: `${item.id}/listen.html`
  }))
};

await writeFile(path.join(outputRoot, "proof-set.json"), `${JSON.stringify(setManifest, null, 2)}\n`);
await writeFile(path.join(outputRoot, "listening-results.csv"), `${csv}\n`);
await writeFile(
  path.join(outputRoot, "listen.html"),
  buildProofSetIndex({
    title: "CT-01 ten-sentence listening proof",
    disclosure: DISCLOSURE,
    cases
  })
);

console.log(`\nProof set complete: ${outputRoot}`);
console.log(`Open: ${path.join(outputRoot, "listen.html")}`);
console.log("Record British accent and emotional range as explicit human scores before any crowd or interface work begins.");
