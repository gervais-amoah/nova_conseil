# Simulation: From raw idea to deployed consulting-agency dashboard

The goal of this simulation is to show you how to operate your AI engineering workflow in practice—not just which prompts to use, but what you do, what you give each agent, what you expect back, and when you move to the next stage.

Your raw idea has four major capabilities:

- Request management: Receive requests and automatically classify them into the appropriate department, with human correction.
- AI-assisted processing: Retrieve internal procedures using RAG, then provide an answer with document and section citations.
- Client management: CRUD for client records.
- Project management: CRUD for client projects.

There is also an implicit fifth capability: the application needs authentication, authorization, persistence, and deployment.

My recommendation is to treat this as a real product project with explicit gates. Do not ask an AI to generate the entire application in one shot.

## The end-to-end workflow

Phase 0 — Product discovery

ChatGPT

Raw idea → approved problem, users, scope and MVP

Phase 1 — Specification & architecture

Gemini

BDD scenarios, data model, security, architecture and task plan

Phase 2 — Design & acceptance tests

ChatGPT + QA

Screen specifications, Gherkin tests and acceptance gates

Phase 3 — Incremental implementation

Antigravity

Small tasks, TDD, independent tracks and Git checkpoints

Phase 4 — Hardening

QA + reviewer

Functional, security, integration and manual testing

Phase 5 — Deployment

Antigravity

Production configuration, CI, deployment and smoke tests

Every phase ends with a verified checkpoint and a compact handoff. We will simulate the artifacts and decisions that each phase should produce.

# Phase 0 — Turn the raw idea into a product brief

Agent: ChatGPT using `PROMPT_BRAINSTORM.md`

You start with your idea exactly as you described it. Do not choose the framework or database yet. First, establish who the application serves and what successful use looks like.

Open a fresh ChatGPT conversation, paste your brainstorm prompt, and add this input:

Simulation input — copy/paste

# Raw product idea

I want to build a full-stack dashboard for a consulting agency.

The application should allow the agency to:

1. Receive requests and automatically assign each request to the most appropriate department. A human can correct the AI's categorization.
2. Process requests with AI assistance. For complex requests, retrieve the relevant internal procedure using RAG and cite the document name and relevant section.
3. Manage clients through basic CRUD.
4. Manage projects associated with clients through basic CRUD.

Constraints:

- I am building this alone with free AI tools.
- Budget: $0; no paid APIs or subscriptions.
- I work locally in VS Code and need a maintainable implementation.
- The product should be suitable for eventual real-world deployment.

Help me turn this idea into a focused MVP. Challenge unnecessary complexity, identify assumptions, define the primary user journey, and separate essential functionality from later enhancements.

Do not choose the tech stack or write code yet. Return a product brief and a compact architect handoff.

### What should come back?

The brainstormer should produce a brief resembling this:

### Draft product brief — simulated output

Status: proposed, not yet approved

Product goal

Help a consulting team organize incoming client requests, route them to the correct department, and resolve them using documented internal procedures.

Primary user

A consulting employee responsible for triaging and processing requests.

Core workflow

1. A request arrives and is recorded.
2. The system proposes a department and records its confidence or classification status.
3. An employee confirms or corrects the department.
4. The employee reviews the relevant procedure and source citations.
5. The employee processes the request and records its status.

MVP capabilities

- Request intake, assignment, status and correction.
- Searchable internal procedure documents and grounded retrieval.
- Client and project CRUD.
- A simple operational dashboard.
- Authentication and role-appropriate access.

Deferred candidates

- Autonomous execution of procedures.
- Complex workflow automation and configurable department rules.
- Client-facing portals, advanced analytics and sophisticated reporting.
- Multi-agent processing and elaborate AI orchestration.

Notice that this is a hypothetical first result. The brainstormer should validate the user assumptions before you accept it.

### Your approval gate

Before moving on, decide three things:

1. Who creates the request: an employee, an external client, or both?
2. Does the AI merely recommend how to process the request, or may it execute actions?
3. What documents will the RAG system search, and are they already available in digital form?

These decisions affect security, architecture, testing, and scope. If they are unknown, the architect must explicitly record the assumptions rather than silently treating them as settled facts.

