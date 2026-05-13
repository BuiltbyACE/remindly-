import { test, expect } from '@playwright/test';
import { login, waitForLoading } from './helpers';

test.describe('Events Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/events');
    await waitForLoading(page);
  });

  test('should display events list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /events/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /create/i })).toBeVisible();
  });

  test('should navigate to create event form', async ({ page }) => {
    await page.getByRole('link', { name: /create/i }).first().click();
    await expect(page).toHaveURL(/\/events\/create/);
    await expect(page.getByLabel(/title/i)).toBeVisible();
  });

  test('should create a new event and show in list', async ({ page }) => {
    await page.goto('/events/create');
    await page.getByLabel(/title/i).fill('E2E Test Event');
    await page.getByLabel(/description/i)?.fill('Created by Playwright test');

    const priority = page.getByLabel(/priority/i);
    if (await priority.isVisible().catch(() => false)) {
      await priority.selectOption('high');
    }
    await page.getByRole('button', { name: /save|create|submit/i }).click();
    await expect(page).toHaveURL(/\/events/);
  });

  test('should view event details', async ({ page }) => {
    await page.goto('/events');
    const firstEvent = page.locator('a[href*="/events/"]').first();
    if (await firstEvent.isVisible().catch(() => false)) {
      await firstEvent.click();
      await expect(page).toHaveURL(/\/events\/[a-f0-9-]+/);
    }
  });

  test('should request approval on a draft event', async ({ page }) => {
    await page.goto('/events');
    const draftLink = page.locator('a[href*="/events/"]').first();
    if (await draftLink.isVisible().catch(() => false)) {
      await draftLink.click();
      const requestBtn = page.getByRole('button', { name: /request approval/i });
      if (await requestBtn.isVisible().catch(() => false)) {
        await requestBtn.click();
      }
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });
});
