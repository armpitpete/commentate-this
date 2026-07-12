# CT-01 OpenAI Built-in Voice Audition

## Outcome

**Failed.**

The OpenAI built-in voice comparison established:

- `fable` was the only clearly British voice;
- `fable` sounded too posh/Received Pronunciation for Commentate This;
- the remaining built-in voices were not acceptably British;
- no built-in OpenAI voice passed both accent and performance requirements.

This lane is retained as evidence and regression material. It is not the active voice-selection route.

## Why the requirement remains

Commentate This needs a recognisable British football-commentary voice that sounds ordinary or regional, not aristocratic, audiobook-like or North American. Weakening that requirement would remove a core part of the product identity.

## Current route

Proceed to the searchable ElevenLabs regional British audition:

```powershell
npm run voice:elevenlabs
```

See `ELEVENLABS_AUDITION.md`.

## Stop rule

Do not generate a ten-case proof using an OpenAI built-in voice. The built-in voice gate is closed unless OpenAI adds a materially different voice option later.
