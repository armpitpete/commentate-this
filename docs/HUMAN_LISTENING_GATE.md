# CT-01 Human Listening Gate

## Why human judgement is required

Automated tests can verify structure, timing instructions and files. They cannot reliably judge:

- whether the voice is recognisably British;
- whether it sounds ordinary/regional rather than posh or Received Pronunciation;
- football-commentary authenticity;
- emotional range;
- comic timing;
- whether the shout sounds committed rather than synthetic;
- whether separate voice segments sound like one continuous performance.

## Current provider state

The OpenAI built-in audition has failed:

- `fable` was clearly British but too posh for the product;
- the other built-in voices were not acceptably British;
- no built-in OpenAI voice passed the accent gate.

The current gate is the ElevenLabs regional British audition in `ELEVENLABS_AUDITION.md`.

## Gate A — provider voice audition

Set `ELEVENLABS_API_KEY` in the local shell and run:

```powershell
npm run voice:elevenlabs
```

Open the generated `listen.html` and score each candidate from 1 to 5 for:

| Measure | Question |
|---|---|
| British accent | Is the voice clearly British? |
| Not posh | Does it avoid posh, aristocratic and RP character? |
| Emotional range | Is the calm-to-pressure-to-climax difference obvious? |
| Football authenticity | Does it sound like live football commentary rather than narration? |
| Climax | Is the shout committed, intelligible and free from distortion? |

A candidate passes Gate A only when every measure scores at least 3.

## Gate B — one complete proof

After selecting a voice, integrate its provider and voice ID into one complete USB-cable proof. Confirm:

- the accent remains acceptable across a full script;
- separate segments feel like the same broadcast;
- the performance remains sincere;
- the climax is earned rather than merely loud.

## Gate C — ten-case proof

Only after Gate B passes, generate all ten reference cases and score:

- British accent;
- not-posh character;
- emotional range;
- football authenticity;
- tension curve;
- pause;
- shout;
- continuity;
- comedy;
- restraint.

Proceed only when:

- at least 8 of 10 clips score 3 or more on every measure;
- no clip has an unintelligible or distorted climax;
- the same structural joke does not feel mechanically repeated;
- the listener would voluntarily replay at least 3 clips.

## Stop rule

Do not begin crowd mixing, single-file rendering or public interface work until Gate C passes. If no ElevenLabs candidate passes Gate A, test a third provider or a purpose-designed licensed synthetic voice rather than weakening the requirement.
