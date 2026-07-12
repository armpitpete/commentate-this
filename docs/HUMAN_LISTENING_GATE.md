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

## Closed OpenAI built-in voice finding

The OpenAI built-in voice gate failed:

- `cedar` sounded North American and emotionally flat;
- `fable` was clearly British but too posh;
- the other built-in candidates were not acceptably British.

## Current Gate A — ElevenLabs Voice Library discovery

Set `ELEVENLABS_API_KEY` in the local shell. Never save the key in the repository or paste it into chat.

```powershell
git pull --ff-only
npm run check
npm run voice:elevenlabs
```

Open the generated `proof-output/elevenlabs-library-.../listen.html`. Reject American, posh/RP, audiobook-like and unsuitable voices. Select one to three candidate numbers.

## Current Gate B — expressive football audition

The command automatically uses the newest generated `voice-library.json`:

```powershell
npm run voice:elevenlabs:audition -- 1,3
```

Replace `1,3` with the selected candidate numbers.

Score each candidate from 1 to 5 for:

| Measure | Question |
|---|---|
| British accent | Does it sound naturally British? |
| Not posh | Does it avoid RP, aristocratic or overly polished delivery? |
| Emotional range | Is there an obvious calm-to-pressure-to-climax change? |
| Football authenticity | Does it sound like live football commentary rather than narration? |
| Climax | Is the final shout forceful, intelligible and free from distortion? |

A candidate passes only when every measure scores at least 3.

## Later complete-proof gate

After a provider voice passes the short audition, integrate it into one complete USB-cable proof. Then judge continuity, accent stability, tension curve, pause, shout, comedy and restraint before generating the full ten-case proof set.

## Stop rule

Do not start crowd mixing, single-file rendering or the public interface until a provider/voice configuration passes the complete human gate.
