// FILE: frontend/tests/e2e/intake.spec.ts
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("submitting the public form shows a success state with reference id", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel(/name/i).fill("Ada Lovelace");
  await page.getByLabel(/email/i).fill("ada@example.com");
  await page
    .getByLabel(/message/i)
    .fill("We need help designing a go-to-market strategy for Q1.");

  const responsePromise = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/v1/requests") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: /send request/i }).click();
  const response = await responsePromise;

  expect(response.status()).toBe(201);
  await expect(page.getByText(/REQ-[A-F0-9]{12}/)).toBeVisible();
});

test("invalid email shows an inline error and no success state", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel(/name/i).fill("Ada Lovelace");
  // Bypass HTML5 email validation by using an input that the browser
  // accepts but the server rejects. e.g. "a@b" passes type=email
  // in some browsers but fails Pydantic's stricter check.
  await page.getByLabel(/email/i).fill("a@b");
  await page.getByLabel(/message/i).fill("Hello.");

  await page.getByRole("button", { name: /send request/i }).click();

  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: /please check the form fields/i }),
  ).toBeVisible();

  await expect(page.getByText(/REQ-[A-F0-9]{12}/)).not.toBeVisible();
});
