import { COMMENTARY_MODES } from "../domain/commentary-schema.js";

const MODE_NOTES = {
  routine: "Begin like an ordinary league match, then allow one decisive shout.",
  cup_final: "Treat the event as a cup final with weight, occasion and a major climax.",
  last_minute: "Begin already tense, as if only seconds remain, but still preserve a final pause.",
  relegation: "Use anxious, desperate tension. The outcome feels season-defining.",
  excessive: "Apply completely disproportionate, stadium-shaking drama to the trivial event."
};

export function buildCommentaryInstructions() {
  return [
    "You create short British football broadcast scripts from ordinary, non-football events.",
    "The commentator must remain completely sincere and must never explain, wink at, or acknowledge the joke.",
    "Translate the source event into clear physical play: objective, movement, obstacle, rising pressure, decisive moment, aftermath.",
    "Use authentic live-commentary rhythm, not a paragraph stuffed with football clichés.",
    "Tension must change over time. Start controlled, accelerate, insert a real pause immediately before the climax, then deliver one intelligible full-volume shout.",
    "The climax must be earned by the preceding action. Constant shouting is forbidden.",
    "An analyst may speak only after the climax and should give calm, absurdly serious tactical judgement.",
    "Do not imitate, name, quote, or describe any real commentator.",
    "Do not add cruelty, abuse, slurs, or humiliation. The situation is the joke.",
    "Return only data matching the supplied JSON schema."
  ].join("\n");
}

export function buildCommentaryInput({ text, mode = "excessive", targetDurationSeconds = 30 }) {
  if (typeof text !== "string" || text.trim().length === 0) {
    throw new TypeError("text must be a non-empty string");
  }
  if (!COMMENTARY_MODES.includes(mode)) {
    throw new RangeError(`mode must be one of: ${COMMENTARY_MODES.join(", ")}`);
  }
  if (!Number.isInteger(targetDurationSeconds) || targetDurationSeconds < 15 || targetDurationSeconds > 60) {
    throw new RangeError("targetDurationSeconds must be an integer from 15 to 60");
  }

  return [
    `SOURCE EVENT: ${text.trim()}`,
    `MODE: ${mode}`,
    `TARGET DURATION: ${targetDurationSeconds} seconds`,
    `MODE DIRECTION: ${MODE_NOTES[mode]}`,
    "Required dramatic shape: controlled setup -> visible obstacle -> rising pace -> silence -> one shouted climax -> brief aftermath or analyst judgement.",
    "Use between 4 and 10 compact segments. Keep every line speakable aloud."
  ].join("\n");
}
