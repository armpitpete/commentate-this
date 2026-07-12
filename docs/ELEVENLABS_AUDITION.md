# CT-01 ElevenLabs Voice Gate

## Closed findings

The OpenAI built-in voices failed:

- `fable` was British but too posh;
- the other built-in voices were not acceptably British.

The ElevenLabs shared Voice Library preview produced one promising candidate:

- **Steve — Calm, Expressive and Balanced**.

Steve could not be imported on the free plan. ElevenLabs returned: `This voice is not available for free users. Please upgrade your plan.`

The repository now displays shared-voice free-plan availability before selection. Steve remains a paid-only fallback, not an approved product voice.

## Current gate — free Voice Design

ElevenLabs includes Voice Design on the free plan. CT-01 uses it to generate purpose-built candidates with this contract:

- British male;
- ordinary Northern English accent;
- not posh or Received Pronunciation;
- calm and grounded at low intensity;
- urgent and fast during escalation;
- capable of a committed, intelligible football climax;
- not an audiobook narrator;
- not an American sports announcer.

### Stage A — generate designed previews

```powershell
git pull --ff-only
npm run check
npm run voice:design
```

Open the generated `proof-output/elevenlabs-designed-.../listen.html` and choose one candidate number.

### Stage B — create and football-test one design

```powershell
npm run voice:design:audition -- 1
```

Replace `1` with the selected candidate. The command automatically finds the newest `voice-design.json`, creates only that voice, and generates:

1. restrained setup;
2. urgent escalation;
3. shouted climax.

Score British accent, not-posh character, emotional range, football authenticity and climax. Every measure must score at least 3.

## Paid fallback

The current ElevenLabs Starter plan is a paid option if Steve later justifies a controlled comparison. Do not subscribe merely to discover whether he can perform. Complete the free Voice Design gate first.

## Stop rule

Do not generate the ten-case proof set, add crowd mixing or begin the public interface until one voice passes the full human gate.
