# Implementation Plan — Novae Conseil MVP

## Architectural Strategy

- **Architecture**: Modular Monolith (Next.js App Router for UI/API routes, FastAPI for specialized business/AI endpoints if needed, SQLite via Drizzle ORM).
- **Security & Integrity**: Server-side Zod validation, IP-based sliding window rate limiting, server-mediated LLM invocation, separate human decision vs. AI prediction database fields.
- **Cost**: $0 runtime budget. Local SQLite database and local inference / free-tier cloud LLM (e.g., Gemini API free tier).

---

## Phase Summary & Exit Gates

### Phase 1: Foundation, Schema & Public Intake

- **Goal**: Establish core application architecture, database persistence, and public intake pipeline with rate limiting.
- **Exit Gate**: Public users can submit requests that validate and persist in SQLite; rate limits enforce 1 req/sec and 30 req/day limits; unit & integration test coverage >90% on validation and persistence.

### Phase 2: AI Categorization Mediator & Resilience

- **Goal**: Build server-mediated AI categorization with constrained output and fallback handling.
- **Exit Gate**: Incoming requests trigger asynchronous/synchronous AI classification against fixed taxonomy; failures degrade gracefully to `uncertain` status without data loss; 85%+ accuracy on labeled test set.

### Phase 3: Protected Internal Dashboard & Request Lifecycle

- **Goal**: Deliver staff authentication, request review, assignment, and human category correction workflows.
- **Exit Gate**: Unauthenticated users blocked from `/admin/*`; staff can review, assign, override AI categories, and progress status through resolution; full state audit trail preserved.

### Phase 4: Client & Project Management (CRUD)

- **Goal**: Provide client and project domain entities and link them to incoming or existing requests.
- **Exit Gate**: Staff can create/update/soft-delete clients and projects and link requests to clients seamlessly.

### Phase 5: Verification, E2E Suite & Release Preparation

- **Goal**: Full system verification, local setup reproducibility, and portfolio demonstration readiness.
- **Exit Gate**: At least 18/20 test requests pass end-to-end; Playwright regression test suite passes 100%; clean local setup documented and verified.
