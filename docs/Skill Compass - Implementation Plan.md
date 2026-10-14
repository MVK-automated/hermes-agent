# Skill Compass - Implementation Plan

## Execution contract

The user invoked implement-spec and chose GitHub Issues. Treat the architecture as the requested implementation scope. Track acceptance, not merely source completion. Keep all issues open until their acceptance checks pass.

Repositories:
- SDK: https://github.com/MVK-automated/hermes-agent (existing fork; upstream remains read-only).
- Plugins: https://github.com/MVK-automated/hermes-skill-compass (private).

Integration branch in each repo: `integration/skill-compass`. Ticket branches start from the appropriate integration tip and run in separate worktrees. Never touch the unrelated dirty checkout at /opt/data/hermes-agent-terminal-targets; use the dedicated integration worktree under /opt/data/Github/hermes-agent-skill-compass.

Use the existing test-driven-development skill for the upstream skill's `tdd` reference and requesting-code-review for its `code-review` reference. Run RED-GREEN-REFACTOR on behavior slices. Specs and plan files are mirrored here and in each repo docs/.

No PR is authorized merely by choosing GitHub Issues. Push integration branches and close tickets after verified acceptance with linked evidence; do not open a draft PR unless the user authorizes one. No issue, branch, or PR writes to NousResearch.

## Task graph

| ID | Repository | Deliverable | Blocked by |
|---|---|---|---|
| SDK-1 | hermes-agent | Scoped composer draft events and lifecycle identity | none |
| SDK-2 | hermes-agent | Floating custom-render contributions and native-suggestion arbitration | none |
| SDK-3 | hermes-agent | Send-result events and safe middleware failure restoration | SDK-1 |
| SC-1 | hermes-skill-compass | Backend contracts, catalogue, authenticated auxiliary inference and bounded context | none |
| SC-2 | hermes-skill-compass | Draft scheduler, async scope guards, one-message selection state | SDK-1, SDK-3 |
| SC-3 | hermes-skill-compass | Native themed pill UI, catalogue and curated Discovery | SDK-2, SC-1, SC-2 |
| SC-4 | hermes-skill-compass | SDK/backend integration, live model exercise and isolated macOS build/runtime acceptance | SDK-1, SDK-2, SDK-3, SC-1, SC-2, SC-3 |

Initially ready: SDK-1, SDK-2, SC-1. Use context pointers to the architecture, ticket, test conventions, and committed integration tip. Reassess the frontier after each verified merge.

## Ticket acceptance details

### SDK-1

Expose draft-change events through the public SDK without polling or DOM injection. Include stable owning scope, revision, and lifecycle identity; cover typing/paste/dictation/restoration/clear, primary and split tile composers, fresh chats, profiles and connection changes. Disposal unsubscribes. Provide SDK documentation and behavioral tests, proving regression failures on the base.

### SDK-2

Extend the existing floating composer lane, preserving native pills and other contributions. Give custom-render consumers owning composer context. Implement disposer-owned suppression/arbitration specifically for built-in skill suggestions, not all suggestion providers. Verify plugin unload restores native behavior; test accessibility and multiple surfaces. Do not embed Skill Compass-specific logic in core.

### SDK-3

Publish scoped send acceptance/rejection notifications with submission identity and captured selection context support. Preserve original visible draft/attachments on failed middleware-transformed sends. Cover new-chat identity adoption, queued messages, split tiles, and overlapping send/draft edits. Do not claim acceptance before the gateway acknowledges the submission.

### SC-1

Ship a unified gateway/desktop plugin package with authenticated, profile-scoped API routes. Register an auxiliary task; refuse to silently enable frequent calls with an unreviewed model route. Use ctx.llm.acomplete_structured, tool-free calls, validated known skill IDs, bounded context and recent messages. Retrieve enabled installed skills and revision-pinned curated metadata; never execute fetched collection code. Separate explicit installation requests from recommendation inference; no auto-install. Validate limits, provider errors/timeouts, scope ownership, malformed output, injection attempts, and absence of raw-input logging. Use dependency injection only for tests; label synthetic fixtures as fixtures rather than live model evidence.

### SC-2

Implement 600 ms debounce / two-second max-wait as tunable defaults, single-flight latest-pending scheduling, revision monotonicity, within-lifecycle provisional results, empty/clear/send invalidation, and pause/disposal. Keep selected skills stable across refreshed results. Capture selections per submission, clear only captured selections on accepted send, retain on failure, preserve selections added mid-send. Tests use controlled clocks and actual state-machine behavior.

### SC-3

Render themed strong/runner-up/selected pills with hover and keyboard-focus explanations, brief new-explicit-name shimmer and reduced motion. Selection must not send or edit draft. Add searchable All skills and curated Discovery, exceptional matches first with source/revision/dependencies and capability difference. Name interpretation stays in the model, not local keyword matching. Add clear unsent-draft/provider disclosure and pause controls. Handle loading, stale/error, unsupported SDK and plugin disabled states. Install action requires explicit consent and existing safe installer route; never shell-execute skill-provided commands.

### SC-4

Wire actual SDK exports and plugin APIs; test failed-send recovery and session/profile/connection isolation end to end. Run portable suites/type checks and real configured-model ranking examples; measure request latency, volume and churn without logging raw user drafts. Build a modified Desktop in an isolated macOS environment and exercise the real plugin/gateway. Do not replace the active client or gateway. Run independent code review across both integration branches, fix findings, rerun acceptance checks, publish commits and evidence. Native acceptance stays open if VM/build/provider access is unavailable.

## Current execution prerequisites

- Dedicated integration worktree created from fork origin/main at 503a6b60. Existing dirty checkout preserved.
- Codex CLI installed in task scratch tooling, but `codex login status` reports Not logged in.
- Existing Claude Code CLI reports loggedIn=false.
- delegate_task is not available in this conversation's exposed tool catalog.
- macOS VM SSH probe timed out. Do not change its network/security settings.

These block the requested subagent-based implementation and native acceptance, not issue/spec preparation. Do not copy Hermes-managed OAuth credentials to another CLI or bypass credential isolation. Resolve through supported delegation availability or an operator-authenticated worker CLI; request the VM be brought online for native validation.
