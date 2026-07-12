# CT-01 Google Gemini TTS Gate

## Why this is the active provider gate

Google Gemini 3.1 Flash TTS Preview is the strongest current fit for Commentate This because it provides:

- a free developer tier;
- direct natural-language control of accent, pace, tone and emotional delivery;
- inline performance direction such as excitement and shouting;
- several male voice traits relevant to live commentary;
- a simple Google AI Studio API key rather than a cloud resource and regional subscription key.

The active model is:

```text
gemini-3.1-flash-tts-preview
```

The API remains a preview service. It must pass the same human listening gate as every other provider.

## Closed provider findings

### OpenAI

- `cedar` sounded North American and emotionally flat;
- `fable` was British but too posh;
- other built-in voices were not acceptably British.

### ElevenLabs free plan

- Voice Library speech through the API requires a paid plan;
- shared-voice imports require a paid plan;
- API Voice Design and voice creation require a paid plan;
- the free account premade voices were American-accented.

Azure Speech remains a fallback provider but is not the active gate.

## Current audition

The Google audition compares:

1. Fenrir — excitable;
2. Sadachbia — lively;
3. Orus — firm;
4. Puck — upbeat;
5. Iapetus — clear;
6. Charon — informative.

Every voice receives the same performance contract:

- British male football commentator;
- ordinary Northern English or neutral everyday English accent;
- not posh or Received Pronunciation;
- no American sports cadence;
- sincere live-broadcast performance;
- restrained setup;
- urgent escalation;
- full committed climax;
- exact transcript with no added jokes, laughter or explanation.

## Credentials

Create a Gemini API key in Google AI Studio. Never commit or paste the key into chat.

Set it only in the current PowerShell session:

```powershell
$env:GEMINI_API_KEY = "your-key"
```

## Run

```powershell
git pull --ff-only
npm run check
npm run voice:google
```

Expected output:

```text
proof-output/google-gemini-audition-.../
  listen.html
  voice-audition-results.csv
  voice-audition.json
  01-fenrir/
  02-sadachbia/
  03-orus/
  04-puck/
  05-iapetus/
  06-charon/
```

## Human pass criteria

Score each voice from 1 to 5 for:

- British accent;
- not-posh character;
- emotional range;
- football authenticity;
- climax.

A voice passes only if every measure scores at least 3.

## Next gate

After one Google voice passes, integrate it into one complete USB-cable proof and judge:

- accent stability;
- continuity across segments;
- tension curve;
- pre-climax pause;
- final shout;
- comedy without self-awareness.

## Stop rule

Do not begin crowd mixing, single-file rendering or the public interface until a provider and voice pass the complete human gate.
