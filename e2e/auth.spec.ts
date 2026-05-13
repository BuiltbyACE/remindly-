/**
 * Authentication E2E Tests
 * Login, logout, session management
 */

import { test, expect } from '@playwright/test';
import { login, logout, expectToast } from './helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder(/email/i).fill('invalid@example.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await expectToast(page, /invalid credentials/i);
  });

  test('should login successfully and redirect', async ({ page }) => {
    await login(page);
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Dashboard should be visible
    await expect(page.getByText(/dashboard|overview/i)).toBeVisible();
  });

  test('should persist session after reload', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Reload page
    await page.reload();
    
    // Should still be logged in
    await expect(page.getByText(/dashboard|overview/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /logout/i })).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await login(page);
    await logout(page);
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect authenticated users away from login', async ({ page }) => {
    await login(page);
    
    // Try to access login page while authenticated
    await page.goto('/login');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
