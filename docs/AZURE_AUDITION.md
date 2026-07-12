# CT-01 Azure British Voice Audition

## Why this lane exists

The free ElevenLabs lane is closed:

- shared Voice Library imports require a paid plan;
- Voice Library speech through the API requires a paid plan;
- Voice Design and voice creation through the API require a paid plan;
- the free account's premade voices were American-accented.

Azure Speech provides native `en-GB` neural voices and an F0 allowance suitable for a bounded audition.

## Azure resource

Create an Azure Speech resource on the Free F0 tier where available. Record:

- the Speech resource key;
- the resource region, such as `uksouth`.

Set them only in the current PowerShell session:

```powershell
$env:AZURE_SPEECH_KEY = "your-resource-key"
$env:AZURE_SPEECH_REGION = "uksouth"
```

Do not save keys in repository files or paste them into chat.

## Run the audition

```powershell
git pull --ff-only
npm run check
npm run voice:azure
```

The audition compares four native British male voices:

1. `en-GB-RyanNeural`;
2. `en-GB-OliverNeural`;
3. `en-GB-ThomasNeural`;
4. `en-GB-AlfieNeural`.

Each performs:

1. restrained setup;
2. urgent escalation;
3. committed climax.

Azure SSML controls rate, pitch and volume. Ryan also uses supported `chat` and `cheerful` speaking styles.

## Output

```text
proof-output/
└── azure-audition-...
    ├── listen.html
    ├── voice-audition-results.csv
    ├── voice-audition.json
    └── one folder per voice
```

## Score

Score each voice from 1 to 5 for:

- British accent;
- not-posh character;
- emotional range;
- football authenticity;
- climax.

A candidate passes only if every measure scores at least 3.

## Stop rule

Do not begin crowd mixing, single-file rendering or the public interface until one voice passes the complete human gate. If every Azure voice is too polished or emotionally weak, close Azure and evaluate another provider rather than weakening the requirement.
