# CT-01 ElevenLabs Regional British Voice Audition

## Why this lane exists

The OpenAI built-in voice audition failed:

- `fable` was the only clearly British voice, but its posh/Received-Pronunciation character was unsuitable;
- the remaining built-in voices were not acceptably British;
- no OpenAI built-in candidate passed both accent and performance requirements.

The requirement is not being weakened. CT-01 now tests a provider with a searchable voice library and expressive speech model.

## Account and API key

Create an ElevenLabs account, then create an API key from the developer API Keys page:

`https://elevenlabs.io/app/developers/api-keys`

Restrict the key to the voices and text-to-speech endpoints where possible, and set a low credit quota for the audition.

Set it only in the current PowerShell session:

```powershell
$env:ELEVENLABS_API_KEY = "your-local-key"
```

Do not commit the key, save it in source files, or paste it into chat.

## Run the audition

```powershell
git pull --ff-only
npm run check
npm run voice:elevenlabs
```

The command searches the account's available voices using:

- Northern English;
- Yorkshire;
- Manchester;
- British sports;
- British commentator;
- football commentary.

It ranks likely voices, rewards regional and sports-commentary descriptions, and penalises posh, aristocratic and Received-Pronunciation descriptions.

## Output

The command creates:

```text
proof-output/
└── elevenlabs-audition-...
    ├── listen.html
    ├── voice-audition-results.csv
    ├── voice-audition.json
    └── one folder per candidate
```

Each candidate performs the same:

1. restrained setup;
2. urgent escalation;
3. shouted climax.

The default model is `eleven_v3`. The test uses regional-accent and emotional audio tags, expressive stability settings, and separate generation for each performance stage.

## Score

Score each candidate from 1 to 5 for:

- British accent;
- not posh;
- emotional range;
- football authenticity;
- climax.

A candidate passes only if every measure scores at least 3. Prefer an ordinary regional or neutral British broadcast voice. Northern English is preferred but not mandatory.

## Stop rule

Do not generate the ten-case proof set until one candidate passes. If no ElevenLabs candidate passes, record the failure and test a third provider or a purpose-designed licensed synthetic voice.
