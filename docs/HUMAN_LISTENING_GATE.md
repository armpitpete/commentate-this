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

## Closed findings

The OpenAI built-in voice gate failed. The ElevenLabs free account also blocks several relevant voice-import and API creation routes. The account's visible premade voices were all American-accented.

## Current Gate A — direct Voice Library audition

Current selected candidate:

```text
https://elevenlabs.io/app/voice-library?voiceId=nbk2esDn4RRk4cVDdoiE
```

Run:

```powershell
git pull --ff-only
npm run voice:account:audition -- "https://elevenlabs.io/app/voice-library?voiceId=nbk2esDn4RRk4cVDdoiE"
```

The command extracts the voice ID from the URL and generates:

1. calm setup;
2. urgent escalation;
3. shouted climax.

If the API key cannot use the voice, open the link and choose **Add to My Voices** or **Use voice**, then rerun. A paid-only response closes this candidate on the free plan.

Score from 1 to 5:

| Measure | Question |
|---|---|
| British accent | Does it sound naturally British? |
| Not posh | Does it avoid RP, aristocratic or overly polished delivery? |
| Emotional range | Is there an obvious calm-to-pressure-to-climax change? |
| Football authenticity | Does it sound like live football commentary rather than narration? |
| Climax | Is the final shout forceful, intelligible and free from distortion? |

A candidate passes only when every measure scores at least 3.

## Later complete-proof gate

After the short audition passes, integrate the voice into one complete USB-cable proof. Judge continuity, accent stability, tension curve, pause, shout, comedy and restraint before generating the full ten-case proof set.

## Stop rule

Do not start crowd mixing, single-file rendering or the public interface until a provider/voice configuration passes the complete human gate.
