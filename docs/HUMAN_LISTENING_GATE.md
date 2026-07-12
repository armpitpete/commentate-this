# CT-01 Human Listening Gate

## Why human judgement is required

Automated tests can verify structure, timing instructions and files. They cannot reliably judge:

- whether the voice sounds genuinely British;
- whether it avoids an unsuitable posh/Received-Pronunciation character;
- football-commentary authenticity;
- emotional range and comic timing;
- whether the shout sounds committed rather than synthetic;
- whether separate voice segments sound like one continuous performance;
- whether the result is funny after repeated use.

## Closed provider findings

### OpenAI built-in voices

- `cedar` sounded North American and emotionally flat;
- `fable` was clearly British but too posh;
- the other built-in candidates were not acceptably British.

### ElevenLabs free plan

The free lane is closed. Voice Library speech, shared-voice imports and API Voice Design require a paid plan. The selected library voice returned HTTP 402.

### Azure

Azure native British voices remain a fallback audition, but they are not the active gate.

## Current Gate A — Google Gemini TTS voice audition

Create a Gemini API key in Google AI Studio. Set it only in the current shell:

```powershell
$env:GEMINI_API_KEY = "your-key"
```

Then run:

```powershell
git pull --ff-only
npm run check
npm run voice:google
```

The audition compares Fenrir, Sadachbia, Orus, Puck, Iapetus and Charon. Each receives explicit ordinary-British, non-posh live-football direction and performs the same setup, escalation and climax.

Score each candidate from 1 to 5 for:

| Measure | Question |
|---|---|
| British accent | Does it sound naturally British? |
| Not posh | Does it avoid RP, aristocratic or overly polished delivery? |
| Emotional range | Is there an obvious calm-to-pressure-to-climax change? |
| Football authenticity | Does it sound like live football commentary rather than narration? |
| Climax | Is the final shout forceful, intelligible and free from distortion? |

A candidate passes only when every measure scores at least 3.

## Current Gate B — complete USB-cable proof

After one Google voice passes the short audition, integrate it into one complete USB-cable proof. Judge continuity, accent stability, tension curve, pause, shout, comedy and restraint before generating the full ten-case proof set.

## Stop rule

Do not start crowd mixing, single-file rendering or the public interface until a provider and voice pass the complete human gate.