# Phase 1 — Write the specification and architecture

Agent: Gemini using `PROMPT_ARCHITECT.md` Input: Approved product brief, plus the relevant Layer 2 files.

Once you approve the product brief, create the repository and initialize the core documents. Then ask Gemini to turn the brief into the engineering contract.

For this simulation, assume the first version is an internal agency dashboard: staff create requests, AI recommends departments, humans control final assignment, and staff use retrieved procedures to assist processing.

## 1. The initial architecture decision

The architect should compare options before choosing the stack. Given your $0 constraint, I would ask it to evaluate:

- A full-stack Python framework versus a JavaScript/TypeScript full-stack framework.
- SQLite versus a managed database with a genuinely usable free tier.
- Local document retrieval versus a hosted vector database.
- A provider-independent AI interface versus coupling the application to one model provider.

My initial preference for a small, solo-developed MVP would be a modular monolith rather than microservices. Keep request management, client/project management, document retrieval, and AI orchestration in distinct modules, but deploy one application initially.

The final choice should depend on your existing skills, the project requirements, and the free services available at implementation time.

Critical constraint: $0 means avoiding paid API calls, not pretending inference has no cost. You can implement classification and RAG with local models or deterministic fallbacks. However, your 16 GB RAM laptop without a dedicated GPU may struggle with larger local models. Start with small models and benchmark them before making local inference a production requirement.

## 2. What the architect produces

Ask Gemini to create or update the following files:

| File                                    | Expected result                                                        |
| --------------------------------------- | ---------------------------------------------------------------------- |
| `PROJECT.md`                            | Approved product scope and user workflows                              |
| `STACK.md`                              | Selected stack, module boundaries, commands and deployment assumptions |
| `SPEC.md`                               | Requirements, business rules and links to feature scenarios            |
| `specs/features/requests.feature`       | Intake, classification, assignment and status scenarios                |
| `specs/features/rag-processing.feature` | Retrieval, citations, missing sources and processing behavior          |
| `specs/features/clients.feature`        | Client CRUD and validation                                             |
| `specs/features/projects.feature`       | Project CRUD and client relationships                                  |
| `specs/features/access-control.feature` | Authentication, authorization and data isolation                       |
| `PLAN.md`                               | Phases, task dependencies, track structure and exit gates              |
| `TASKS.md`                              | Stable task IDs, scope, acceptance criteria and statuses               |

For example, the request feature could include:

```
Feature: AI-assisted request classification

  Scenario: Classify a newly created request
    Given the agency has configured its departments
    When an employee submits a valid request
    Then the request is saved
    And the system produces a department recommendation
    And the recommendation is visible to the employee

  Scenario: Human corrects a classification
    Given a request has an incorrect department recommendation
    When an authorized employee selects another department
    Then the request is assigned to the selected department
    And the correction is recorded

  Scenario: Classification fails
    Given the classification service is unavailable
    When an employee submits a valid request
    Then the request is preserved
    And the system indicates that classification needs attention
```

This establishes an important invariant: AI failure must not destroy the business transaction. The request should survive even when classification fails.

For RAG, the architect should specify that a citation is a reference to an actual retrieved source—not a document name invented by the model. The citation should identify the document and a stable section identifier or page/heading where available.

## 3. Divide the implementation into tracks

The architect should build a dependency-aware plan. A possible first version is:

Phase 1

Foundation

Repository, configuration, database, authentication, migrations, lint, tests and build.

Phase 2

Core business data

Track A: clients and projects. Track B: request records, departments and statuses. Parallelize only after shared data contracts are agreed.

Phase 3

Request intelligence

Classification, human correction, document ingestion, retrieval and grounded citations.

Phase 4

Complete user experience

Dashboard, filters, request detail, loading/error states and manual workflow testing.

Phase 5

Production readiness

Security review, regression suite, deployment, database backup/recovery and production smoke tests.

The dependency order is more important than the number of phases. Do not start the RAG interface before defining document identity, chunk metadata, retrieval behavior, and citation contracts.

### Your approval gate

Review the specification and plan. Resolve contradictions, approve the scope, and only then move to acceptance-test preparation.

