// FILE: frontend/tests/e2e/smoke.spec.ts
import { test, expect } from "@playwright/test";

test("landing page renders Novae Conseil heading", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Novae Conseil",
  );
});
