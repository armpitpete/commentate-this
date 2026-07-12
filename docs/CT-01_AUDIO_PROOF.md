# CT-01 — Audio Proof Foundation

## Goal

Prove that one ordinary sentence can become a short, funny and recognisably football-like audio performance with controlled tension and a decisive shout.

## Included

- ten fixed reference sentences;
- five dramatic modes;
- strict structured commentary schema;
- semantic validation of tension shape;
- duration estimation;
- provider-neutral prompt rules;
- OpenAI Responses API request builder;
- OpenAI Speech API segment generation;
- separate WAV segment package with manifest;
- automated tests and dry-run command.

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
- all ten reference cases can produce a valid request payload;
- a live run can save a validated script, one WAV per segment and a manifest;
- no credentials are stored in the repository.

## Human gate

The technical foundation cannot determine whether the performance is actually funny or sounds like a football broadcast. Human listening is mandatory before crowd mixing or interface work.

See `HUMAN_LISTENING_GATE.md`.

## Stop rule

Do not build the public site until at least one voice configuration passes the listening gate. A poor voice cannot be repaired by adding more interface.
