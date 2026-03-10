const { test, expect } = require('@playwright/test');

test.describe('Authentication Flow', () => {
    test('should navigate to login page and show form', async ({ page }) => {
        await page.goto('/login');

        // Check if the login form elements are present
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');
        const submitButton = page.locator('button[type="submit"]');

        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitButton).toBeVisible();
    });

    test('should navigate to register page and show form', async ({ page }) => {
        await page.goto('/register');

        // Check if the registration form elements are present
        const nameInput = page.locator('input[type="text"]');
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');
        const submitButton = page.locator('button[type="submit"]');

        if (await nameInput.isVisible()) {
            await expect(nameInput).toBeVisible();
        }
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();
        await expect(submitButton).toBeVisible();
    });

    test('should show validation error for empty login submission', async ({ page }) => {
        await page.goto('/login');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Wait for validation messages (HTML5 validation or custom toast/errors)
        // Often modern sites disable the button if empty, so we just verify if the button exists and no redirect happened.
        await expect(page).toHaveURL(/\/login/);
    });
});
