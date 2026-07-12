# CT-01 ElevenLabs Regional British Voice Audition

## Why this lane exists

The OpenAI built-in voice audition failed:

- `fable` was the only clearly British voice, but its posh/Received-Pronunciation character was unsuitable;
- the remaining built-in voices were not acceptably British;
- no OpenAI built-in candidate passed both accent and performance requirements.

The requirement is not being weakened. CT-01 now tests a provider with a shared Voice Library and expressive speech model.

## Account and API key

Create an ElevenLabs account, then create an API key from the developer API Keys page. Restrict it to voices and text-to-speech where possible and set a low credit quota.

Set it only in the current PowerShell session:

```powershell
$env:ELEVENLABS_API_KEY = "your-local-key"
```

Do not commit the key, save it in source files, or paste it into chat.

## Why the first command failed

`GET /v2/voices` lists voices already available in the account. It does not search the public Voice Library. Public shared voices are listed by `GET /v1/shared-voices` and include metadata and preview URLs.

CT-01 now separates discovery from expressive generation.

## Stage A — Voice Library discovery

```powershell
git pull --ff-only
npm run check
npm run voice:elevenlabs
```

This searches the shared Voice Library using broad British, English, Northern, regional and football terms. It does not add voices to the account and does not spend text-to-speech credits.

Output:

```text
proof-output/
└── elevenlabs-library-...
    ├── listen.html
    ├── voice-library-results.csv
    └── voice-library.json
```

Open `listen.html`. The page plays each public library preview. Reject voices that are American, posh/RP, audiobook-like or otherwise unsuitable. Select at most three candidate numbers.

## Stage B — selected expressive audition

Use the exact manifest path printed by Stage A:

```powershell
npm run voice:elevenlabs:audition -- --manifest "proof-output\elevenlabs-library-...\voice-library.json" --candidates 1,3
```

This command:

1. adds only the selected shared voices to the ElevenLabs account;
2. generates a restrained setup;
3. generates an urgent escalation;
4. generates a shouted climax;
5. creates a listening page and scoring CSV.

Output:

```text
proof-output/
└── elevenlabs-expressive-...
    ├── listen.html
    ├── voice-audition-results.csv
    ├── voice-audition.json
    └── one folder per selected candidate
```

## Score

Score each selected candidate from 1 to 5 for:

- British accent;
- not posh;
- emotional range;
- football authenticity;
- climax.

A candidate passes only if every measure scores at least 3. Prefer an ordinary regional or neutral British broadcast voice. Northern English is preferred but not mandatory.

## Stop rule

Do not generate the ten-case proof set until one candidate passes. If no ElevenLabs candidate passes, record the failure and test a third provider or a purpose-designed licensed synthetic voice.
