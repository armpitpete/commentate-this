import { parseArgs } from "./args.mjs";
import { getReferenceSentence } from "../src/proof/reference-sentences.js";
import { buildOpenAICommentaryRequest } from "../src/providers/openai.js";

const args = parseArgs(process.argv.slice(2));
const reference = args.id ? getReferenceSentence(args.id) : null;
const text = args.text ?? reference?.text;
if (!text) {
  console.error("Use --text \"...\" or --id usb-cable");
  process.exit(1);
}
const request = buildOpenAICommentaryRequest({
  text,
  mode: args.mode ?? "excessive",
  targetDurationSeconds: Number(args.duration ?? 30),
  model: args.model ?? "gpt-5.6"
});
console.log(JSON.stringify(request, null, 2));
