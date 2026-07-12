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
- ElevenLabs voice search and Eleven v3 audition generation;
- deterministic ranking that rewards regional British sports voices and penalises posh/RP descriptions;
- separate audio segment packages with manifests;
- automated tests and dry-run commands.

## Excluded

- crowd-effect assets;
- FFmpeg mixing;
- browser product interface;
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
- OpenAI and ElevenLabs audition plans pass dry-run validation;
- live runs can save audio and manifests;
- no credentials are stored in the repository.

## Voice finding

The OpenAI built-in voice lane has failed: `fable` was British but too posh, while the other built-in candidates were not acceptably British.

The active gate is now:

```powershell
npm run voice:elevenlabs
```

A voice must be British, non-posh, emotionally responsive and recognisably suitable for live football commentary.

## Human gate

The technical foundation cannot determine whether the performance is actually funny or sounds like a football broadcast. Human listening is mandatory before crowd mixing or interface work.

See `HUMAN_LISTENING_GATE.md` and `ELEVENLABS_AUDITION.md`.

## Stop rule

Do not build the public site until at least one provider/voice configuration passes the complete listening gate. A poor voice cannot be repaired by adding more interface.
