---
name: dotcontext-tooling
description: When to use harness actions (init, guide, advance, manage, sensors) across any adapter
---

# Dotcontext Tooling

## When to Use
- You need to pick the right harness action for the current moment
- Unsure whether to init, check status, advance, or run sensors
- Working through MCP, CLI, hooks, or Pi — the action names and semantics are the same

## Workflow Actions
- **workflow-init** — start PREVC for planned/non-trivial work; creates canonical harness state
- **workflow-status** — read phase, scale, gates, and linked plans (status only)
- **workflow-guide** — next steps, skills, decision hints; preferred for session orientation
- **workflow-advance** — move to the next PREVC phase when deliverables are complete
- **workflow-manage** — handoffs, checkpoints, tasks, sensors, plan approval, autonomous mode

## Context & Assets
- **context** — init/fill scaffolding (`.context/` docs, agents, skills, plans)
- **plan** — link and track execution plans under PREVC gates
- **skill** — list, scaffold, or export built-in and custom skills
- **sync** — export/import context to native AI tool formats
- **agent** — discover agent playbooks and orchestration sequences
- **explore** — search and analyze the codebase
- **harness** — durable sessions, traces, artifacts, policy, replay

## Quick Chooser
| Situation | Action |
| --- | --- |
| No workflow yet, starting planned work | workflow-init |
| Need what to do now | workflow-guide |
| Phase done, move forward | workflow-advance |
| Tests/evidence before Validation exit | workflow-manage runSensors |
| Scaffold missing .context assets | context init / skill scaffold |
