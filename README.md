# Commentate This

Turn any ordinary sentence into excessively dramatic football commentary — including the tension, pause and committed final shout.

## Current status

**CT-01 — Audio Proof Foundation / Google Gemini TTS Voice Gate**

The script-generation and audio-proof foundation is working. OpenAI built-in voices failed the accent gate. The ElevenLabs free lane is closed because Voice Library speech, imports and API Voice Design require a paid plan. Azure Speech remains a fallback. The active gate is now Google Gemini 3.1 Flash TTS Preview because it provides free-tier audio generation and direct prompting for accent, pace, tone and emotion.

## Product rule

> The event is ridiculous. The performance is not.

The commentator must never explain the joke or sound amused by it.

## Requirements

- Node.js 20 or later;
- an OpenAI API key for commentary-script generation and the existing OpenAI proof lane;
- a Gemini API key from Google AI Studio for the active voice audition;
- no API keys are needed for tests or dry runs.

## Check the foundation

```bash
npm run check
npm run proof:set:dry-run
npm run voice:google:dry-run
```

## Current human gate: Google Gemini TTS

Create a Gemini API key in Google AI Studio. Set it only in the current PowerShell session:

```powershell
$env:GEMINI_API_KEY = "your-key"
```

Then run:

```powershell
git pull --ff-only
npm run check
npm run voice:google
```

The audition compares six male voice traits:

1. Fenrir — excitable;
2. Sadachbia — lively;
3. Orus — firm;
4. Puck — upbeat;
5. Iapetus — clear;
6. Charon — informative.

Each voice receives the same explicit British, non-posh, live-football direction and performs:

1. restrained setup;
2. urgent escalation;
3. committed climax.

Judge:

- British accent;
- not-posh character;
- emotional range;
- football authenticity;
- shouted climax.

A voice must score at least 3 out of 5 on every measure.

## Provider findings

### OpenAI

- `cedar` sounded North American and emotionally flat;
- `fable` was British but too posh;
- other built-in voices were not acceptably British.

### ElevenLabs free plan

The selected Voice Library candidate `nbk2esDn4RRk4cVDdoiE` returned:

```text
Free users cannot use library voices via the API.
```

Do not continue testing ElevenLabs free-plan workarounds. Steve and other promising library voices remain paid-only comparison options.

### Azure

The Azure native British audition remains available as a fallback:

```powershell
npm run voice:azure
```

It is not the current gate because Gemini TTS offers a simpler free API-key path and stronger direct performance control.

## Existing OpenAI proof commands

Generate one OpenAI proof:

```bash
npm run proof:generate -- --id usb-cable --mode excessive --duration 30
```

Generate the ten-case proof set only after a voice configuration is approved:

```bash
npm run proof:set
```

Credentials and generated audio are ignored by Git.

## Audio disclosure

Any public version must clearly state that the voice is AI-generated and is not a human commentator.

## Authority

- [Product contract](docs/PRODUCT_CONTRACT.md)
- [CT-01 scope and gate](docs/CT-01_AUDIO_PROOF.md)
- [Human listening gate](docs/HUMAN_LISTENING_GATE.md)
- [OpenAI built-in voice audition](docs/VOICE_AUDITION.md)
- [ElevenLabs voice gate](docs/ELEVENLABS_AUDITION.md)
- [Azure British voice audition](docs/AZURE_AUDITION.md)
- [Google Gemini TTS audition](docs/GOOGLE_TTS_AUDITION.md)
