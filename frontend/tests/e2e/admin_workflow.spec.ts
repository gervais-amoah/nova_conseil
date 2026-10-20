// FILE: frontend/tests/e2e/admin_workflow.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Admin Workflow", () => {
  test("login, view request, and override category", async ({ page }) => {
    // 0. Check that everything works
    page.on("dialog", (d) => console.log("DIALOG:", d.message()));

    // 1. Setup: Create a request via API so it exists in the DB
    const apiResponse = await page.request.post(
      "http://localhost:8000/api/v1/requests",
      {
        data: {
          name: "E2E Test Client",
          email: "e2e@example.com",
          message: "I need help with my taxes.",
        },
      },
    );
    expect(apiResponse.ok()).toBeTruthy();
    const responseData = await apiResponse.json();
    const referenceId = responseData.reference_id;

    // 2. Go to login page
    await page.goto("http://localhost:3000/login");

    // 3. Log in with seeded staff user
    await page.getByLabel("Email", { exact: true }).fill("admin@example.com");
    await page.getByLabel("Password", { exact: true }).fill("dev-password");
    await page.getByRole("button", { name: /login/i }).click();

    // 4. Verify redirect to admin requests
    await expect(page).toHaveURL(/.*\/admin\/requests/);

    // 5. Find the request in the list and click it
    // Wait for the table/list to render the reference ID
    await expect(page.getByText(referenceId)).toBeVisible({ timeout: 10000 });
    await page.getByText(referenceId).click();

    // 6. Verify we are on the detail page
    await expect(page).toHaveURL(/.*\/admin\/requests\/\d+/);

    // 7. Verify the override form exists
    await expect(
      page.getByLabel("Final Category", { exact: true }),
    ).toBeVisible();

    // 8. Change the category and save
    await page.getByLabel("Final Category", { exact: true }).fill("Finance");
    await page.getByRole("button", { name: /save/i }).click();

    // 9. Verify success state (human corrected flag or updated category visible)
    // We check for the updated category value in the UI
    await expect(page.getByTestId("final-category")).toHaveText("Finance");
    await expect(page.getByTestId("human-corrected")).toHaveText("Yes");
  });
});
