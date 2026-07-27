# subAgents

This folder is the central entry point for running and managing sub-agent tasks against the codebase.

## What is `subAgents/` for?

- It is the **launching area** for agentic work: each task gets its own small spec/task file here.
- It keeps agent work **separate** from user-facing documentation and implementation code.
- It gives an external agent (e.g., an OpenRouter agentic model) a single place to look for current and pending work.

## Relationship to `docs/SubAgent docs/`

| Folder | Purpose |
|--------|---------|
| `subAgents/` | Task specs, execution tracking, and to-do lists for agentic work. |
| `docs/SubAgent docs/` | Research notes, analysis, and detailed feature specifications produced by or for agents. |

Workflow:

1. A new task is defined in `subAgents/` using the template below.
2. If research or deep analysis is needed, the agent may produce additional notes in `docs/SubAgent docs/`.
3. Implementation details and final decisions should still be documented in `docs/SubAgent docs/` when useful, but the active task list lives in `subAgents/`.

## Related Planning Docs

These specs and execution plans live alongside the sub-agent task docs and may overlap with larger initiatives:

- [Production Readiness Execution Plan](../docs/SubAgent%20docs/production-readiness-execution-plan.md)
- [User Guide Execution Plan](../docs/SubAgent%20docs/user-guide-execution-plan.md)
- [cPanel Production Plan Revision Spec](../docs/SubAgent%20docs/cpanel-production-plan-revision-spec.md)
- [Hosting Administrator Questionnaire Spec](../docs/SubAgent%20docs/hosting-administrator-questionnaire-spec.md)

## Guidelines for creating tasks

Sub-agent tasks should be **small and focused**. Large, vague prompts cause failures.

### Why tasks must be small

- **Context/history limits:** Agentic models have limited working memory. A huge task causes the model to lose important details.
- **Timeout risk:** Long-running tasks may hit execution timeouts or fail halfway through, leaving the codebase in a broken state.
- **Reviewability:** Small tasks are easier to review, debug, and roll back.
- **Clarity:** A focused task has a clear definition of done.

### One concern per task

Each task should address **one** of the following:

- A single bug
- A single UI component change
- A single API endpoint or resolver
- A single validation rule
- A single print/formatting fix

Avoid bundling unrelated changes (e.g., "fix PO modal and update RIS print and refactor utils").

### Provide focused file paths and acceptance criteria

- List the exact files the agent should read or modify.
- Include concrete acceptance criteria (e.g., "Clicking Save shows a success toast").
- Include any known constraints or edge cases.

## Reusable task template

Create one Markdown file per task in `subAgents/`. Use this template:

```markdown
# Title

Short, descriptive title of the task.

## Goal

One-sentence objective.

## Context

- What feature/bug this relates to.
- Any relevant business rules or constraints.
- Links to related spec files in `docs/SubAgent docs/` if any.

## Files to Touch

- `path/to/file1.ts` (describe why)
- `path/to/file2.ts` (describe why)

## Subtasks (small chunks)

1. Read and understand the relevant files.
2. Make the minimal code change.
3. Add/update tests if applicable.
4. Run the smallest relevant test/build command.
5. Update docs/specs if needed.

## Acceptance Criteria

- [ ] Criterion 1 (e.g., user can X without error).
- [ ] Criterion 2 (e.g., Y is validated correctly).
- [ ] Criterion 3 (e.g., existing tests still pass).

## Test Plan

List specific manual or automated steps to verify the fix/feature:

1. Step 1.
2. Step 2.
3. Expected result.

## Notes

- Known limitations.
- Dependencies on other tasks.
- Any files or code the agent should NOT touch.
```

## Example of a good small task

**File:** `subAgents/fix-po-modal-cancel-button.md`

```markdown
# Fix PO modal cancel button not closing on click

## Goal

Make the Cancel button in the Purchase Order modal close the modal when clicked.

## Context

Users report that clicking Cancel in the PO modal does nothing. The modal should close and discard unsaved changes.

## Files to Touch

- `app/src/components/POModal.tsx` - contains the Cancel button and modal state.

## Subtasks

1. Inspect `POModal.tsx` to find the Cancel button handler.
2. Ensure `onClose` is called when Cancel is clicked.
3. Verify no accidental form submission occurs.

## Acceptance Criteria

- [ ] Clicking Cancel closes the PO modal.
- [ ] Unsaved changes are not persisted.
- [ ] Existing PO save/submit behavior still works.

## Test Plan

1. Open the PO modal.
2. Click Cancel.
3. Modal should close immediately.

## Notes

Do not change the Save button behavior.
```

## Tracking progress

- Update the task file itself: check off acceptance criteria as they are completed.
- Alternatively, update any active todo list or project board used by the team.
- When a task is fully done, close or archive the task file so the folder reflects only active or pending work.
