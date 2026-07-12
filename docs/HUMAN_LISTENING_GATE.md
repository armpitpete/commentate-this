# CT-01 Human Listening Gate

## Why human judgement is required

Automated tests can verify structure, timing instructions and files. They cannot reliably judge:

- whether the accent sounds genuinely British;
- football-commentary authenticity;
- emotional range and tension;
- whether the shout sounds committed rather than synthetic;
- whether separate voice segments sound like one continuous performance;
- comic timing;
- whether the result remains funny after repeated use.

## Gate A — commentator voice audition

Set `OPENAI_API_KEY` in the local shell. Never save the key in the repository or paste it into chat.

PowerShell:

```powershell
$env:OPENAI_API_KEY = "your-local-key"
npm run voice:audition
```

The default audition compares:

- `fable`;
- `ash`;
- `onyx`;
- `cedar`.

Every voice performs the same three-part sequence:

1. controlled setup;
2. urgent escalation;
3. full shouted climax.

Open the generated top-level `listen.html` and enter whole-number scores from 1 to 5 in `voice-audition-results.csv`.

| Measure | Question |
|---|---|
| British accent | Does it sound like native British English rather than North American speech? |
| Emotional range | Is there an unmistakable difference between calm, pressure and release? |
| Football authenticity | Does it sound like live British football commentary rather than narration or advertising? |
| Climax | Is the shout forceful, intelligible and emotionally committed? |

A commentator candidate passes Gate A only when every measure scores at least 3. Mark one preferred voice. Do not generate the ten-case set until a voice passes.

## Gate B — generate one complete proof

Run one complete USB-cable proof with the preferred voice:

```powershell
npm run proof:generate -- --id usb-cable --mode excessive --duration 30 --commentator-voice <preferred-voice>
```

Open its `listen.html` and confirm:

- British accent is maintained across every segment;
- the setup is restrained;
- urgency rises clearly;
- the climax is substantially more emotional than the setup;
- the analyst, when present, does not sound like the same performance level as the commentator.

If this fails, return to Gate A or revise the speech-performance contract. Do not generate ten clips.

## Gate C — generate the ten-case proof set

```powershell
npm run proof:set -- --commentator-voice <preferred-voice>
```

This generates all ten fixed reference sentences in `excessive` mode at a target of 30 seconds.

Open the generated top-level `listen.html`. Each case has a **Play complete commentary** button that preserves the scripted pauses. No crowd audio is present.

## Ten-case rating sheet

Enter scores in the generated `listening-results.csv`.

Score each case from 1 to 5:

| Measure | Question |
|---|---|
| Football authenticity | Does it sound like live football commentary rather than an actor reading prose? |
| British accent | Does the accent remain recognisably British throughout? |
| Emotional range | Is there real contrast between setup, escalation and climax? |
| Tension curve | Does the pace genuinely build? |
| Pause | Is there enough silence before the climax? |
| Shout | Is the climax forceful, intelligible and free from distortion? |
| Continuity | Do the separately generated segments sound like one broadcast? |
| Comedy | Is the disproportionate seriousness actually funny? |
| Restraint | Does it avoid constant clichés, shouting and explanation? |

Use whole-number scores from 1 to 5. Enter `yes` or `no` in `replay`. Record one specific failure note for any score below 3.

## Pass threshold

Proceed only when:

- at least 8 of 10 clips score 3 or more on every measure;
- no clip loses the British accent materially;
- no clip has an unintelligible or distorted climax;
- the same structural joke does not feel mechanically repeated across the set;
- the listener would voluntarily replay at least 3 clips.

## Possible outcomes

### Pass

Proceed to CT-02: crowd timing and single-file audio assembly.

### Conditional pass

Revise prompts, segmentation or voice directions and repeat only the failed reference cases.

### Fail

Test another built-in voice, another provider or a different segmentation strategy. Do not build the website.
