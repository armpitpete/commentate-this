# CT-01 ElevenLabs Voice Gate

## Closed findings

The OpenAI built-in voices failed:

- `fable` was British but too posh;
- the other built-in voices were not acceptably British.

The original ElevenLabs shared-library search produced one promising preview, Steve, but it was paid-only. The free account also blocks Voice Design and voice creation through the API.

The account voice list contained only premade American voices, so none of those should be auditioned for CT-01.

## Current gate — direct Voice Library candidate

A human-selected ElevenLabs Voice Library link can now be auditioned directly without candidate numbering.

Current selected voice:

```text
https://elevenlabs.io/app/voice-library?voiceId=nbk2esDn4RRk4cVDdoiE
```

Voice ID:

```text
nbk2esDn4RRk4cVDdoiE
```

Run:

```powershell
git pull --ff-only
npm run voice:account:audition -- "https://elevenlabs.io/app/voice-library?voiceId=nbk2esDn4RRk4cVDdoiE"
```

The command accepts:

- an account candidate number;
- a bare ElevenLabs voice ID;
- a complete ElevenLabs Voice Library URL.

It generates the same three-stage football test:

1. restrained setup;
2. urgent escalation;
3. shouted climax.

If the API key cannot use the voice, open the Voice Library link and choose **Add to My Voices** or **Use voice**, then rerun the same command. If ElevenLabs reports that the voice is unavailable to free users, record it as paid-only.

Score British accent, not-posh character, emotional range, football authenticity and climax. Every measure must score at least 3.

## Stop rule

Do not generate the ten-case proof set, add crowd mixing or begin the public interface until one voice passes the full human gate.
