## Database

SQLite, file-based (`backend/novae.db`), schema created on startup via `Base.metadata.create_all()`.

**When you change a model, delete `novae.db` and restart the server.**
There are no migrations yet — Alembic is deferred until schema changes need to preserve data.

Tests use isolated in-memory SQLite (see `backend/tests/conftest.py`).
