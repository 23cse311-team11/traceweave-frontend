const { test, expect } = require('@playwright/test');

/**
 * Workspace Management E2E & Regression Tests
 * Tests workspace creation, switching, member management.
 * Uses mocked API calls — no real backend required.
 */

test.describe('Workspace Management - E2E & Regression', () => {

    const mockWorkspaces = [
        { id: 'ws-alpha', name: 'Alpha Project', description: 'First workspace', role: 'owner' },
        { id: 'ws-beta', name: 'Beta Project', description: 'Second workspace', role: 'EDITOR' }
    ];

    test.beforeEach(async ({ page }) => {
        // Mock auth
        await page.route('**/api/v1/auth/me', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'success',
                    user: { id: 'test-user', fullName: 'Playwright Tester', email: 'test@traceweave.local' }
                })
            });
        });

        // Mock workspaces list
        await page.route('**/api/v1/workspaces', route => {
            if (route.request().method() === 'GET') {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        data: { workspaces: mockWorkspaces }
                    })
                });
            } else if (route.request().method() === 'POST') {
                route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        status: 'success',
                        data: { workspace: { id: 'ws-new-123', name: 'New E2E Workspace', role: 'owner' } }
                    })
                });
            } else {
                route.continue();
            }
        });

        // Mock workspace creation endpoint
        await page.route('**/api/v1/workspaces/create', route => {
            route.fulfill({
                status: 201,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 'ws-new-123',
                    name: 'New E2E Workspace',
                    role: 'owner'
                })
            });
        });

        // Mock specific workspace member API
        await page.route('**/api/v1/workspaces/ws-alpha/**', route => {
            const url = route.request().url();
            if (url.includes('/members')) {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Member operation successful' })
                });
            } else {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ id: 'ws-alpha', name: 'Alpha Project', members: [] })
                });
            }
        });

        // Set auth state in localStorage
        await page.addInitScript(() => {
            window.localStorage.setItem('auth-storage', JSON.stringify({
                state: {
                    user: { id: 'test-user', fullName: 'Playwright Tester', email: 'test@traceweave.local' },
                    isAuthenticated: true,
                    isChecking: false
                },
                version: 0
            }));
            document.cookie = "jwt=mock-jwt-token-for-e2e; path=/; max-age=3600; samesite=lax";
        });

        await page.goto('/workspace');
    });

    // --- Regression Tests ---

    test('[Regression] Should display workspace list on the dashboard', async ({ page }) => {
        await expect(page).toHaveURL(/\/workspace/, { timeout: 10000 });
        await expect(page.locator('h1', { hasText: 'Workspaces' }).first()).toBeVisible();
    });

    test('[Regression] Should show "New Workspace" button for authenticated users', async ({ page }) => {
        const newBtn = page.locator('button', { hasText: 'New Workspace' }).first();
        await expect(newBtn).toBeVisible({ timeout: 8000 });
    });

    test('[Regression] Should redirect unauthenticated users from workspace dashboard', async ({ page }) => {
        // Override auth to be unauthenticated for this test
        await page.route('**/api/v1/auth/me', route => {
            route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) });
        });
        await page.goto('/workspace');
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    // --- E2E Tests ---

    test('[E2E] Should open Create Workspace modal when clicking New Workspace', async ({ page }) => {
        const newBtn = page.locator('button', { hasText: 'New Workspace' }).first();
        await expect(newBtn).toBeVisible({ timeout: 8000 });
        await newBtn.click();

        const modal = page.locator('h3, h2', { hasText: /Create Workspace/i });
        await expect(modal.first()).toBeVisible({ timeout: 5000 });
    });

    test('[E2E] Should navigate into a workspace when accessing its URL directly', async ({ page }) => {
        // Navigate directly to the workspace detail page (mocked route)
        await page.route('**/api/v1/workspaces/ws-alpha', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ id: 'ws-alpha', name: 'Alpha Project', members: [] })
            });
        });

        await page.goto('/workspace/ws-alpha');

        // Should navigate to that workspace without redirect to login
        await expect(page).toHaveURL(/\/workspace\/ws-alpha/, { timeout: 10000 });
        await expect(page).not.toHaveURL(/\/login/);
    });
});
