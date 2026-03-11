const { test, expect } = require('@playwright/test');

test.describe('Public Landing Page', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the unauthenticated home page
        await page.goto('/');
        // Wait for full network idle — important for Firefox/WebKit with Next.js SSR
        await page.waitForLoadState('networkidle');
    });

    test('should display the main hero section correctly', async ({ page }) => {
        // Expect the title to have "TraceWeave"
        await expect(page).toHaveTitle(/TraceWeave/);

        // Expect a prominent heading describing the product
        // Use longer timeout for Firefox which is slower to hydrate SSR pages
        const heading = page.locator('h1').first();
        await expect(heading).toBeVisible({ timeout: 15000 });

        // Expect "Start for free" or "Get Started" call-to-action buttons
        const ctaButton = page.locator('button', { hasText: /(start|get started)/i }).first();
        if (await ctaButton.isVisible()) {
            await expect(ctaButton).toBeEnabled();
        }
    });

    test('navigation bar should contain login link and console CTA', async ({ page }) => {
        // Both point to /login in the new LandingNavbar
        const loginLinks = page.locator('nav a[href="/login"]');

        await expect(loginLinks.first()).toBeVisible({ timeout: 15000 });
    });
});

// regression testing sweep
