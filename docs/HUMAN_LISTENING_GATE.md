# CT-01 Human Listening Gate

## Why human judgement is required

Automated tests can verify structure, timing instructions and files. They cannot reliably judge:

- football-commentary authenticity;
- comic timing;
- whether the shout sounds committed rather than synthetic;
- whether separate voice segments sound like one continuous performance;
- whether the result is funny after repeated use.

## Proof set

Generate the ten fixed reference sentences in `excessive` mode at 30 seconds.

Initial voice comparison:

- commentator: `cedar`;
- analyst: `marin`.

These are starting defaults, not an approved identity.

## Rating sheet

Score each clip from 1 to 5:

| Measure | Question |
|---|---|
| Football authenticity | Does it sound like live football commentary rather than an actor reading prose? |
| Tension curve | Does the pace genuinely build? |
| Pause | Is there enough silence before the climax? |
| Shout | Is the climax forceful, intelligible and free from distortion? |
| Continuity | Do the separately generated segments sound like one broadcast? |
| Comedy | Is the disproportionate seriousness actually funny? |
| Restraint | Does it avoid constant clichés, shouting and explanation? |

Record one specific failure note for any score below 3.

## Pass threshold

Proceed only when:

- at least 8 of 10 clips score 3 or more on every measure;
- no clip has an unintelligible or distorted climax;
- the same structural joke does not feel mechanically repeated across the set;
- the listener would voluntarily replay at least 3 clips.

## Possible outcomes

### Pass

Proceed to CT-02: crowd timing and single-file audio assembly.

### Conditional pass

Revise prompts, segmentation or voice directions and repeat only the failed reference cases.

### Fail

Test another voice provider or a different segmentation strategy. Do not build the website.
