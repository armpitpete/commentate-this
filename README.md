# Commentate This

Turn any ordinary sentence into excessively dramatic football commentary — including the tension, pause and committed final shout.

## Current status

**CT-01 — Audio Proof Foundation / Provider Voice Gate**

The script-generation and audio-proof foundation is working. The OpenAI built-in voice audition has failed: `fable` was British but too posh, while the other built-in voices were not acceptably British. CT-01 is now testing regional British voices through ElevenLabs before any crowd mixing or public interface work.

## Product rule

> The event is ridiculous. The performance is not.

The commentator must never explain the joke or sound amused by it.

## Requirements

- Node.js 20 or later;
- an OpenAI API key for commentary-script generation and the existing OpenAI proof lane;
- an ElevenLabs API key for the current regional British voice audition;
- no API keys are needed for tests or dry runs.

## Check the foundation

```bash
npm run check
npm run proof:set:dry-run
npm run voice:elevenlabs:dry-run
```

## Current human gate: ElevenLabs regional British audition

Set the ElevenLabs key only in the local shell:

```powershell
$env:ELEVENLABS_API_KEY = "your-local-key"
```

### Stage A — discover shared Voice Library candidates

```powershell
git pull --ff-only
npm run check
npm run voice:elevenlabs
```

Open the generated `proof-output/elevenlabs-library-.../listen.html`. Choose one to three candidate numbers after rejecting American, posh/RP, audiobook-like and otherwise unsuitable voices.

### Stage B — generate expressive football clips

The command automatically finds the newest generated `voice-library.json`:

```powershell
npm run voice:elevenlabs:audition -- 1,3
```

Replace `1,3` with the actual candidate numbers selected in Stage A.

Score each selected candidate for:

- British accent;
- not-posh character;
- emotional range;
- football authenticity;
- shouted climax.

A voice must score at least 3 out of 5 on every measure.

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
