export const COMMENTARY_MODES = [
  "routine",
  "cup_final",
  "last_minute",
  "relegation",
  "excessive"
];

export const COMMENTARY_ROLES = [
  "set_up",
  "build",
  "obstacle",
  "escalation",
  "pause",
  "climax",
  "aftermath",
  "analysis"
];

export const PACES = [
  "calm",
  "measured",
  "building",
  "fast",
  "breathless",
  "shout"
];

export const VOLUMES = ["quiet", "normal", "loud", "full"];
export const EMOTIONS = [
  "matter_of_fact",
  "focused",
  "concerned",
  "urgent",
  "astonished",
  "triumphant",
  "disappointed"
];
export const CROWD_BEDS = ["silent", "low", "medium", "high"];
export const CROWD_REACTIONS = [
  "none",
  "murmur",
  "gasp",
  "groan",
  "roar",
  "boo",
  "applause"
];

const deliverySchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    intensity: { type: "integer", minimum: 0, maximum: 5 },
    pace: { type: "string", enum: PACES },
    volume: { type: "string", enum: VOLUMES },
    emotion: { type: "string", enum: EMOTIONS },
    pauseBeforeMs: { type: "integer", minimum: 0, maximum: 2500 },
    pauseAfterMs: { type: "integer", minimum: 0, maximum: 3000 }
  },
  required: [
    "intensity",
    "pace",
    "volume",
    "emotion",
    "pauseBeforeMs",
    "pauseAfterMs"
  ]
};

const crowdSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    bed: { type: "string", enum: CROWD_BEDS },
    reaction: { type: "string", enum: CROWD_REACTIONS },
    ducking: { type: "number", minimum: 0, maximum: 1 }
  },
  required: ["bed", "reaction", "ducking"]
};

export const commentaryScriptSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "Commentate This commentary script",
  type: "object",
  additionalProperties: false,
  properties: {
    version: { type: "string", const: "1.0" },
    title: { type: "string", minLength: 1, maxLength: 100 },
    sourceText: { type: "string", minLength: 1, maxLength: 500 },
    mode: { type: "string", enum: COMMENTARY_MODES },
    targetDurationSeconds: { type: "integer", minimum: 15, maximum: 60 },
    segments: {
      type: "array",
      minItems: 4,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string", pattern: "^s[0-9]{2}$" },
          speaker: { type: "string", enum: ["commentator", "analyst"] },
          role: { type: "string", enum: COMMENTARY_ROLES },
          text: { type: "string", minLength: 1, maxLength: 280 },
          delivery: deliverySchema,
          crowd: crowdSchema
        },
        required: ["id", "speaker", "role", "text", "delivery", "crowd"]
      }
    }
  },
  required: [
    "version",
    "title",
    "sourceText",
    "mode",
    "targetDurationSeconds",
    "segments"
  ]
};