# Phase 2 — Design the interface and prepare acceptance tests

Agents: ChatGPT using `PROMPT_ART_DIRECTOR.md`; Qwen or Gemini using `PROMPT_ACCEPTANCE_TESTER.md`.

Do these as two separate assignments. The art director decides how the experience should behave and look. The QA designer decides how to verify the approved behavior.

## 1. The initial screen inventory

The art director should produce a practical UI specification for these screens:

[Generate UI Components Styled Like Enterprise | Windframe](./generated_images/image_0.png)

Dashboard

Request totals, pending triage, workload and recent activity.

[CRM - Request Management by Sienna Zhao on Dribbble](./generated_images/image_1.png)

Requests

Request list, filters, department recommendation, correction and processing.

[쉬운 영업 현황 관리 | 플러그 pluuug](./generated_images/image_2.png)

Clients

Client list, create/edit forms, detail view and validation.

[CRM for Web Designers: A Comprehensive Guide to the Best Tools for 2026](./generated_images/image_3.png)

Projects

Projects associated with clients, project status and basic CRUD.

These images are visual inspiration, not a committed design. The art director should use the selected framework and component library when defining the actual UI.

The request detail screen deserves particular attention. It should clearly distinguish:

- The AI's recommended department from the human-confirmed assignment.
- The request's operational status from its classification status.
- Retrieved evidence from generated summaries or recommendations.
- A verified citation from a response with insufficient supporting evidence.

## 2. Acceptance-test preparation

The QA designer reads the approved Gherkin scenarios and defines executable tests before implementation.

For example, for RAG:

| Test                                        | Expected assertion                                                   |
| ------------------------------------------- | -------------------------------------------------------------------- |
| Relevant document exists                    | Returned evidence includes the correct source reference              |
| Two relevant documents exist                | Each displayed citation maps to a retrieved source                   |
| No relevant evidence exists                 | The system does not fabricate a procedure or citation                |
| Document is deleted or inaccessible         | Retrieval handles the unavailable source safely                      |
| User has no permission to access a document | Restricted content is not exposed                                    |
| Retrieval succeeds but generation fails     | The application preserves the request and reports processing failure |

The QA agent should also define tests for client/project relationships, invalid input, duplicate submissions where relevant, authorization failures, and AI-provider outages.

Important: The QA agent should not invent expected business behavior. If the specification does not say what happens when no procedure matches, it must flag the gap for you or the architect to resolve.

### Your approval gate

Approve the UI behavior and test design. Check that critical scenarios are represented and that the tests can run using free tooling before implementation begins.

# Phase 3 — Implement incrementally, using TDD

Primary agent: Antigravity in VS Code Backup: DeepSeek for focused patches and Claude Free for difficult bugs.

This is where your workflow becomes an actual engineering process.

## 1. Start with one vertical slice

Do not build all the database models, then all the APIs, then all the screens, then add AI. Build a small end-to-end feature first.

For this project, I would start with:

Vertical slice 1: Create and view a client.

It exercises the entire stack—database, backend validation, API or server action, UI form, error handling, and tests—without introducing the additional uncertainty of AI.

A possible task board:

| Task  | Scope                                           | Depends on    |
| ----- | ----------------------------------------------- | ------------- |
| T-001 | Repository setup and verification commands      | None          |
| T-002 | Database schema and migrations                  | T-001         |
| T-003 | Client service and validation tests             | T-002         |
| T-004 | Client creation and listing UI                  | T-003         |
| T-005 | Client acceptance tests and manual verification | T-004         |
| T-006 | Client update and deletion                      | T-003         |
| T-007 | Project CRUD and client relationship            | T-006         |
| T-008 | Request creation and persistence                | T-002         |
| T-009 | Request classification and human correction     | T-008         |
| T-010 | Document ingestion and retrieval                | T-002         |
| T-011 | RAG-assisted processing with citations          | T-010         |
| T-012 | Dashboard aggregation and operational filters   | T-007, T-009  |
| T-013 | End-to-end regression and deployment readiness  | Feature tasks |

These IDs are illustrative. The architect should generate the real dependency graph based on the selected stack and approved scope.

