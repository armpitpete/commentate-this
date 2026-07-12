# Commentate This

Turn any ordinary sentence into excessively dramatic football commentary — including the tension, pause and committed final shout.

## Current status

**CT-01 — Audio Proof Foundation / Provider Voice Gate**

The script-generation and audio-proof foundation is working. OpenAI built-in voices failed the accent gate. ElevenLabs shared Voice Library produced one promising voice, Steve, but it is paid-only. ElevenLabs also restricts API Voice Design to paid plans even though Voice Design is available in the free web app.

The current free-plan gate is therefore:

1. design and save a voice manually in the ElevenLabs web app;
2. discover that saved account voice through the API;
3. run the repository's calm–pressure–climax football audition against it.

## Product rule

> The event is ridiculous. The performance is not.

The commentator must never explain the joke or sound amused by it.

## Requirements

- Node.js 20 or later;
- an OpenAI API key for commentary-script generation and the existing OpenAI proof lane;
- an ElevenLabs API key for account voice discovery and speech generation;
- no API keys are needed for tests or dry runs.

## Check the foundation

```bash
npm run check
npm run proof:set:dry-run
npm run voice:account:dry-run
npm run voice:account:audition:dry-run
```

## Current human gate: free-plan ElevenLabs web-app voice

### Stage A — design and save the voice in the web app

Use ElevenLabs Voice Design in the browser. Create an ordinary British male football commentator voice with:

- a Northern English or neutral everyday English accent;
- no posh or Received-Pronunciation character;
- a grounded low-intensity delivery;
- strong escalation and a credible final shout;
- no American sports-announcer cadence;
- no audiobook narration.

Suggested design text:

```text
A British male football commentator in his forties with an ordinary Northern English accent. Warm, grounded and conversational at low intensity, then fast, urgent and genuinely excited as play develops. Capable of a full committed goal shout without becoming shrill or distorted. Not posh, not Received Pronunciation, not aristocratic, not an audiobook narrator, and not an American sports announcer. Clear consonants, natural British football rhythm, broad emotional range, and believable live-broadcast energy.
```

Save the chosen voice to the ElevenLabs account.

### Stage B — list saved account voices

```powershell
git pull --ff-only
npm run check
npm run voice:account
```

Open the generated `proof-output/elevenlabs-account-.../listen.html` and identify the candidate number of the newly saved voice.

### Stage C — generate the football audition

```powershell
npm run voice:account:audition -- 1
```

Replace `1` with the actual candidate number.

Judge:

- British accent;
- not-posh character;
- emotional range;
- football authenticity;
- shouted climax.

A voice must score at least 3 out of 5 on every measure.

## Paid fallback

**Steve — Calm, Expressive and Balanced** remains the only promising shared-library preview found so far, but ElevenLabs does not permit free users to add it to their account. Do not subscribe merely to test it.

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
- [ElevenLabs regional British audition](docs/ELEVENLABS_AUDITION.md)
