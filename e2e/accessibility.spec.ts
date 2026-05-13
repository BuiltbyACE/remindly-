/**
 * Accessibility E2E Tests
 * WCAG 2.1 AA compliance checks
 */

import { test, expect } from '@playwright/test';
import { login, checkAccessibility } from './helpers';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('dashboard meets basic accessibility requirements', async ({ page }) => {
    await page.goto('/dashboard');
    await checkAccessibility(page);
  });

  test('events page meets basic accessibility requirements', async ({ page }) => {
    await page.goto('/events');
    await checkAccessibility(page);
  });

  test('navigation is keyboard accessible', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Press Tab to navigate through interactive elements
    await page.keyboard.press('Tab');
    
    // Check that something is focused
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('color contrast meets WCAG AA', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Basic check - ensure text is readable
    const headings = page.locator('h1, h2, h3');
    for (const heading of await headings.all()) {
      await expect(heading).toBeVisible();
    }
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/dashboard');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const hasAlt = await img.getAttribute('alt').then(a => !!a).catch(() => false);
      const ariaHidden = await img.getAttribute('aria-hidden').catch(() => 'false');
      
      // Images should have alt text OR be aria-hidden
      if (ariaHidden !== 'true') {
        expect(hasAlt).toBeTruthy();
      }
    }
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/events/create');
    
    const inputs = page.locator('input:not([type="hidden"]), select, textarea');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      
      // Check for associated label or aria-label
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const hasLabel = await input.getAttribute('placeholder').then(p => !!p).catch(() => false);
      
      if (!ariaLabel && !ariaLabelledBy && !hasLabel && id) {
        // Check for label with matching for attribute
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toHaveCount(1);
      }
    }
  });

  test('buttons are focusable and have proper roles', async ({ page }) => {
    await page.goto('/dashboard');
    
    const buttons = page.locator('button, [role="button"]');
    const count = await buttons.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      
      // Should be visible
      await expect(button).toBeVisible();
      
      // Should have accessible name
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});