## 2. What you actually do for T-003

You open Antigravity and give it the implementation prompt, followed by this task instruction:

Implement task T-003: Client service and validation.

Read AGENTS.md, STACK.md, the relevant specification and Gherkin scenarios, TASKS.md, and the existing repository before making changes.

Start by identifying the existing client model, persistence interface, service conventions, and test framework.

Follow strict TDD:

1. Write tests for valid client creation and invalid inputs.
2. Run the tests and establish the expected baseline failure.
3. Implement the smallest correct service-layer change.
4. Rerun the tests and verify the results.
5. Refactor only while keeping tests green.

Include appropriate validation, error handling, and tests. Do not build the UI, add dependencies, modify unrelated files, or commit.

At the end, report changed files, exact commands executed, observed test results, remaining gaps, and the suggested next task.

Antigravity should inspect your actual repository and execute the work. If the agent cannot run a required command or the test fails for an environment issue, it must report that rather than pretending the task passed.

## 3. Follow the Red → Green → Refactor cycle

Red — prove the behavior is missing

Write a meaningful test for client creation with invalid input. Run it and observe a failure caused by the missing behavior, not a broken test setup.

Green — make the test pass

Implement the smallest appropriate validation and error response. Run the test and the relevant regression suite.

Refactor — improve without changing behavior

Simplify the service, remove duplication if warranted, and rerun the tests.

Do not force every change to have a separate test for every implementation detail. Tests should establish observable behavior and important invariants.

## 4. Use Antigravity and DeepSeek differently

When Antigravity reaches a difficult bug, don't repeatedly tell it to try again. Gather the exact error and relevant code, then use `PROMPT_DEBUGGER.md` or `PROMPT_CODER.md` with DeepSeek.

For example:

```
Task: T-009
Problem: Department assignment is not preserved after correction.

Expected:
The human-confirmed department must remain the effective assignment.

Actual:
[Paste observed behavior and error output.]

Relevant files:
[Paste current service, model, and failing test.]

Recent changes:
[Paste relevant diff or commit summary.]

Identify the root cause, propose the smallest correction, and provide
a regression test. Do not assume you can access my local repository.
```

Return the proposed fix to Antigravity for integration and verification. If the code is complex or the same bug survives several evidence-based attempts, spend a limited Claude Free session on that specific problem.

## 5. Close every task before starting the next

After T-003, the process is:

1. Inspect the diff and test output.
2. Run the required checks.
3. Open a fresh QA session when the task's risk warrants independent review.
4. Fix any blocking findings.
5. Use `PROMPT_CHECKPOINT.md` to prepare the checkpoint.
6. Approve and create the commit.
7. Update `TASKS.md` and `HANDOFF.md`.

Example commit:

```
feat(clients): add validated client creation service
```

At the end of a phase, additionally run the phase's acceptance tests, manual checks, lint, and build. Only then proceed to the next phase.

# Phase 4 — Build the AI capabilities safely

The AI features deserve their own implementation gates because they introduce nondeterminism, model failures, document security, and potentially incorrect outputs.

## 1. Department classification

Start with a deterministic interface between the application and the classifier:

```
Request submitted
       ↓
Request persisted
       ↓
Classification attempted
       ↓
Recommendation + status stored
       ↓
Human reviews/corrects assignment
```

A classification record might contain:

- Recommended department ID.
- Classification status.
- Model or ruleset identifier.
- Timestamp.
- Optional confidence or review reason, if meaningfully supported.
- Human-confirmed department ID, when assigned or corrected.

Do not blindly trust a model's self-reported confidence score. Calibrate confidence against real examples before using it to automate decisions.

For the first version, allow a rules-based or manual fallback if the local model is unavailable. Make the classification provider replaceable, so local inference can be swapped without rewriting request management.

## 2. RAG and grounded citations

Implement RAG in distinct steps.

Document ingestion

Parse → chunk → preserve document and section metadata

Retrieval

Search authorized chunks relevant to the request

Grounded generation

Use retrieved evidence, or abstain when evidence is insufficient

Citation validation

Map each citation to a real source and stable section reference

