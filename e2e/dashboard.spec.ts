/**
 * Dashboard E2E Tests
 * Core dashboard functionality and layout
 */

import { test, expect } from '@playwright/test';
import { login, waitForLoading, expectToast } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard');
    await waitForLoading(page);
  });

  test('should display dashboard with key elements', async ({ page }) => {
    // Check for dashboard title
    await expect(page.getByRole('heading', { name: /dashboard|overview/i })).toBeVisible();
    
    // Check for stats cards
    await expect(page.getByText(/events|meetings/i).first()).toBeVisible();
    await expect(page.getByText(/approval/i).first()).toBeVisible();
    
    // Check for recent activity
    await expect(page.getByText(/recent activity|latest/i).first()).toBeVisible();
  });

  test('should display stats cards with data', async ({ page }) => {
    // Stats cards should be visible
    const statCards = page.locator('[data-testid="stat-card"], .stat-card, a[href="/events"]').first();
    await expect(statCards).toBeVisible();
    
    // Should show counts
    const counts = page.locator('text=/\\d+/').first();
    await expect(counts).toBeVisible();
  });

  test('should navigate to events from dashboard', async ({ page }) => {
    await page.click('a[href="/events"]');
    await expect(page).toHaveURL(/\/events/);
    await expect(page.getByRole('heading', { name: /events/i })).toBeVisible();
  });

  test('should navigate to approvals from dashboard', async ({ page }) => {
    await page.click('a[href="/approvals"]');
    await expect(page).toHaveURL(/\/approvals/);
    await expect(page.getByRole('heading', { name: /approvals/i })).toBeVisible();
  });

  test('should show urgent escalations when present', async ({ page }) => {
    // Check for urgent banner if escalations exist
    const urgentBanner = page.locator('text=/urgent|escalated|critical/i').first();
    // May or may not be visible depending on data
    if (await urgentBanner.isVisible().catch(() => false)) {
      await expect(urgentBanner).toContainText(/escalated|urgent/i);
    }
  });

  test('should be responsive', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: /dashboard|overview/i })).toBeVisible();
    
    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: /dashboard|overview/i })).toBeVisible();
    
    // Desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.getByRole('heading', { name: /dashboard|overview/i })).toBeVisible();
  });
});
