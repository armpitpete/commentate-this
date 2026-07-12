# Commentate This

Turn any ordinary sentence into excessively dramatic football commentary — including the tension, pause and committed final shout.

## Current status

**CT-01 — Audio Proof Foundation**

The repository proves the script and voice-generation pipeline. It deliberately stops before crowd mixing and public interface work because the next decision requires human listening.

## Product rule

> The event is ridiculous. The performance is not.

The commentator must never explain the joke or sound amused by it.

## Requirements

- Node.js 20 or later;
- an OpenAI API key only for live audio generation;
- no API key for tests or dry runs.

## Check the foundation

```bash
npm run check
npm run proof:set:dry-run
```

## Generate one live proof

Set `OPENAI_API_KEY` in the local shell. Never save it in the repository or paste it into chat.

PowerShell:

```powershell
$env:OPENAI_API_KEY = "your-local-key"
npm run proof:generate -- --id usb-cable --mode excessive --duration 30
```

Bash:

```bash
export OPENAI_API_KEY="your-local-key"
npm run proof:generate -- --id usb-cable --mode excessive --duration 30
```

Each proof package contains:

- `script.json`;
- one WAV file per speech segment;
- `manifest.json` with voice, timing and future crowd cues;
- `listen.html`, which plays the segments in order with the scripted pauses.

## Generate the complete human-listening set

```bash
npm run proof:set
```

This generates all ten fixed cases under one dated folder in `proof-output/`, including:

- a top-level `listen.html` index;
- one timed listening player per case;
- `proof-set.json`;
- `listening-results.csv` ready for the required 1–5 scores.

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
