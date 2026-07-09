---
name: dotcontext-workflow-r
description: PREVC phase R (Review) checklist for harness-backed work
---

# Dotcontext Workflow — Phase R

## When to Use
Active PREVC workflow is in phase **R (Review)** and you need the phase checklist independent of MCP, CLI, hooks, or Pi.

## Checklist
1. Review architecture, ADRs, and technical decisions
2. Validate design against requirements and constraints
3. Approve linked plan via `workflow-manage approvePlan` when `require_approval` is on
4. Resolve blocking review comments before advancing to Execution

## Expected Outputs
architecture, adr, design-spec

## Orientation
Call `workflow-guide` for live next steps, relevant skills, and gate decisions. Use `dotcontext-workflow` for the full PREVC overview.
