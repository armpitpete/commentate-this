import {
  COMMENTARY_MODES,
  COMMENTARY_ROLES,
  PACES,
  VOLUMES,
  EMOTIONS,
  CROWD_BEDS,
  CROWD_REACTIONS
} from "./commentary-schema.js";

const WORDS_PER_MINUTE = {
  calm: 135,
  measured: 155,
  building: 175,
  fast: 200,
  breathless: 225,
  shout: 165
};

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function add(errors, path, message) {
  errors.push({ path, message });
}

function oneOf(value, allowed) {
  return allowed.includes(value);
}

function wordCount(text) {
  return text.trim().split(/\s+/u).filter(Boolean).length;
}

export function estimateDurationSeconds(script) {
  if (!script?.segments || !Array.isArray(script.segments)) return 0;

  return script.segments.reduce((total, segment) => {
    const pace = segment?.delivery?.pace;
    const rate = WORDS_PER_MINUTE[pace] ?? WORDS_PER_MINUTE.measured;
    const spoken = (wordCount(String(segment?.text ?? "")) / rate) * 60;
    const pauses =
      ((segment?.delivery?.pauseBeforeMs ?? 0) +
        (segment?.delivery?.pauseAfterMs ?? 0)) /
      1000;
    return total + spoken + pauses;
  }, 0);
}

