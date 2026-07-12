# CT-01 Voice Audition

## Purpose

The first live proof used `cedar` and failed because it sounded North American and emotionally flat. The next step is not another ten-case run. It is a controlled comparison of several built-in voices using identical material.

## Run

```powershell
npm run voice:audition
```

Default candidates:

- `fable`;
- `ash`;
- `onyx`;
- `cedar`.

A different set can be supplied:

```powershell
npm run voice:audition -- --voices fable,marin,verse
```

## Listen

Open the generated top-level `listen.html`. Each candidate performs:

1. restrained setup;
2. urgent escalation;
3. shouted climax.

No crowd sound is included.

## Score

Complete `voice-audition-results.csv` with scores from 1 to 5 for:

- British accent;
- emotional range;
- football authenticity;
- climax.

A candidate passes only when every measure scores at least 3. Select one preferred voice before generating another complete proof.

## Stop rule

If no built-in voice passes, do not soften the requirement. Test another speech provider or segmentation approach.
