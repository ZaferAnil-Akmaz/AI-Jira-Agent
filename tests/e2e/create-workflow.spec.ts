import { expect, test } from "@playwright/test";

test("generates, reviews, and creates mock Jira issues", async ({ page }) => {
  await page.goto("/create");
  await page
    .getByLabel("Product requirement")
    .fill("Allow workspace administrators to export their monthly activity reports in CSV format.");
  await page.getByRole("button", { name: "Analyze & generate plan" }).click();
  await expect(page.getByRole("heading", { name: "new feature" })).toBeVisible();
  await page.getByRole("button", { name: "Approve & create in Jira" }).click();
  await expect(page.getByRole("heading", { name: /Created in/ })).toBeVisible();
  await expect(page.getByText("Open in Jira").first()).toBeVisible();
});

test("opens the Jira settings page", async ({ page }) => {
  await page.goto("/create");
  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByLabel("Jira base URL")).toBeVisible();
  await expect(page.getByLabel("Jira project key")).toBeVisible();
});

test("uses Turkish requirement and visual context in the generated plan", async ({ page }) => {
  await page.goto("/create");
  await page.getByRole("radio", { name: /Türkçe/ }).check();
  await page
    .getByLabel("Product requirement")
    .fill(
      "Kullanıcıların beslenme ve antreman takipleri için yeni bir sayfa geliştirmeyi istiyorum.",
    );
  await page.getByLabel(/Additional context/).fill("Sayfada ana tema kırmızı ve beyaz olmalı.");
  await page.getByRole("button", { name: "Analyze & generate plan" }).click();
  await expect(page.getByLabel("Epic title")).toHaveValue("Beslenme ve Antrenman Takip Sayfası");
  await expect(page.getByText("Kırmızı ve beyaz", { exact: false }).first()).toBeVisible();
  await expect(page.locator(".task-card .badge--backend")).toHaveCount(0);
});

test("shows the backend task without removed planning-detail fields", async ({ page }) => {
  await page.goto("/create");
  await page.getByRole("radio", { name: /Türkçe/ }).check();
  await page
    .getByLabel("Product requirement")
    .fill("Kullanıcılar antrenman takibi için sayfaya sahip olmalı.");
  await page.getByRole("button", { name: "Analyze & generate plan" }).click();

  await expect(page.getByLabel("Epic title")).toHaveValue("Antrenman Takip Sayfası");
  await expect(page.locator(".task-card .badge--backend")).toHaveCount(1);
  await expect(page.locator('input[value*="Veri Altyapısının Değerlendirilmesi"]')).toBeVisible();
  await expect(page.getByText("Semantic warnings", { exact: true })).toBeVisible();
  await expect(page.getByText("Feature analysis", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Capability check", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Assumptions", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Risks", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Ambiguities", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Workstream decisions", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Task dependency graph", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel(/Depends on task IDs/)).toHaveCount(0);
});

test("orders messaging task cards as Backend, Frontend, then QA", async ({ page }) => {
  await page.goto("/create");
  await page.getByRole("radio", { name: /Türkçe/ }).check();
  await page.getByLabel("Product requirement").fill("Mesajlaşma özelliği geliştirmek istiyorum.");
  await page.getByRole("button", { name: "Analyze & generate plan" }).click();

  await expect(page.locator(".task-card .badge")).toHaveText(["Backend", "Frontend", "QA"]);
  await expect(page.locator(".task-card__description").first()).toHaveAttribute("rows", "7");
  await expect(page.locator(".epic-card")).toBeVisible();
  const epicToggle = page.getByRole("checkbox", { name: "Create Epic" });
  await expect(epicToggle).toBeChecked();
  await epicToggle.click();
  await expect(epicToggle).not.toBeChecked();
  await expect(page.getByLabel("Epic title")).toBeDisabled();
  await page.getByPlaceholder("new-label").fill("ready-for-review");
  await page.getByRole("button", { name: "Add label" }).click();
  await expect(page.getByRole("button", { name: /ready-for-review/ })).toBeVisible();
});

test("allows a reviewer to revise an individual task without regenerating the plan", async ({
  page,
}) => {
  await page.goto("/create");
  await page
    .getByLabel("Product requirement")
    .fill("Users should have a page where they can track their workouts.");
  await page.getByRole("button", { name: "Analyze & generate plan" }).click();

  const task = page.locator(".task-card").first();
  await task
    .getByLabel("Ask AI to improve this task")
    .fill("Make the acceptance criteria more specific.");
  await task.getByRole("button", { name: "Improve task" }).click();
  await expect(task.getByLabel("Description")).toHaveValue(/Revision Notes/);
});
