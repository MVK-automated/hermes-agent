# Skill Compass - Architecture

Status: implementation requested through implement-spec; GitHub Issues selected as tracker. Ticket preparation is underway; source implementation and deployment have not started.

## Goal

Make available skills discoverable at the moment they improve a user's workflow. Recommend skills from active conversation context and the unsent draft, with explanations, while preserving normal typing and sending. The recommender is advisory, not an autonomous agent.

## Approved decisions

- Desktop UI on the user's Mac; recommendation backend in the Hermes gateway on the Raspberry Pi.
- Use a minimal modified Desktop build, with reusable SDK extension points; keep feature implementation in plugins rather than core.
- All skill matching, including explicit name interpretation, is model-driven. Desktop performs scheduling and rendering, not keyword or semantic matching.
- Recommendations account for compact chat context, recent messages, and the current unsent draft.
- Optimize for balanced responsiveness: natural pauses plus occasional updates during continuous typing. Exact timing remains a benchmark-tuned parameter.
- Selecting a pill applies to one message only, does not send, and does not edit the visible draft. Clear selections only after successful send acceptance; failed sends retain them.
- Show installed skills in the main strip. Curated uninstalled skills live in Discovery; exceptional matches illuminate its button.
- Initial Discovery sources: official Hermes skill sources and mattpocock/skills. Source inclusion does not authorize installation or execution.
- Skill installation requires explicit user action.

## Scope

### Desktop UI

A plugin renders pill-shaped skill buttons in the floating lane above the composer, matching the native visual language. The strip supports:

1. Strong matches prominently accented. An initial score threshold of 80/100 reflects the user's proposed styling rule, not a calibrated probability.
2. Two or three runner-up candidates muted, emphasized on hover and keyboard focus.
3. Selected skills visibly marked, removable, and stable during ranking refreshes.
4. Newly detected explicit names briefly shimmer; reduced-motion users receive a static accent cue. Naming a skill never selects it automatically.
5. Hover/focus explanations: what the skill does, why it fits now, and relevant distinctions from overlapping skills.
6. A subdued All skills control for searching remaining installed skills, rather than rendering the entire catalogue as unreadable buttons.
7. Discovery normally subdued, illuminated when an uninstalled skill offers exceptional incremental value. Exceptional candidates appear first with reasoning, nearest installed alternative, source, dependencies, and an explicit installation action.
8. Pause/background-inference control and clear draft-disclosure information.

Use theme variables, visible keyboard focus, accessible labels, and reduced-motion support. Avoid flashing on every refresh or letting recommendations shift the composer unpredictably. Do not ship the user's screenshot in a repository.

### Recommendation backend

A gateway plugin exposes authenticated, plugin-scoped request endpoints. It uses a plugin-owned auxiliary task through Python ctx.llm.acomplete_structured; operator configuration selects a small model independently from the main chat model. Calls are bounded structured inference, not a second Hermes chat or bot.

The recommender has no tools and cannot install or invoke skills. Validate returned skill IDs against the applicable catalogue; ignore unknown IDs. Treat draft text, transcript text, and catalogue content as data, not instructions to the recommender.

Model input:
- Structured per-chat goal, project, workflow stage, settled decisions, open questions, used/dismissed skills.
- Bounded recent-message window alongside compact state, avoiding summary-only drift.
- Current draft snapshot.
- Compact skill metadata and curated descriptions, not full skill instruction bodies for every ranking call.

Model output:
- Ranked installed candidates with relevance scores and short reasons.
- Explicit name mentions, distinguishing affirmative use, negation, and comparisons.
- Exceptional curated uninstalled candidates with incremental-value reasoning.

Rank intent, current workflow stage, availability, prerequisites, and incremental value; do not fill the strip with duplicate TDD/review workflows. An exact name is not proof of usefulness. Recommendations may be empty when no skill helps.

### Catalogue

Read installed, enabled skills from the owning gateway profile. Resolve namespaced identifiers without normalization that changes identity. Catalogue updates must invalidate stale metadata. Disabled skills are not treated as ready-to-use recommendations.

Fetch curated Discovery metadata without executing collection code. Record source URL and revision for traceability. Determine dependencies before installation; do not silently install related skills. Respect GitHub repository scope and existing Obsidian/repo documentation preferences when imported skills run.

## SDK changes

Current source inspection establishes these gaps; exact implementation needs inspection of the chosen base revision and tests:

1. Supported composer draft-change subscription with session/composer identity, revision, and lifecycle information. Cover typing, editing, paste, dictation, draft restoration, clearing, and fresh chats. Do not reach into ProseMirror or synthesize input events.
2. Custom-render contribution in the native floating lane above the composer. Allow arbitrary plugin-rendered pills, tooltips, selected state, relevance styling, and motion without importing internal stores.
3. Send-result notification identifying submitted composer scope and success/failure, so one-message selections survive rejected sends and clear only for the accepted snapshot. Middleware alone is pre-submit and does not establish acceptance.
4. Supported suppression/arbitration for the built-in skill-name suggestions while Skill Compass owns that experience. Preserve unrelated native suggestions and restore default behavior when the plugin disables/unloads.

Expose these as generic plugin capabilities; avoid embedding Skill Compass-specific ranking into Desktop core. Plugin disposal must remove subscriptions, contributions, and suppression claims. Validate ownership across split chat tiles and connections, not only the active primary session.

## Scheduling and async behavior

