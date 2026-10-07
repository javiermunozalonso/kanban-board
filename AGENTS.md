# AGENTS.md

## OpenSpec

- Review OpenSpec artifacts before coding: Before implementing any code change, review the relevant OpenSpec artifacts and summarize the applicable requirements, constraints, decisions, and expected behavior. Use this context as the source of truth during implementation.
- Check whether OpenSpec is initialized: Determine whether OpenSpec is initialized by checking for openspec/config.yaml.
- Do not initialize OpenSpec without confirmation: If openspec/config.yaml does not exist, do not run openspec init automatically. Inform the user that OpenSpec is not initialized and request explicit confirmation before adopting OpenSpec for the repository.
- Inspect existing OpenSpec state first: If OpenSpec is already initialized, run openspec list before creating proposals, modifying code, or making assumptions about the current repository state.
- Inspect related active changes: For every active OpenSpec change related to the current task, run openspec status --change <id> before creating a new proposal or modifying code.
- Reuse existing changes before creating new ones: Always check whether a related OpenSpec change already exists before creating another one. Prefer continuing or extending an existing relevant change unless the user explicitly requests a separate change.
- Validate all OpenSpec changes before completion: Run openspec validate --all before considering an OpenSpec-backed task or change complete. Resolve any relevant validation failures before declaring the work finished.
- Do not run openspec update routinely: Do not run openspec update on every session or task. Use it only after upgrading the OpenSpec CLI, changing the active profile, or modifying workflow configuration.
- Review OpenSpec artifacts before coding: Before implementing any code change, review the relevant OpenSpec artifacts and summarize the applicable requirements, constraints, decisions, and expected behavior. Use this context as the source of truth during implementation.

## Core Principles

- Think before coding. Understand the problem, state relevant assumptions, surface meaningful tradeoffs, and push back when a request is likely to create a worse solution.
- Define success criteria before making changes. Use them to drive implementation and verification.
- Prefer correctness first, then balance simplicity, consistency with the existing codebase, and maintainability. Optimize only when there is a demonstrated need.
- Commit every completed task: Whenever a task, feature, fix, or self-contained change is completed—regardless of how small it is—create a Git commit. The commit message must clearly communicate the intent and purpose of the change, rather than merely describing the files or code that were modified.
- Register every new skill: When adding a new skill, create skills/<name>/SKILL.md and its skills/<name>/references/ directory. Register the skill in skills/index.md, and keep the skill-specific skills/<name>/references/index.md updated with all reference artifacts associated with that skill.

## Understand Before Changing

- Inspect the smallest relevant context before modifying code: implementation, related tests, types/interfaces, configuration, and nearby conventions.
- Treat the repository's existing code, tests, types, documentation, and configuration as the primary source of truth for current behavior.
- When documentation and implementation disagree, investigate the discrepancy instead of silently choosing one.
- Follow established patterns in the repository unless there is a clear reason not to.
- For non-trivial product, UX, API, or architectural decisions, prefer established patterns and conventions. Research comparable solutions when doing so would materially improve the decision.
- Do not assume a dependency or existing abstraction lacks a capability without checking its documentation, types, or implementation.

## Simplicity, Scope & Architecture

- Write the minimum code that fully solves the current problem.
- Avoid speculative abstractions, configuration, extensibility, indirection, and premature optimization.
- Prefer explicit, readable code over clever or overly generic solutions.
- Do not implement hypothetical future requirements.
- Do not broaden public interfaces, configuration surfaces, or extension points unless the current requirement needs them.
- Avoid temporary architecture that is knowingly intended to be replaced later. A small solution should still be structurally sound.
- Grow the system incrementally. Start with the smallest end-to-end version that works and add capabilities on top of verified behavior.
- Keep components modular and responsibilities clearly separated.
- Introduce abstractions only when they simplify the current system or when repeated concrete usage demonstrates the need for them.
- Prefer coherent local design over introducing infrastructure for theoretical future scale.

## Compatibility

- Do not preserve obsolete behavior by default.
- Remove dead paths instead of accumulating compatibility layers, fallbacks, or duplicate implementations.
- Preserve backward compatibility only when it is an explicit requirement or when known external consumers depend on the existing contract.
- When intentionally introducing a breaking change, make the impact explicit.

## Dependencies

- Prefer established, well-maintained libraries when they reduce total complexity or improve correctness and reliability.
- Reuse dependencies already present in the project before adding new ones.
- Add a dependency only when its value outweighs its maintenance, security, operational, and cognitive cost.
- Do not reimplement common functionality without a concrete reason.

## Making Changes

- Make surgical changes. Touch only what is necessary to achieve the requested behavior.
- Do not refactor unrelated code as a side effect.
- If the requested change exposes a defect or obsolete code that directly blocks a clean implementation, fix only what is necessary to unblock the task.
- Note other issues separately instead of fixing them unprompted.
- Fail loudly and early on violated assumptions and invalid internal states. Handle expected domain and user errors explicitly at the appropriate boundary.
- Prefer self-explanatory code. Add comments only when they explain non-obvious intent, constraints, or tradeoffs.
- Keep changes conceptually atomic. When reasoning is not obvious from the code, document why the decision was made rather than merely what changed.

## Testing & Verification

- Add or update tests for behavior that is added or changed, especially edge cases and failure paths.
- Do not add speculative tests for behavior that does not exist.
- Prefer testing externally observable behavior over implementation details.
- Do not weaken, delete, or rewrite valid tests merely to make a change pass. Update tests only when the intended behavior has actually changed.
- After making changes, run the narrowest relevant verification first, then broader checks when appropriate:
    - affected tests
    - type checks
    - lint/static analysis
    - build or integration checks
- Fix failures caused by the change before considering the task complete.
- Do not fix unrelated pre-existing failures unless they block verification; report them separately.
- If a relevant verification step cannot be run, state that explicitly instead of assuming success.

## Completion

Before declaring a task complete, verify that:

1. The requested behavior is implemented.
2. The defined success criteria are satisfied.
3. Relevant tests and checks pass.
4. No unnecessary abstractions or unrelated changes were introduced.
5. Obsolete code directly superseded or made unreachable by the change has been removed.
6. Any remaining assumptions, limitations, intentional breaking changes, or unresolved verification issues are explicit.

## Requirements & Ambiguity

- Ask when missing information would materially change the implementation.
- Otherwise, make the smallest reasonable assumption, state it explicitly, and proceed.
- Never guess silently about contracts, data semantics, security boundaries, or destructive behavior.
