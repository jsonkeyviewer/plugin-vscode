# `.ai_context` — Documentation-Driven Development

This folder is managed by the **Documentation First** plugin (JetBrains).
It structures collaboration between the developer and the AI agent throughout the project.

---

## Philosophy

The method is based on a simple principle: **documentation is not a deliverable, it is a working tool**.

The developer and the AI agent collaborate by **reading and writing documents**.
- The developer writes what they want to do, understand or decide.
- The agent reads, completes, refines, questions, and documents what it has done.
- Together, they maintain a living documentation base that serves as the project's memory.

> It is not the agent who decides — it is the developer who drives through documents.

---

## Reading order (before any action)

1. `README.md` — this file
2. `CONTEXT.md` — current sprint/task focus
3. `CONTRACT.md` — interaction rules
4. `vision.md` — product vision and epic goals
5. `skills/` — permanent agent behaviours
6. `steps/` — roadmap phases and features
7. `tasks/specification/` — active specs
8. `tasks/done/` — what was already implemented
9. `tasks/technical/` — permanent technical references

---

## `permanent-` Convention
A file prefixed with `permanent-` **will not be deleted** when switching to a new context.
Applies to `tasks/specification/`, `tasks/technical/`, and `skills/`.

### Close a context before committing
A **context = a unit of work = a Git commit**.
Commit `.ai_context/` before moving to a new context.

---

## Structure

```
.ai_context/
├── README.md              ← this file (permanent)
├── CONTRACT.md            ← rules for the agent (permanent)
├── CONTEXT.md             ← current context: objective and todo list (contextual)
├── context.json           ← machine metadata (contextual)
├── vision.md              ← product vision and epic goals (permanent)
├── history.json           ← past contexts journal in JSON Lines (permanent)
├── skills/                ← permanent agent behaviours (permanent-* kept)
├── steps/                 ← roadmap phases / features (permanent)
└── tasks/
    ├── done/              ← agent summaries (contextual)
    ├── specification/     ← functional specs (permanent-* kept)
    └── technical/         ← technical decisions (permanent-* kept)
```

---

*Managed by [Documentation First Plugin](https://documentationfirst.ai) — MIT License*