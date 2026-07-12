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
- ElevenLabs shared-voice discovery and account-voice support;
- direct ElevenLabs Voice Library URL or voice-ID audition;
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
- provider audition plans pass dry-run validation;
- live runs can save audio and manifests;
- no credentials are stored in the repository.

## Current voice gate

The active candidate is a human-selected ElevenLabs Voice Library link:

```text
https://elevenlabs.io/app/voice-library?voiceId=nbk2esDn4RRk4cVDdoiE
```

Run:

```powershell
npm run voice:account:audition -- "https://elevenlabs.io/app/voice-library?voiceId=nbk2esDn4RRk4cVDdoiE"
```

A voice must be British, non-posh, emotionally responsive and recognisably suitable for live football commentary.

## Human gate

The technical foundation cannot determine whether the performance is actually funny or sounds like a football broadcast. Human listening is mandatory before crowd mixing or interface work.

See `HUMAN_LISTENING_GATE.md` and `ELEVENLABS_AUDITION.md`.

## Stop rule

Do not build the public site until at least one provider/voice configuration passes the complete listening gate. A poor voice cannot be repaired by adding more interface.
