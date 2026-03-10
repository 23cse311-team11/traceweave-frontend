const { test, expect } = require('@playwright/test');

test.describe('Dashboard and Workspace Navigation', () => {

    test.beforeEach(async ({ page }) => {
        // Intercept `authApi.getMe()` to return a valid user payload so the frontend considers the user authenticated.
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

        // Intercept workspaces API calls to provide mock data for the dashboard rendering
        await page.route('**/api/v1/workspaces', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 'success',
                    results: 1,
                    data: { workspaces: [{ id: 'workspace-e2e-id-1234', name: 'E2E Test Workspace', description: 'A mock workspace for Playwright', role: 'owner' }] }
                })
            });
        });

        // Initialize the browser context with the Zustand local storage state AND the JWT cookie
        await page.addInitScript(() => {
            window.localStorage.setItem('auth-storage', JSON.stringify({
                state: { user: { id: 'test-user', fullName: 'Playwright Tester', email: 'test@traceweave.local', role: 'user' }, isAuthenticated: true, isChecking: false },
                version: 0
            }));
            document.cookie = "jwt=mock-jwt-token-for-e2e; path=/; max-age=3600; samesite=lax";
        });

        // Navigate directly to the protected dashboard route
        await page.goto('/workspace');
    });

    test('should render the workspace dashboard successfully', async ({ page }) => {
        // Verify the URL remains /workspace and doesn't redirect to /login
        await expect(page).toHaveURL(/\/workspace/);

        // Verify the dashboard header contains the Workspaces h1
        const userName = page.locator('h1', { hasText: 'Workspaces' });
        await expect(userName.first()).toBeVisible();

        // Verify the "New Workspace" button exists
        const createButton = page.locator('button', { hasText: 'New Workspace' }).first();
        await expect(createButton).toBeVisible();
    });

    test('should open the "Create Workspace" modal', async ({ page }) => {
        const createButton = page.locator('button', { hasText: 'New Workspace' }).first();
        await createButton.click();

        // Verify the modal title
        const modalTitle = page.locator('h3', { hasText: 'Create Workspace' });
        await expect(modalTitle).toBeVisible();

        // Wait for the Name and Description inputs
        const workspaceNameInput = page.locator('input[placeholder="e.g. Acme Production"]');
        const workspaceDescInput = page.locator('textarea[placeholder="Briefly describe the purpose of this workspace..."]');

        await expect(workspaceNameInput).toBeVisible();
        await expect(workspaceDescInput).toBeVisible();
    });

});
