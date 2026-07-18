---
standard: Recursive Project Improvement Standard v1.0
entry_authority: true
---

# Project Entry Rules

These rules apply to every human or AI session working in this repository.

## Before acting

1. Read `STATUS.md`.
2. Read every authority file named by `STATUS.md`.
3. Verify the exact repository head.
4. State:
   - current authority;
   - current lane;
   - allowed scope;
   - forbidden changes;
   - required validation;
   - stop point.
5. Work through only the complete authorised lane.
6. Do not begin a new lane automatically.

## One-lane rule

```text
1 project
1 authority
1 bounded goal
1 implementation contract
1 validation set
1 review point
1 promotion or stop point
```

## Mandatory stop conditions

Stop when:

- authority cannot be established;
- current-state records conflict;
- scope is unclear or insufficient;
- validation fails without explanation;
- a forbidden change becomes necessary;
- reviewed and current versions differ;
- irreversible promotion lacks approval;
- genuine provider or audio evidence requires human judgement.

Do not stop merely because a step, commit, validator, pull request or draft output completed.

## Session closure

Before ending a work session, update `STATUS.md` so it states:

- `Done`;
- `To do`;
- `Next bounded gate`;
- `Stop point`.

## Fixed new-chat bootstrap

```text
Continue work on `armpitpete/commentate-this`.

Before acting:
1. read `AGENTS.md`;
2. read `STATUS.md` and every authority file it names;
3. verify the exact repository head;
4. report Done, To do and Next bounded gate;
5. continue only the complete authorised lane.

Use one project, one authority, one bounded goal, one implementation contract,
one validation set, one review point, and one promotion or stop point.

Do not rely on previous-chat memory when repository authority can be checked.
```

## Parent standard

`Recursive Project Improvement Standard v1.0`
