## HANDOFF TO IMPLEMENTATION AGENT

### Context & Goal

You are building the Novae Conseil MVP — a secure, $0 budget consulting request platform with server-mediated AI classification, human correction, and client/project CRUD using Next.js (App Router), ShadcnUI, FastAPI (for the backend service handles data storage, business logic, and AI mediation), and SQLite (Drizzle ORM).

### Key Architectural Guidelines

1. Do NOT make direct LLM calls from client components. Always route via `src/lib/ai/mediator.ts`.
2. Keep `ai_suggested_category` and `final_category` distinct in the database schema. Set `human_corrected_flag = true` whenever staff overrides the AI suggestion.
3. Fallback gracefully: If AI times out or fails, save request as `status = 'pending_review'` and `ai_suggested_category = 'uncertain'`. Do NOT throw a 500 error or drop the request.
4. Enforce rate limiting (1 req/sec, 30 req/day per IP) on `/api/requests`.

### Immediate Next Task

Begin with **T-101: Environment Bootstrap & Database Schema Definition**.

## Recommended Monorepo File & Folder Structure

```text
novae-conseil/
├── .env.example
├── docker-compose.yml          # Optional: Local multi-container orchestration ($0)
├── README.md
├── package.json                # Root or workspace scripts if applicable
├──
├── frontend/                   # Next.js (App Router) + ShadcnUI
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── app/                # App Router pages
│   │   │   ├── page.tsx        # Public landing & intake form
│   │   │   ├── login/          # Staff login page
│   │   │   └── admin/          # Protected internal dashboard
│   │   │       ├── dashboard/  # Request queue & details
│   │   │       └── clients/    # Client & project management
│   │   ├── components/         # Reusable UI components (ShadcnUI)
│   │   └── lib/                # API client wrappers & state utilities
│   └── tests/
│       └── e2e/                # Playwright E2E test suite
│           └── workflow.spec.ts
│
└── backend/                    # FastAPI (Python) + SQLite
    ├── requirements.txt
    ├── main.py                 # FastAPI application entrypoint
    ├── app/
    │   ├── api/                # API Routers (Endpoints)
    │   │   ├── v1/
    │   │   │   ├── endpoints/
    │   │   │   │   ├── requests.py # Public intake & staff request endpoints
    │   │   │   │   ├── auth.py     # Staff authentication & RBAC
    │   │   │   │   └── clients.py  # Client & project CRUD
    │   │   │   └── router.py
    │   │   └── deps.py         # Dependency injections (DB session, current user)
    │   ├── core/               # Configuration & Infrastructure
    │   │   ├── config.py       # Environment variables & settings
    │   │   ├── database.py     # SQLite engine & session setup
    │   │   ├── security.py     # Password hashing & JWT/Session handling
    │   │   └── rate_limiter.py # Sliding window rate-limiting middleware
    │   ├── models/             # SQLAlchemy / SQLModel database models
    │   │   ├── request.py
    │   │   ├── client.py
    │   │   └── audit.py
    │   ├── schemas/            # Pydantic validation schemas (Request, Response)
    │   │   ├── request_schema.py
    │   │   └── client_schema.py
    │   └── services/           # Business logic & External integrations
    │       ├── ai_mediator.py  # Server-mediated AI classification & taxonomy validation
    │       └── workflow.py     # Request state machine & lifecycle management
    └── tests/                  # Pytest backend test suite
        ├── conftest.py
        ├── test_intake.py
        ├── test_ai_mediator.py
        └── test_clients.py
```
