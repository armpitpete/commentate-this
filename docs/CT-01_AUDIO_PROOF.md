# CT-01 — Audio Proof Foundation

## Goal

Prove that an ordinary sentence can become a sincerely performed British football commentary with a controlled setup, rising tension, a real pause and one committed shouted climax.

## Current finding

The first live `cedar` proof failed the human gate because it sounded North American and emotionally flat. That result is now treated as useful evidence, not an approved baseline.

## Included in CT-01

- ten fixed reference sentences;
- five dramatic modes;
- strict structured commentary schema;
- semantic validation and repair;
- duration estimation;
- provider-neutral script rules;
- explicit native-British speech contract;
- role-specific emotional performance instructions;
- OpenAI Responses API script generation;
- OpenAI Speech API segment generation;
- built-in voice audition across several candidates;
- one complete proof before batch generation;
- timed local listening players;
- accent and emotional-range scoring;
- automated tests and dry-run commands.

## Excluded

- crowd-effect assets;
- FFmpeg mixing;
- browser interface;
- user accounts;
- sharing and downloads;
- live microphone input;
- voice cloning;
- named-commentator imitation;
- production deployment.

## Machine gate

CT-01 foundation passes when:

- `npm run check` passes;
- the schema and runtime validator agree;
- the voice-audition plan passes its dry run;
- all ten reference cases can produce a valid request payload;
- a live run can save a validated script, one WAV per segment, a manifest and a timed player;
- no credentials are stored in the repository.

## Required human order

1. Run `npm run voice:audition`.
2. Score British accent, emotional range, football authenticity and climax.
3. Select one passing commentator voice.
4. Generate one complete USB-cable proof with that voice.
5. Only then generate the ten-case proof set.
6. Record Pass, Conditional pass or Fail in issue #2.

## Stop rule

Do not build crowd mixing, single-file rendering or the public interface until:

- a built-in or alternative voice passes the British-accent gate;
- the setup-to-climax emotional contrast is obvious;
- the full ten-case listening threshold passes.

If no built-in voice passes, test another speech provider. Do not lower the British-accent requirement to preserve the current implementation.
