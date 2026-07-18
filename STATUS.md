---
completion_authority: true
standard: Recursive Project Improvement Standard v1.0
project_slug: commentate-this
project_name: Commentate This
project_type: application
template_mode: false
status: VALIDATING
authority_files:
  - docs/authority/AUTHORITY.md
---

# Commentate This — Current Status

## Current authority

- Repository: `armpitpete/commentate-this`.
- Governing branch: `main`.
- Exact current `main`: `5fef5a4ebd443d0bd5b9cbb11c83b8d121fdcf9a`.
- Active product evidence: CT-01 PR #1, open and draft at exact head `b4cb8d6765327904e07522f887c2576ae50389cd`.
- Repository control repair: PR #3 on `agent/project-control-standard-v1`; it is not self-promoting authority.

## Current lane

Complete the bounded CT-01 provider-backed audio proof on the exact PR #1 head. The immediate human gate is the Google Gemini TTS voice audition and evidence capture; the free ElevenLabs lane is closed and Azure remains fallback evidence.

## Allowed scope

- run the exact CT-01 automated checks against PR #1 head `b4cb8d6765327904e07522f887c2576ae50389cd`;
- perform the authorised Google Gemini TTS audition when user-controlled provider access is available;
- record passed, failed and unavailable provider checks honestly;
- evaluate escalation, sincerity, intelligibility and safe failure across the fixed ten-sentence reference set;
- maintain repository-control files without changing product behaviour.

## Forbidden changes

- no crowd assets, crowd mixing or FFmpeg single-file assembly;
- no public interface, accounts, sharing or live microphone input;
- no cloning or imitation of a named real commentator;
- no script-generation, audio-rendering or provider-integration change without a separate bounded contract;
- no product expansion before the current provider and voice proof is accepted;
- no merge, ready-for-review transition or new lane without explicit authority.

## Validation

For repository control:

```bash
python scripts/validate_project_control.py --repository armpitpete/commentate-this
```

For CT-01 product evidence, run the checks declared by the exact PR #1 authority, including `npm run check` and only the provider command authorised for the available access. Record external checks as unavailable rather than claiming success when access is absent.

## Done

- CT-01 defines ten fixed reference sentences.
- A strict commentary-script schema exists.
- Semantic validation, deterministic climax repair and one validation-guided retry exist.
- OpenAI, ElevenLabs and Azure provider evidence is retained.
- The free ElevenLabs creation and library-speech lanes are recorded as blocked by plan restrictions.
- Google Gemini TTS integration, six candidate voices and a ten-case proof plan exist on PR #1.
- Project-control repair is limited to the five authorised control paths.

## To do

- verify PR #1 remains at the exact reviewed head before provider proof;
- run all CT-01 automated checks on that exact head;
- perform the Google Gemini voice audition when user-controlled provider access is available;
- record the best supported provider and voice configuration, or the exact blocker;
- evaluate the complete ten-case proof set;
- obtain explicit authority before any promotion or product expansion.

## Next bounded gate

On exact PR #1 head `b4cb8d6765327904e07522f887c2576ae50389cd`, run the CT-01 checks and the Google Gemini TTS audition when access permits, then record the complete provider and listening evidence. Do not begin crowd or interface work.

## Stop point

Stop on PR-head drift, unavailable or rejected provider access, schema or semantic-validation failure, unsafe or unintelligible audio, evidence requiring human listening judgement, or before any merge or product expansion lacking explicit approval.
