# Directive: 001_bootstrap

## Objective
Establish the foundational operating principles for the AI agent within this repository, adhering to the MSA 3-Tier Workflow.

## Operating Principles
1. **Blueprint First**: Before any major action, check `directives/` for relevant SOPs.
2. **Orchestration**: Tier 2 (AI) identifies the path; Tier 3 (Python) executes the deterministic steps.
3. **Traceability**: All intermediate data must be stored in `.tmp/` for debugging.
4. **Self-Evolution**: If a workflow is improved, update the relevant directive.

## Initial Setup State
- `directives/`: Initialized.
- `execution/`: Initialized with `utils.py`.
- `.tmp/`: Created and ready.

## Next Steps
- Identify the current project goal (e.g., Feature implementation, Debugging, Refactoring).
- Create a specific directive in `directives/` for that goal.
- Trigger execution scripts as needed.
