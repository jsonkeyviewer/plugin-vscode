# Skill — DDD Methodology (permanent)

*Created: 2026-07-07*

> This file is permanent — it survives every context and vision switch.
> It defines how the agent must work on this project at all times.

---

## Reading order (before any action)

### 🔒 Fixed reference — read once, always valid
1. `CONTEXT.md` — who we are, what we build, the stack, team conventions *(permanent)*
2. `CONTRACT.md` — agent interaction rules *(permanent)*

### 🔄 Current development work — read every session
3. `vision.md` — product direction and epic goals
4. `steps/` — roadmap phases for the current vision
5. `dev-context.json` — active task: title, description, todos, step progress
6. `tasks/specification/` — functional specs for the current task
7. `tasks/done/` — what was already implemented
8. `tasks/technical/` — technical decisions

---

## Session protocol

### 1. Read before acting
Read all context files above in order before taking any action.
> These files are the project's memory. Never assume the state of the code without reading them.

### 2. Spec before code
For any new feature, fix, or refactoring:
1. Create `tasks/specification/spec-<feature>.md` with: context, expected behaviour, components, plan
2. Optionally generate `tasks/specification/spec-<feature>-preview.html` for UI tasks
3. Wait for explicit developer validation before writing any production code

### 3. Implement
- Follow the validated spec to the letter
- Group changes by file
- Validate errors after each file modified

### 4. Write the done report
After implementation, create `tasks/done/done-<feature>.md`:
- Summary of changes
- Per item: problem → root cause (if bug) → solution → modified files
- Optionally generate `tasks/done/done-<feature>-test.html` for acceptance verification

---

## Artefact conventions

| File | Location | Written by | Purpose |
|---|---|---|---|
| `spec-*.md` | `tasks/specification/` | Human | Intent |
| `spec-*-preview.html` | `tasks/specification/` | AI | Visual validation before coding |
| `done-*.md` | `tasks/done/` | AI | Execution report |
| `done-*-test.html` | `tasks/done/` | AI | Acceptance test runner |

Prefix any file with `permanent-` to preserve it across context resets.

---

## Communication rules

- If the request is ambiguous: ask ONE focused question, wait for the answer
- If the developer explains something: update mental context only — do not act unless explicitly asked
- If a bug is found in passing: signal it, do not fix without agreement (unless it blocks the current task)
- A developer explanation is not an action order