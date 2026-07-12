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

## Provider findings

### OpenAI built-in voices

Failed. `fable` was British but too posh; the remaining voices were not acceptably British.

### ElevenLabs shared voices

Steve was the only promising preview, but ElevenLabs blocks free accounts from importing it.

### ElevenLabs API Voice Design

Blocked on the free account. The API returns that creating a voice through the API requires a paid plan.

## Current Gate A — create and save a voice in the ElevenLabs web app

Use Voice Design in the browser. The voice must be British, non-posh, grounded at low intensity and capable of genuine escalation and a committed final shout.

After saving the voice to the account, run:

```powershell
npm run voice:account
```

Open the generated `listen.html` and identify the new voice's candidate number.

## Current Gate B — expressive football audition

```powershell
npm run voice:account:audition -- 1
```

Replace `1` with the selected account-voice candidate number.

Score each measure from 1 to 5:

| Measure | Question |
|---|---|
| British accent | Is the voice clearly British? |
| Not posh | Does it avoid posh, aristocratic and RP character? |
| Emotional range | Is the calm-to-pressure-to-climax difference obvious? |
| Football authenticity | Does it sound like live football commentary rather than narration? |
| Climax | Is the shout committed, intelligible and free from distortion? |

A candidate passes only when every measure scores at least 3.

## Gate C — one complete proof

After selecting a voice, integrate its provider and voice ID into one complete USB-cable proof. Confirm:

- the accent remains acceptable across a full script;
- separate segments feel like the same broadcast;
- the performance remains sincere;
- the climax is earned rather than merely loud.

## Gate D — ten-case proof

Only after Gate C passes, generate all ten reference cases.

## Stop rule

Do not begin crowd mixing, single-file rendering or public interface work until the ten-case human gate passes.