Human review

Show the answer, source excerpts, and citation links to the employee

For example, the output could identify:

- Document: `Employee-Onboarding.pdf`
- Section: `§ 3.2 — Account Provisioning`
- Retrieved passage: the relevant excerpt
- Response: a concise explanation grounded in that passage

These are illustrative citation fields, not a real retrieved result.

The important implementation detail is that the model should return references to retrieved chunk IDs, not invent arbitrary document names and section numbers. Your application resolves those IDs to the stored metadata and renders the citations. Test that every citation points to actual evidence.

For a $0 prototype, compare local embedding models and local text-generation models against a small representative document set. Begin with a simple local retrieval implementation and add a vector index only if your evaluation shows a need. The production decision must account for latency, memory, document volume, access control and hosting constraints.

# Phase 5 — Independent QA and production hardening

Agents: Antigravity in a fresh QA session; Qwen Studio for a second opinion.

At this stage, the question changes from “Did the feature get implemented?” to “Can we trust the application to behave correctly?”

Use `PROMPT_QA_AUDITOR.md` and provide:

- Approved specification and Gherkin scenarios.
- Relevant task IDs and acceptance criteria.
- The actual Git diff.
- Test, lint and build output.
- Any known defects or incomplete work.

The QA agent should independently inspect the implementation, execute available checks and report evidence-backed findings. It should not fix production code itself.

## 1. Minimum release checklist

### Release checklist

#### 0/17

Core functionality

Request creation and persistence work.

Department recommendation and human correction work.

Client CRUD and project CRUD work.

RAG returns relevant evidence and valid citations.

Missing evidence and AI failures are handled correctly.

Security and data integrity

Authentication and authorization are enforced server-side.

Users cannot access unauthorized clients, projects, requests or documents.

Secrets are not committed or exposed in logs.

Database constraints, validation and failure recovery are verified.

Quality gates

Acceptance and regression tests pass.

Lint and production build pass.

Manual testing covers primary workflows and failure states.

Critical known defects are resolved or explicitly accepted.

Deployment readiness

Production environment variables are configured securely.

Database migrations and backup/recovery strategy are defined.

Production smoke test and rollback/recovery procedure are documented.

Hosting, model inference and storage have a viable $0 operating plan.

This is your manual tracking aid, not an automated test report. Check an item only when you have verified it.

## 2. Additional quality tools

Don't implement every tool from your notes before the MVP works. Add them in order of value:

- Coverage: Identify untested business logic.
- Mutation testing: Check whether tests catch meaningful behavioral changes.
- CRAP-score analysis: Find functions where complexity and weak coverage combine to create maintenance risk.
- Dependency checker: Enforce an approved dependency policy.
- Architecture viewer: Help inspect module boundaries and dependencies.
- Profiling: Measure real bottlenecks before optimizing.

All of these can be approached with free tooling, though compatibility and setup effort depend on the selected language and framework. The tooling agent should verify the actual options rather than inventing commands.

# Phase 6 — Deploy the product

Primary agent: Antigravity. Supporting agents: QA auditor and debugger.

The deployment process depends on the stack selected in Phase 1. Don't lock yourself into a hosting provider before verifying its current free limits, supported runtime, database persistence, and whether its terms allow your intended use.

## 1. Make the application deployable locally first

Before selecting a production host, confirm that you can:

1. Install dependencies from the lockfile.
2. Configure the application using environment variables.
3. Apply database migrations to a fresh database.
4. Run the automated test suite.
5. Build the production artifact.
6. Start the application in production mode.
7. Complete a smoke test using realistic but non-sensitive test data.

The build and runtime must not depend on your development-only local model, a secret file accidentally committed to Git, or a database stored in a temporary directory that disappears on restart.

## 2. Choose a $0 deployment path

There are two broad options.

Option A — Deploy the application with local inference

Best control

Host the application and a small model on hardware you control, or use a free compute environment if one actually supports your workload. This minimizes external AI API costs but introduces hardware, uptime, networking, security and operational responsibilities.

Main limitation: Your laptop is not a reliable production server for a consulting agency. Treat local deployment as a demo or development environment unless you can provide dependable hosting.