export function validateCommentaryScript(script) {
  const errors = [];

  if (!isObject(script)) {
    return { valid: false, errors: [{ path: "$", message: "must be an object" }] };
  }

  if (script.version !== "1.0") add(errors, "$.version", "must equal 1.0");
  if (typeof script.title !== "string" || script.title.trim().length === 0) {
    add(errors, "$.title", "must be a non-empty string");
  }
  if (
    typeof script.sourceText !== "string" ||
    script.sourceText.trim().length === 0 ||
    script.sourceText.length > 500
  ) {
    add(errors, "$.sourceText", "must contain 1 to 500 characters");
  }
  if (!oneOf(script.mode, COMMENTARY_MODES)) {
    add(errors, "$.mode", `must be one of: ${COMMENTARY_MODES.join(", ")}`);
  }
  if (
    !Number.isInteger(script.targetDurationSeconds) ||
    script.targetDurationSeconds < 15 ||
    script.targetDurationSeconds > 60
  ) {
    add(errors, "$.targetDurationSeconds", "must be an integer from 15 to 60");
  }

  if (!Array.isArray(script.segments)) {
    add(errors, "$.segments", "must be an array");
    return { valid: false, errors };
  }
  if (script.segments.length < 4 || script.segments.length > 10) {
    add(errors, "$.segments", "must contain 4 to 10 segments");
  }

  const ids = new Set();
  const climaxIndexes = [];
  let analystCount = 0;

  script.segments.forEach((segment, index) => {
    const path = `$.segments[${index}]`;
    if (!isObject(segment)) {
      add(errors, path, "must be an object");
      return;
    }

    if (typeof segment.id !== "string" || !/^s[0-9]{2}$/u.test(segment.id)) {
      add(errors, `${path}.id`, "must match s00 format");
    } else if (ids.has(segment.id)) {
      add(errors, `${path}.id`, "must be unique");
    } else {
      ids.add(segment.id);
    }

    if (!oneOf(segment.speaker, ["commentator", "analyst"])) {
      add(errors, `${path}.speaker`, "must be commentator or analyst");
    }
    if (segment.speaker === "analyst") analystCount += 1;

    if (!oneOf(segment.role, COMMENTARY_ROLES)) {
      add(errors, `${path}.role`, "contains an unknown role");
    }
    if (segment.role === "climax") climaxIndexes.push(index);

    if (
      typeof segment.text !== "string" ||
      segment.text.trim().length === 0 ||
      segment.text.length > 280
    ) {
      add(errors, `${path}.text`, "must contain 1 to 280 characters");
    }

    const delivery = segment.delivery;
    if (!isObject(delivery)) {
      add(errors, `${path}.delivery`, "must be an object");
    } else {
      if (!Number.isInteger(delivery.intensity) || delivery.intensity < 0 || delivery.intensity > 5) {
        add(errors, `${path}.delivery.intensity`, "must be an integer from 0 to 5");
      }
      if (!oneOf(delivery.pace, PACES)) add(errors, `${path}.delivery.pace`, "is invalid");
      if (!oneOf(delivery.volume, VOLUMES)) add(errors, `${path}.delivery.volume`, "is invalid");
      if (!oneOf(delivery.emotion, EMOTIONS)) add(errors, `${path}.delivery.emotion`, "is invalid");
      if (!Number.isInteger(delivery.pauseBeforeMs) || delivery.pauseBeforeMs < 0 || delivery.pauseBeforeMs > 2500) {
        add(errors, `${path}.delivery.pauseBeforeMs`, "must be an integer from 0 to 2500");
      }
      if (!Number.isInteger(delivery.pauseAfterMs) || delivery.pauseAfterMs < 0 || delivery.pauseAfterMs > 3000) {
        add(errors, `${path}.delivery.pauseAfterMs`, "must be an integer from 0 to 3000");
      }
    }

    const crowd = segment.crowd;
    if (!isObject(crowd)) {
      add(errors, `${path}.crowd`, "must be an object");
    } else {
      if (!oneOf(crowd.bed, CROWD_BEDS)) add(errors, `${path}.crowd.bed`, "is invalid");
      if (!oneOf(crowd.reaction, CROWD_REACTIONS)) add(errors, `${path}.crowd.reaction`, "is invalid");
      if (typeof crowd.ducking !== "number" || crowd.ducking < 0 || crowd.ducking > 1) {
        add(errors, `${path}.crowd.ducking`, "must be a number from 0 to 1");
      }
    }
  });

  if (analystCount > 2) add(errors, "$.segments", "may contain at most two analyst segments");
  if (climaxIndexes.length !== 1) add(errors, "$.segments", "must contain exactly one climax segment");

  if (script.segments[0]?.delivery?.intensity > 2) {
    add(errors, "$.segments[0].delivery.intensity", "must start at intensity 0 to 2");
  }

  if (climaxIndexes.length === 1) {
    const climaxIndex = climaxIndexes[0];
    const climax = script.segments[climaxIndex];
    if (climaxIndex < 2) add(errors, `$.segments[${climaxIndex}]`, "climax must have at least two setup segments");
    if (climax?.speaker !== "commentator") add(errors, `$.segments[${climaxIndex}].speaker`, "climax must belong to commentator");
    if (climax?.delivery?.intensity !== 5) add(errors, `$.segments[${climaxIndex}].delivery.intensity`, "climax must use intensity 5");
    if (climax?.delivery?.pace !== "shout") add(errors, `$.segments[${climaxIndex}].delivery.pace`, "climax must use shout pace");
    if (climax?.delivery?.volume !== "full") add(errors, `$.segments[${climaxIndex}].delivery.volume`, "climax must use full volume");
    if ((climax?.delivery?.pauseBeforeMs ?? 0) < 300) {
      add(errors, `$.segments[${climaxIndex}].delivery.pauseBeforeMs`, "climax needs at least 300ms silence before it");
    }

    const before = script.segments.slice(0, climaxIndex).map((item) => item?.delivery?.intensity ?? 0);
    const hasRise = before.some((value, index) => index > 0 && value > before[index - 1]);
    if (!hasRise) add(errors, "$.segments", "must increase tension before the climax");

    const analystBeforeClimax = script.segments
      .slice(0, climaxIndex)
      .some((item) => item?.speaker === "analyst");
    if (analystBeforeClimax) add(errors, "$.segments", "analyst must not interrupt the build before the climax");
  }

  const estimatedDurationSeconds = estimateDurationSeconds(script);
  if (Number.isFinite(script.targetDurationSeconds)) {
    const lower = script.targetDurationSeconds * 0.55;
    const upper = script.targetDurationSeconds * 1.55;
    if (estimatedDurationSeconds < lower || estimatedDurationSeconds > upper) {
      add(
        errors,
        "$.targetDurationSeconds",
        `estimated spoken duration ${estimatedDurationSeconds.toFixed(1)}s is outside the broad ${lower.toFixed(1)}-${upper.toFixed(1)}s proof range`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    estimatedDurationSeconds
  };
}

export function assertValidCommentaryScript(script) {
  const result = validateCommentaryScript(script);
  if (!result.valid) {
    const details = result.errors.map((error) => `${error.path}: ${error.message}`).join("\n");
    throw new Error(`Invalid commentary script:\n${details}`);
  }
  return script;
}
