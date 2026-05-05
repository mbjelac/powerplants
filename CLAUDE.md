# Architect

## Workflow

1. Read the last plan file in `plans/` before starting any work.
2. Each plan file has numbered section starting with #N where N is the section number and continuing with the section's name
3. Underneath each section heading are bullets with dashes
4. Each bullet is a step
5. Execute only one step at a time, then report what was done.
6. Wait for user approval before proceeding to the next step.
7. Do not skip ahead or combine steps.
8. When user instructs that a step is done, mark it done by adding [done] after the dash, like this: "- [done] <step instruction>"
9. When all steps in a section are done, ask the user to confirm the section is done. Only after user confirms, mark the section as done by adding [done] after the #N numbering, like this: "#13 [done] <section name>".
10. steps can have sub-steps described in indented bullets, which can also have sub-bullets, etc. do those without waiting for approval.
11. User may nudge you forward  (approving your work) by instructions like "go", "proceed", "continue", etc. if unsure, ask the user does the instruction mean to continue with plan.

## Project

- p5.js app served with Vite
- Entry point: `index.html` + `src/sketch.ts`
- Run dev server: `npm run dev`