Option B — Free application hosting with an external database

Potentially simpler

Use a host with a genuinely free tier and a compatible database offering. Keep the application independent of the inference provider, and use local inference or a free model service if one is available and suitable.

Main limitation: Free-tier quotas, sleeping instances, storage persistence, database limits and model availability can change. Verify the current terms before committing to this architecture.

A deployed application does not necessarily have to offer live AI from day one. You can deploy a usable dashboard with request management and CRUD first, then enable classification and RAG when the inference environment has been validated. Keep the AI integration behind an interface so the rest of the product remains usable when inference is unavailable.

## 3. Add CI before release

Once the project builds reliably, have the implementation agent create a GitHub Actions workflow appropriate for the selected stack.

At minimum, CI should run:

```
Install locked dependencies
        ↓
Lint / static checks
        ↓
Unit and service-layer tests
        ↓
Acceptance or integration tests
        ↓
Production build
```

Use the existing project commands and avoid hardcoding secrets. Deployment can be a separate workflow that runs only after the required checks pass and you authorize the release.

## 4. Deployment prompt

Use `PROMPT_IMPLEMENTER.md`, with this task-specific instruction:

Task: Prepare and deploy the approved consulting-agency MVP.

Read the canonical project files and inspect the actual repository, build configuration, database setup, and existing CI.

First establish that the production build works locally. Then propose a deployment path that satisfies my $0 constraint, including a compatible database, persistent storage, environment-variable handling, and an inference strategy for classification and RAG.

Verify the current free-tier restrictions of any proposed external service before depending on it. If no suitable free hosting option supports the complete application, explain the trade-offs and provide a viable demo/development alternative.

Implement only the approved deployment configuration. Add or update CI to run the project's actual lint, tests, and build commands.

Do not commit secrets, disable tests to make CI green, or claim a deployment succeeded without observing the deployed application. Ask before creating external resources or performing a production release.

Report the commands executed, actual results, deployment URL if genuinely available, remaining risks, and the smoke tests needed before release.

### Final deployment gate

Before calling the product deployed, verify the actual production URL, login and authorization behavior, CRUD operations, database persistence after restart or redeployment, and one complete request-processing workflow. Test the no-evidence and inference-failure paths for RAG and classification as well.

A successful build alone is not proof of a working production deployment.

# What your daily workflow looks like

After the initial specification and setup, you should spend most of your time managing tasks—not writing long prompts.

Here is an example of your normal development loop.

### Daily engineering loop

0/6 complete

1\. Select a task

Open TASKS.md and choose the next READY task whose dependencies are satisfied.

2\. Launch the local agent

Tell Antigravity the task ID. It reads the repository instructions and relevant specifications.

3\. Review the result

Inspect the diff, test results, and any deviations from scope.

4\. Request independent QA

For meaningful changes, open a fresh QA session and verify the acceptance criteria.

5\. Approve the checkpoint

Commit the verified change and update the task status.

6\. Prepare the handoff

Update HANDOFF.md so a fresh conversation can resume at the exact next action.

## How to tell whether this workflow is working

The goal is not to maximize the number of agents or prompts you use. Measure whether the workflow reduces rework and context switching while preserving correctness.

Track these indicators as the project progresses:

- Task throughput: How many tasks reach verified completion?
- Rework rate: How often does QA find defects that should have been caught before implementation?
- Verification quality: Are tests, lint and builds actually executed and recorded?
- Context recovery: Can a fresh model resume from `HANDOFF.md` without requiring you to explain the entire project?
- Deployment readiness: Can the application be rebuilt and deployed reproducibly from the repository?

If a prompt consistently generates long reports without useful deliverables, shorten it. If a role duplicates another agent's work, merge the responsibilities. If a model repeatedly misses repository context, improve the context packer or the relevant instructions.

## Your first action in this simulation

Do not start coding yet. Start with the brainstorm prompt from Phase 0 and produce the product brief. Then answer the three product questions about request creation, AI autonomy and source documents.

Those decisions determine the right specification, architecture and task plan. Once they are approved, the rest of the workflow becomes an execution process with explicit gates—not a guessing game between chatbots.
