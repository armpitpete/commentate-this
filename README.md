# Commentate This

Turn any ordinary sentence into excessively dramatic football commentary — including the tension, pause and committed final shout.

## Current status

**CT-01 — Audio Proof Foundation**

The repository currently proves the script and voice-generation pipeline. It deliberately stops before crowd mixing and public interface work because the next decision requires human listening.

## Product rule

> The event is ridiculous. The performance is not.

The commentator must never explain the joke or sound amused by it.

## Requirements

- Node.js 20 or later;
- an OpenAI API key only for live audio generation;
- no API key is needed for tests or dry runs.

## Check the foundation

```bash
npm run check
```

## Inspect a complete request without using an API

```bash
npm run proof:dry-run
```

Use another reference case:

```bash
node scripts/generate-audio-proof.mjs --dry-run --id biscuit-tea --mode cup_final --duration 25
```

## Generate a live proof package

Set `OPENAI_API_KEY` in the shell, then run:

```bash
node scripts/generate-audio-proof.mjs --id usb-cable --mode excessive --duration 30
```

The output is written under `proof-output/` and contains:

- `script.json`;
- one WAV file per speech segment;
- `manifest.json` with voice, timing and future crowd cues.

Credentials and generated audio are ignored by Git.

## Default proof models

- commentary script: `gpt-5.6` through the Responses API;
- speech: `gpt-4o-mini-tts`;
- commentator voice: `cedar`;
- analyst voice: `marin`.

These are test defaults, not final product decisions.

## Audio disclosure

Any public version must clearly state that the voice is AI-generated and is not a human commentator.

## Authority

- [Product contract](docs/PRODUCT_CONTRACT.md)
- [CT-01 scope and gate](docs/CT-01_AUDIO_PROOF.md)
- [Human listening gate](docs/HUMAN_LISTENING_GATE.md)
