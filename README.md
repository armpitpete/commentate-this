# Commentate This

Turn any ordinary sentence into excessively dramatic football commentary — including the tension, pause and committed final shout.

## Current status

**CT-01 — Audio Proof Foundation / Provider Voice Gate**

The script-generation and audio-proof foundation is working. OpenAI built-in voices failed the accent gate. ElevenLabs free-plan voice creation and importing are restricted, so CT-01 now supports direct football audition of a human-selected Voice Library link or voice ID.

## Product rule

> The event is ridiculous. The performance is not.

The commentator must never explain the joke or sound amused by it.

## Requirements

- Node.js 20 or later;
- an OpenAI API key for commentary-script generation and the existing OpenAI proof lane;
- an ElevenLabs API key for direct voice audition and speech generation;
- no API keys are needed for tests or dry runs.

## Check the foundation

```bash
npm run check
npm run proof:set:dry-run
npm run voice:account:audition:dry-run
```

## Current human gate: direct ElevenLabs Voice Library candidate

Current selected link:

```text
https://elevenlabs.io/app/voice-library?voiceId=nbk2esDn4RRk4cVDdoiE
```

Run:

```powershell
git pull --ff-only
npm run voice:account:audition -- "https://elevenlabs.io/app/voice-library?voiceId=nbk2esDn4RRk4cVDdoiE"
```

The command also accepts the bare voice ID:

```powershell
npm run voice:account:audition -- nbk2esDn4RRk4cVDdoiE
```

If ElevenLabs refuses access, open the link and choose **Add to My Voices** or **Use voice**, then rerun. If ElevenLabs says the voice is unavailable to free users, record the candidate as paid-only.

Judge:

- British accent;
- not-posh character;
- emotional range;
- football authenticity;
- shouted climax.

A voice must score at least 3 out of 5 on every measure.

## Existing account-list workflow

The repository can still list voices already available in the account:

```powershell
npm run voice:account
```

The current account list contained only premade American voices, so those should not be used for CT-01.

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
