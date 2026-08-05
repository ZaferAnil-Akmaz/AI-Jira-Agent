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

test("shows workout assumptions, ambiguity, and the backend capability task", async ({ page }) => {
  await page.goto("/create");
  await page.getByRole("radio", { name: /Türkçe/ }).check();
  await page
    .getByLabel("Product requirement")
    .fill("Kullanıcılar antrenman takibi için sayfaya sahip olmalı.");
  await page.getByRole("button", { name: "Analyze & generate plan" }).click();

  await expect(page.getByLabel("Epic title")).toHaveValue("Antrenman Takip Sayfası");
  await expect(page.locator(".task-card .badge--backend")).toHaveCount(1);
  await expect(page.getByText("Assumptions", { exact: true })).toBeVisible();
  await expect(page.getByText("Ambiguities", { exact: true })).toBeVisible();
  await expect(page.locator('input[value*="Veri Altyapısının Değerlendirilmesi"]')).toBeVisible();
});
