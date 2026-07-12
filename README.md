# Commentate This

Turn any ordinary sentence into excessively dramatic football commentary — including the tension, pause and committed final shout.

## Current status

**CT-01 — Audio Proof Foundation**

The repository proves the script and voice-generation pipeline. It deliberately stops before crowd mixing and public interface work because the next decision requires human listening.

## Product rule

> The event is ridiculous. The performance is not.

The commentator must never explain the joke or sound amused by it.

The performance contract also requires:

- native British English;
- a neutral UK football-broadcast accent;
- clear emotional contrast between setup, pressure and climax;
- no North American sports-announcer cadence;
- one committed but intelligible final shout.

## Requirements

- Node.js 20 or later;
- an OpenAI API key only for live audio generation;
- no API key for tests or dry runs.

## Check the foundation

```bash
npm run check
npm run proof:set:dry-run
npm run voice:audition:dry-run
```

## Audition the commentator voices first

Set `OPENAI_API_KEY` in the local shell. Never save it in the repository or paste it into chat.

PowerShell:

```powershell
$env:OPENAI_API_KEY = "your-local-key"
npm run voice:audition
```

The default audition compares `fable`, `ash`, `onyx` and `cedar` using the same controlled setup, urgent escalation and shouted climax.

To compare a different set:

```powershell
npm run voice:audition -- --voices fable,marin,verse
```

Open the generated top-level `listen.html`, then complete `voice-audition-results.csv`. Choose the commentator voice by ear; a built-in voice name does not guarantee a British accent.

## Generate one live proof

After selecting a voice:

```powershell
npm run proof:generate -- --id usb-cable --mode excessive --duration 30 --commentator-voice fable
```

Bash:

```bash
export OPENAI_API_KEY="your-local-key"
npm run proof:generate -- --id usb-cable --mode excessive --duration 30 --commentator-voice fable
```

Each proof package contains:

- `script.json`;
- one WAV file per speech segment;
- `manifest.json` with voice, accent contract, timing and future crowd cues;
- `listen.html`, which plays the segments in order with the scripted pauses.

## Generate the complete human-listening set

Only after one voice passes the audition:

```bash
npm run proof:set -- --commentator-voice fable
```

This generates all ten fixed cases under one dated folder in `proof-output/`, including:

- a top-level `listen.html` index;
- one timed listening player per case;
- `proof-set.json`;
- `listening-results.csv` ready for the required 1–5 scores, including British accent and emotional range.

Credentials and generated audio are ignored by Git.

## Default proof models

- commentary script: `gpt-5.6` through the Responses API;
- speech: `gpt-4o-mini-tts`;
- commentator audition default: `fable`;
- analyst audition default: `cedar`.

These are test candidates, not approved product identities.

## Audio disclosure

Any public version must clearly state that the voice is AI-generated and is not a human commentator.

## Authority

- [Product contract](docs/PRODUCT_CONTRACT.md)
- [CT-01 scope and gate](docs/CT-01_AUDIO_PROOF.md)
- [Voice audition](docs/VOICE_AUDITION.md)
- [Human listening gate](docs/HUMAN_LISTENING_GATE.md)