Candidate initial tuning: 600 ms trailing debounce and a two-second maximum wait during continuous draft changes. These are provisional, not measured performance promises. Spacebar is not a special inference trigger.

Maintain one active ranking and one replaceable latest pending snapshot per session. Skip unchanged inputs. Keep existing suggestions visible while refreshing. Typing and send never wait for the model.

Qualify state by connection, profile, durable session/composer identity, and draft lifecycle; runtime IDs may rotate. Never apply responses after send, clear, replacement, or a cross-session change. Within the same ongoing draft, allow the newest completed snapshot to display provisionally while a newer snapshot is pending, so continuous typing cannot starve recommendations. Never regress the displayed revision. Clear stale suggestions immediately for empty drafts.

Context updates from sent messages are separate from draft ranking. Use bounded async updates; do not summarize every streamed token. Rehydrate existing sessions from bounded transcript retrieval, not an assumed empty state.

## Send integration

Store explicit selections separately from the draft. Supported middleware adds an explicit use-these-skills instruction to the outgoing message, preserving attachments and other draft fields. Selection does not change profile-level enablement. Main-agent invocation remains subject to skill safety and task permissions.

Capture selection identity with each submission. Clear only selections included in that accepted submission; selections added while a send is pending must survive. On failure restore/retain the original user's draft and selections, without exposing middleware-added instruction text as the restored draft. Queued messages and fresh-chat identity assignment require explicit tests and ownership handling.

## Privacy and security

The user requests model interpretation of unsent drafts. When using a cloud model, draft snapshots and conversation context travel through the gateway to that provider. Summaries are not anonymization. Show this policy and the configured provider; never silently switch disclosure scope.

Use host-owned provider credentials; no credentials in renderer files, repository docs, screenshots, or logs. Keep raw drafts and messages out of diagnostics. Prefer in-memory unsent-draft state and bounded retention; store only required compact context if persistence is explicitly enabled. Pausing stops new inference; disabling clears plugin-owned ephemeral state.

Gateway endpoints must enforce existing authenticated connection/profile ownership. Never expose an unauthenticated classifier service. Recommendations and Discovery installation are distinct paths. No spending, publishing, or unrelated account changes are authorized by a pill selection.

## Deployment and repository arrangement

Repositories: existing MVK-automated/hermes-agent fork for minimal SDK changes, and newly created private MVK-automated/hermes-skill-compass for plugins. The user selected GitHub Issues when invoking implement-spec. Mirror this specification and subsequent plan/verification notes into both repository docs folders and commit them. Use integration/skill-compass branches; no upstream PRs are authorized.

Build and test Desktop in an isolated macOS environment. The accessible macOS VM is not the user's physical Mac; do not treat a VM test as proof that the running client has updated. Do not overwrite/relaunch the user's active app or replace the running gateway while conversations are active. First produce isolated build/test artifacts; installation and deployment are separately identified steps.

Keep upstream remote read-only; no PRs to NousResearch without explicit authorization. Track the exact base commit and maintain a small core diff. If upstream adopts the seams, switch back to official Desktop with the same plugin.

## Verification and acceptance

- SDK contract tests cover draft revisions, scopes, send acceptance/rejection, plugin disposal, and suppression restoration.
- UI tests cover ranking tiers, names/negations/comparisons, selection/deselection without send, keyboard focus, reduced motion, explanatory hovers, exceptional Discovery ordering, and duplicate suppression.
- Scheduling tests cover pauses, continuous typing/max-wait, single-flight coalescing, stale lifecycle responses, revision monotonicity, paste, dictation, and empty drafts.
- Send tests cover unchanged visible drafts, attachments, failed-send retention, selection added mid-send, queue behavior, fresh chat scope, and session/profile/connection switching.
- Backend tests cover structured-output validation, unknown skill IDs, disabled skills, catalogue revision changes, provider errors/timeouts, prompt injection attempts, bounded context, and no raw-input logging.
- Exercise the configured real model on representative draft/context examples; report recommendation quality, end-to-end latency, request volume, and observed pill churn. Do not fabricate results or claim cost estimates without usage evidence.
- Build the patched Desktop for macOS and exercise an isolated running app with the real gateway/plugin. Source inspection and portable tests alone are not runtime acceptance.

## Non-goals

Autonomous skill execution; another chat agent or bot; global skill enablement via pills; open-ended internet skill discovery; a full rewrite of Desktop; automatic installation; continuous keystroke-stream inference; Mac-local relevance matching.

## Source evidence and limitations

Upstream source inspected at 79651b71bd56efd76d06f3de1df64dde09b58ff3. Installed physical-Mac SDK has not been inspected. Native above-composer pills exist in the user's screenshot.

- https://github.com/NousResearch/hermes-agent/blob/79651b71bd56efd76d06f3de1df64dde09b58ff3/apps/desktop/src/sdk/index.ts
- https://github.com/NousResearch/hermes-agent/blob/79651b71bd56efd76d06f3de1df64dde09b58ff3/apps/desktop/src/app/chat/composer/contrib.ts
- https://github.com/NousResearch/hermes-agent/blob/79651b71bd56efd76d06f3de1df64dde09b58ff3/apps/desktop/src/sdk/composer.ts
- https://hermes-agent.nousresearch.com/docs/developer-guide/desktop-plugin-sdk
- https://hermes-agent.nousresearch.com/docs/developer-guide/plugin-llm-access
