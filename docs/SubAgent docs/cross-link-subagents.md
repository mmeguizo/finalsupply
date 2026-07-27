# Cross-Linking Plan: subAgents README and SubAgent Docs

## 1. subAgents/README.md summary
Central entry point for sub-agent tasks. It explains what `subAgents/` is for, its relationship to `docs/SubAgent docs/`, guidelines for small tasks, a reusable task template, an example task, and progress tracking.

## 2. Files in docs/SubAgent docs/
- user-guide-execution-plan.md
- RIS-Quantity-Validation-Bug.md
- production-readiness-execution-plan.md
- PO-Remarks-Spec.md
- po-receive-button-clarity-spec.md
- po-modal-fixes-spec.md
- po-category-truncation-fix-spec.md
- No-Category-Feature-Spec.md
- NC-Print-Research.md
- Modal-Flicker-Bug.md
- IAR-Editable-Quantity-Percentage.md
- IAR-Duplicate-Bug-Analysis.md
- IAR-Complete-Partial-Bug.md
- hosting-administrator-questionnaire-spec.md
- fix-auto-iar-and-split.md
- cpanel-production-plan-revision-spec.md

## 3. Index/README in docs/SubAgent docs/
No README.md, index.md, or overview.md currently exists.

## 4. Recommended Related Planning Docs section for subAgents/README.md
Add after the intro/relationship section:

```markdown
## Related Planning Docs

These specs and execution plans live alongside the sub-agent task docs and may overlap with larger initiatives:

- [Production Readiness Execution Plan](../docs/SubAgent%20docs/production-readiness-execution-plan.md)
- [User Guide Execution Plan](../docs/SubAgent%20docs/user-guide-execution-plan.md)
- [cPanel Production Plan Revision Spec](../docs/SubAgent%20docs/cpanel-production-plan-revision-spec.md)
- [Hosting Administrator Questionnaire Spec](../docs/SubAgent%20docs/hosting-administrator-questionnaire-spec.md)
```

## 5. Recommended docs/SubAgent docs/README.md content
Create a short README in `docs/SubAgent docs/README.md`:

```markdown
# SubAgent Planning Docs

This folder contains planning specs, bug analyses, and execution plans produced for or alongside sub-agent work. The active sub-agent task tracker and task templates live in [`subAgents/README.md`](../../subAgents/README.md).

## Task example
- [001-optimize-compute-db-heavy-resolvers](../../subAgents/tasks/001-optimize-compute-db-heavy-resolvers.md)
```
