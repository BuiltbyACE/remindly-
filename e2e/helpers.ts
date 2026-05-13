/**
 * E2E Test Helpers
 * Common utilities for Playwright tests
 */

import { Page, expect, Locator } from '@playwright/test';

// Test credentials (from dev environment)
export const TEST_USER = {
  email: 'test@remindly.app',
  password: 'testpassword123',
};

/**
 * Login helper
 */
export async function login(page: Page, email = TEST_USER.email, password = TEST_USER.password): Promise<void> {
  await page.goto('/login');
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  
  // Wait for navigation
  await page.waitForURL(/\/dashboard/);
}

/**
 * Logout helper
 */
export async function logout(page: Page): Promise<void> {
  const logoutButton = page.getByRole('button', { name: /logout/i });
  if (await logoutButton.isVisible().catch(() => false)) {
    await logoutButton.click();
  }
  await page.waitForURL(/\/login/);
}

/**
 * Wait for toast notification
 */
export async function expectToast(page: Page, pattern: RegExp | string): Promise<void> {
  const toast = page.locator('[role="alert"], .toast, [data-testid="toast"]').first();
  if (typeof pattern === 'string') {
    await expect(toast).toContainText(pattern);
  } else {
    await expect(toast).toContainText(pattern);
  }
}

/**
 * Wait for loading to complete
 */
export async function waitForLoading(page: Page): Promise<void> {
  // Wait for loading indicators to disappear
  const loaders = page.locator('[data-testid="skeleton"], .animate-pulse, [role="progressbar"]');
  await loaders.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
}

/**
 * Open command palette
 */
export async function openCommandPalette(page: Page): Promise<void> {
  await page.keyboard.press('Control+K');
  await page.locator('[role="dialog"], .command-palette').first().waitFor({ state: 'visible' });
}

/**
 * Navigate via command palette
 */
export async function navigateViaCommandPalette(page: Page, command: string): Promise<void> {
  await openCommandPalette(page);
  await page.getByPlaceholder(/search commands/i).fill(command);
  await page.getByText(command, { exact: false }).first().click();
}

/**
 * Check accessibility (basic)
 */
export async function checkAccessibility(page: Page): Promise<void> {
  // Check for common accessibility issues
  
  // All images should have alt text
  const images = page.locator('img:not([alt])');
  await expect(images).toHaveCount(0);
  
  // All buttons should be keyboard accessible
  const buttons = page.locator('button');
  for (const button of await buttons.all()) {
    await expect(button).toHaveAttribute('type');
  }
  
  // Check for heading hierarchy
  const h1 = page.locator('h1');
  await expect(h1.first()).toBeVisible();
}

/**
 * Mock WebSocket for testing
 */
export async function mockWebSocket(page: Page): Promise<void> {
  await page.evaluate(() => {
    const MockWebSocket = class {
      onopen: (() => void) | null = null;
      onmessage: ((event: { data: string }) => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;
      
      constructor() {
        setTimeout(() => this.onopen?.(), 100);
      }
      
      send() {}
      close() {
        this.onclose?.();
      }
    };
    
    (window as unknown as { WebSocket: typeof MockWebSocket }).WebSocket = MockWebSocket;
  });
}

/**
 * Simulate offline mode
 */
export async function goOffline(page: Page): Promise<void> {
  await page.context().setOffline(true);
}

/**
 * Simulate online mode
 */
export async function goOnline(page: Page): Promise<void> {
  await page.context().setOffline(false);
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}
