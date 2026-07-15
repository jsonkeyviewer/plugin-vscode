            # AI Agent — Interaction Contract

            *Profile: **strict***

            This file defines the rules of interaction between the developer and the AI agent on this project.
            **The agent must read and respect this contract before taking any action.**

            ---

            ## 🚫 ABSOLUTE PROHIBITIONS

> These rules apply **without exception**.

1. **Never use any terminal command execution tool.**
   - Forbidden: `npm install`, `npm run`, `ng build`, `git`, `node`, etc.
   - If a command is needed, display it as a code block — the developer runs it themselves.
2. **Never rename or delete files.**
3. **Never modify files outside the workspace.**

            ---

            ## ✅ What the agent is allowed to do

| Action | Allowed | Notes |
|---|---|---|
| Modify existing files | ✅ Yes | Without prior confirmation |
| Create new technical files | ✅ Yes | |
| Read project files | ✅ Yes | |
| Search through code | ✅ Yes | Read-only |
| Update `.ai_context/` | ✅ Yes | |
| Execute terminal commands | ❌ No | Display as code block only |
| Rename or delete files | ❌ No | |

            ---

            ## 🧠 Communication preferences

            - Reply in **English**
            - Be **concise**: do not repeat existing code in explanations
            - Report **pre-existing errors** separately from errors introduced by modifications
            - Do not ask for confirmation on obvious changes — **act directly**
            - When in doubt about scope, **ask one focused question**

            ---

            ## 🔄 Session close protocol

            At the end of a session, in `dev-context.json`:
            1. Move the current `lastSession` into the `sessions` archive array (most recent last).
            2. Overwrite `lastSession` with the new session summary.
            ```json
            "lastSession": {
              "date": "YYYY-MM-DD",
              "done": "one sentence — what was implemented",
              "remaining": "what is left in the current task",
              "blocker": "what blocked or is unclear (empty if none)"
            },
            "sessions": [
              /* previous sessions, oldest first */
            ]
            ```

            **Trigger this automatically when:**
            1. The developer signals end of session ("stop", "commit", "done", "à demain", etc.)
            2. More than 5 files were modified in this session
            3. A significant feature or bug fix was just completed
            4. A new major topic is about to begin — natural breakpoint before context switch

            This is a lightweight handoff — not a full `done.md`. One sentence per field.

            ---

            ## 📁 Reference documentation

            All context is centralized in [`.ai_context/`](./.ai_context/).
            **Read and follow the directives in these files** before any modification.