# Novae Conseil — MVP specification brief

_Purpose: convert this product brief into a testable, implementation-ready specification._

## Product goal

Demonstrate AI-native full-stack development through a secure, end-to-end consulting request workflow with human-reviewed AI categorization.

## Target users

- Public visitor submitting a business request.
- Internal staff member reviewing, assigning, and processing requests.
- Consultant using internal guidance in a later RAG milestone.

## Core domain

- Four fixed departments: Consulting, Coaching & Training, Sales, Support.
- Request lifecycle: submission, pending classification, review, assignment, processing, and resolution.
- Client records and projects associated with clients.
- Requests can optionally reference a client or project.

## Functional requirements — initial release

1. Public landing page and validated request form.
2. Persistent request storage and submission confirmation.
3. Protected internal dashboard with request list and detail.
4. Server-mediated AI categorization with constrained output.
5. Human correction and separate storage of AI suggestion and final decision.
6. Basic status updates and manual processing when AI fails.
7. Basic client/project CRUD after the core workflow is operational.

## Security and reliability constraints

- $0 budget; no paid APIs or mandatory subscriptions.
- Enforce server-side validation, rate limits, daily quotas, authorization, and safe rendering.
- Starting public intake policy: one request per second and 30 requests per day, with scope and enforcement still to be specified.
- Treat user input and retrieved content as untrusted.
- No model-controlled privileged actions.
- Protect secrets and minimize sensitive data in prompts and logs.
- Preserve requests when inference fails; implement bounded retries and duplicate-submission handling as appropriate.

## AI constraints

- AI output is advisory, not authoritative.
- Categories must be validated against the fixed taxonomy.
- Ambiguous requests can be marked uncertain.
- Evaluate categorization using a manually labeled test set.
- Internal monitoring page for AI performance is a follow-on milestone unless explicitly promoted to the portfolio release.
- RAG with document/section citations is a follow-on milestone unless explicitly promoted to the portfolio release.

## Acceptance criteria

- At least 18/20 valid test requests persist correctly.
- At least 85% correct category suggestions on a representative labeled set.
- Human correction works for every request.
- AI failures do not lose requests or block manual processing.
- Unauthorized dashboard access is denied and abuse controls are enforced server-side.
- A fresh local setup is reproducible using documented steps.

## Non-goals

No multi-agent architecture, autonomous assignment, full CRM, project-management suite, third-party integrations, complex knowledge ingestion, billing, or advanced collaboration.

## Architect deliverables

1. Functional specification and explicit request lifecycle.
2. Domain entities and relationships, including deletion and data-retention implications.
3. Screen inventory and primary interaction flows.
4. Security and abuse-case checklist.
5. AI input/output contract and failure behavior.
6. Test scenarios and acceptance criteria.
7. Implementation milestones ordered by dependency and risk.
8. A later, evidence-based technology recommendation compatible with local development and a $0 budget.

## Resolved decisions

Portfolio demo; one staff account with multiple roles (selection on authentication form); local inference for dev et demo, then verified free hosted inference (Gemini or other)

## Unresolved decisions

Exact rate-limit scope; and whether RAG belongs in the first portfolio release.

**Guiding principle for the architect:** specify the smallest complete business workflow first. Do not let the AI features, dashboard breadth, or anticipated future deployment turn the MVP into an enterprise platform before the core value is demonstrated.
