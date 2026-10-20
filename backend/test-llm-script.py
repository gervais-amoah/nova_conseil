import asyncio
import time
from pathlib import Path

from app.core.config import Settings
from app.services.ai_client import make_ai_client
from app.services.prompt_guard import build_messages
from scripts.evaluate_ai import load_fixture


async def main():
    settings = Settings()
    client = make_ai_client(settings)
    # 60s timeout for pure diagnosis — we want to know the true latency
    if hasattr(client, "_timeout"):
        client._timeout = 60
    examples = load_fixture(Path("tests/fixtures/labeled_requests.json"))

    for ex in examples:
        msgs = build_messages(ex.text)
        t0 = time.perf_counter()
        try:
            raw = await client.complete(
                system=msgs[0]["content"], user=msgs[1]["content"]
            )
            dt = time.perf_counter() - t0
            ok = "OK"
            preview = raw[:60].replace(chr(10), " ")
        except Exception as e:
            dt = time.perf_counter() - t0
            ok = "ERR"
            preview = repr(e)[:60]
        print(f"{dt:7.2f}s {ok} {ex.id:20s} {preview}")


asyncio.run(main())
