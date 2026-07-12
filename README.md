# Commentate This

Turn any ordinary sentence into excessively dramatic football commentary — including the tension, pause and committed final shout.

## Current status

**CT-01 — Audio Proof Foundation / Azure Voice Gate**

The script-generation and audio-proof foundation is working. OpenAI built-in voices failed the accent gate. The ElevenLabs free lane is closed because Voice Library speech, imports and API Voice Design require a paid plan. CT-01 is now testing native British male voices through Azure Speech F0.

## Product rule

> The event is ridiculous. The performance is not.

The commentator must never explain the joke or sound amused by it.

## Requirements

- Node.js 20 or later;
- an OpenAI API key for commentary-script generation and the existing OpenAI proof lane;
- an Azure Speech resource key and region for the active British voice audition;
- no API keys are needed for tests or dry runs.

## Check the foundation

```bash
npm run check
npm run proof:set:dry-run
npm run voice:azure:dry-run
```

## Current human gate: Azure native British voices

Create an Azure Speech resource on the Free F0 tier where available. Set its key and region only in the current PowerShell session:

```powershell
$env:AZURE_SPEECH_KEY = "your-resource-key"
$env:AZURE_SPEECH_REGION = "uksouth"
```

Then run:

```powershell
git pull --ff-only
npm run check
npm run voice:azure
```

The audition compares:

1. `en-GB-RyanNeural`;
2. `en-GB-OliverNeural`;
3. `en-GB-ThomasNeural`;
4. `en-GB-AlfieNeural`.

Each voice performs a restrained setup, urgent escalation and committed climax. Judge:

- British accent;
- not-posh character;
- emotional range;
- football authenticity;
- shouted climax.

A voice must score at least 3 out of 5 on every measure.

## Closed ElevenLabs free lane

The selected Voice Library candidate `nbk2esDn4RRk4cVDdoiE` returned:

```text
Free users cannot use library voices via the API.
```

Do not continue testing ElevenLabs free-plan workarounds. Steve and other promising library voices remain paid-only comparison options.

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
