---
name: dotcontext-workflow
description: Operate PREVC workflow through any adapter (MCP, CLI, hooks, Pi)
---

# Dotcontext Workflow

## When to Use
- Starting or continuing structured work in a dotcontext-enabled repo
- You need orientation on the current PREVC phase or next harness action
- The transport differs (MCP tool, CLI command, hook, Pi extension) but the workflow rules are the same

## PREVC Phases
- **P** Planning — requirements, specs, acceptance criteria
- **R** Review — architecture, ADRs, design review (optional by scale)
- **E** Execution — implementation and unit tests
- **V** Validation — QA, review, evidence and sensors
- **C** Confirmation — docs, changelog, deploy handoff (optional by scale)

## Harness-First Rules
1. Workflow state lives in the harness (`.context/runtime/workflows/`), not in the adapter.
2. Call **workflow-init** for non-trivial planned work; skip for trivial edits.
3. Use **workflow-guide** (or **workflow-status**) for current phase, next steps, skills, and gate hints.
4. Advance with **workflow-advance** only when phase deliverables are complete.
5. Manage checkpoints, sensors, and handoffs with **workflow-manage**.

## Adapter Neutrality
The same actions are available regardless of transport:
- MCP — harness adapter tools (`workflow-init`, `workflow-guide`, etc.)
- CLI — `admin workflow` commands
- Hooks / Pi — thin clients that call the same harness runtime

Read the phase-specific `dotcontext-workflow-{p,r,e,v,c}` skill for the active checklist.
