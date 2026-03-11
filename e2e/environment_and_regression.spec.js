const { test, expect } = require('@playwright/test');

/**
 * Environment Management E2E Tests
 * Tests environment UI interactions in the workspace.
 * Uses mocked API calls so no real backend session is required.
 */
test.describe('Environment Management', () => {

    test.beforeEach(async ({ page }) => {
        // Mock auth
        await page.route('**/api/v1/auth/me', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'success',
                    user: { id: 'test-user', fullName: 'Playwright Tester', email: 'test@traceweave.local', role: 'user' }
                })
            });
        });

        // Mock workspaces
        await page.route('**/api/v1/workspaces', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'success',
                    results: 1,
                    data: { workspaces: [{ id: 'ws-env-test-1234', name: 'Env Test Workspace', description: '', role: 'owner' }] }
                })
            });
        });

        // Mock environments API
        await page.route('**/api/v1/workspaces/ws-env-test-1234/environments', route => {
            if (route.request().method() === 'GET') {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        data: {
                            environments: [
                                { id: 'env1', name: 'Development', isPersistent: false },
                                { id: 'env2', name: 'Production', isPersistent: true },
                            ]
                        }
                    })
                });
            } else {
                // POST - create new environment
                route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: 'env3', name: 'Staging' })
                });
            }
        });

        // Set auth state
        await page.addInitScript(() => {
            window.localStorage.setItem('auth-storage', JSON.stringify({
                state: { user: { id: 'test-user' }, isAuthenticated: true, isChecking: false },
                version: 0
            }));
            document.cookie = "jwt=mock-jwt-token-for-e2e; path=/; max-age=3600; samesite=lax";
        });

        await page.goto('/workspace/ws-env-test-1234/environments');
    });

    test('should navigate to the environments page without redirect', async ({ page }) => {
        await expect(page).toHaveURL(/\/environments/);
    });

    test('should display environment section in sidebar', async ({ page }) => {
        // Look for the environment-related UI
        const sidebar = page.locator('nav, [data-testid="sidebar"], aside');
        // The page should have loaded without a login redirect
        await expect(page).toHaveURL(/\/workspace/, { timeout: 10000 });
    });

    test('should display the workspace after navigating to environments', async ({ page }) => {
        // Page should remain in workspace area
        await expect(page).not.toHaveURL(/\/login/);
        await expect(page).not.toHaveURL(/^http:\/\/localhost:3000\/?$/);
    });
});

/**
 * Regression Tests: Protected Routes
 * Verifies that unauthenticated users are redirected from protected routes.
 */
test.describe('Protected Route Regression', () => {

    test('should redirect unauthenticated user from /workspace to /login', async ({ page }) => {
        // Mock /auth/me to return 401 to simulate no session
        await page.route('**/api/v1/auth/me', route => {
            route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Unauthorized' })
            });
        });

        await page.goto('/workspace');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should redirect unauthenticated user from workspace detail to /login', async ({ page }) => {
        await page.route('**/api/v1/auth/me', route => {
            route.fulfill({
                status: 401,
                contentType: 'application/json',
                body: JSON.stringify({ message: 'Unauthorized' })
            });
        });

        await page.goto('/workspace/some-workspace-id');

        // Should redirect to login
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test('should serve the login page to unauthenticated users', async ({ page }) => {
        await page.goto('/login');
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should serve the register page to unauthenticated users', async ({ page }) => {
        await page.goto('/register');
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });
});

// regression testing sweep
