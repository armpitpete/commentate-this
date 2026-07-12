# CT-01 ElevenLabs Voice Gate

## Closed findings

### OpenAI built-in voices

- `cedar` was North American and emotionally flat;
- `fable` was British but too posh/Received Pronunciation;
- no OpenAI built-in voice passed.

### Shared Voice Library

- candidates 1–11 were Indian-accented or too quiet;
- candidate 12, **Steve — Calm, Expressive and Balanced**, was the only promising preview;
- Steve is unavailable to free users and remains a paid-only fallback.

### API Voice Design

ElevenLabs includes Voice Design in the free web app, but both the Voice Design API and API voice creation are restricted to paid plans. The repository must not describe those API calls as a free-plan workflow.

## Current free-plan workflow

### Stage A — create the voice in the ElevenLabs web app

Use Voice Design in the browser and save a voice with this contract:

- British male football commentator;
- ordinary Northern English or neutral everyday English accent;
- not posh or Received Pronunciation;
- grounded at low intensity;
- urgent during escalation;
- capable of a full, intelligible final shout;
- not American sports-announcer cadence;
- not audiobook narration.

This is the only manual creation step.

### Stage B — discover saved account voices

```powershell
git pull --ff-only
npm run check
npm run voice:account
```

The command calls the account voice endpoint and creates:

```text
proof-output/
└── elevenlabs-account-...
    ├── listen.html
    ├── account-voices.json
    └── account-voices.csv
```

Open `listen.html` and identify the candidate number of the newly saved voice.

### Stage C — football-test the selected account voice

```powershell
npm run voice:account:audition -- 1
```

Replace `1` with the selected candidate number. The command does not create or import a voice. It uses the saved voice ID directly and generates:

1. restrained setup;
2. urgent escalation;
3. shouted climax.

## Score

Score from 1 to 5 for:

- British accent;
- not-posh character;
- emotional range;
- football authenticity;
- climax.

A candidate passes only if every measure scores at least 3.

## Stop rule

Do not subscribe merely to test Steve. Do not begin crowd mixing, single-file rendering or the public interface until an account voice passes the complete human gate.
