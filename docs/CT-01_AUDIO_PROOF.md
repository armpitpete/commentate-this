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
- OpenAI Responses API commentary-script generation;
- retained OpenAI, ElevenLabs and Azure provider evidence;
- Google Gemini 3.1 Flash TTS Preview provider;
- natural-language accent, pace, tone and emotion direction;
- six male Google voice candidates selected for commentary-relevant traits;
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
- live runs can save playable audio and manifests;
- no credentials are stored in the repository.

## Provider findings

- OpenAI built-in voices failed the British/non-posh performance gate.
- ElevenLabs Voice Library speech and voice creation are blocked on the free API plan.
- Azure native British voices remain a fallback.
- Google Gemini 3.1 Flash TTS Preview is the active gate because its free developer tier supports prompted accent, style, pace, tone and emotional delivery.

## Active command

```powershell
npm run voice:google
```

A voice must be British, non-posh, emotionally responsive and recognisably suitable for live football commentary.

## Human gate

The technical foundation cannot determine whether the performance is actually funny or sounds like a football broadcast. Human listening is mandatory before crowd mixing or interface work.

See `HUMAN_LISTENING_GATE.md` and `GOOGLE_TTS_AUDITION.md`.

## Stop rule

Do not build the public site until at least one provider and voice pass the complete listening gate. A poor voice cannot be repaired by adding more interface.
