const { test, expect } = require('@playwright/test');

test.describe('Request Builder Interface', () => {

    test.beforeEach(async ({ page }) => {
        // Intercept `authApi.getMe()`
        await page.route('**/api/v1/auth/me', route => {
            route.fulfill({
                status: 200,
                body: JSON.stringify({ status: 'success', user: { id: 'test-user', fullName: 'Playwright Tester', email: 'test@traceweave.local', role: 'user' } })
            });
        });

        // Intercept workspaces API
        await page.route('**/api/v1/workspaces', route => {
            route.fulfill({
                status: 200,
                body: JSON.stringify({ status: 'success', results: 1, data: { workspaces: [{ id: 'workspace-e2e-id-1234', name: 'E2E Test Workspace', description: '', role: 'owner' }] } })
            });
        });

        await page.addInitScript(() => {
            window.localStorage.setItem('auth-storage', JSON.stringify({
                state: { user: { id: 'test-user' }, isAuthenticated: true, isChecking: false },
                version: 0
            }));
            window.localStorage.setItem('traceweave-ui-state', JSON.stringify({
                state: { activeView: 'runner', activeSidebarItem: 'Collections' },
                version: 0
            }));
            document.cookie = "jwt=mock-jwt-token-for-e2e; path=/; max-age=3600; samesite=lax";
        });

        // Navigate directly to a mock workspace environment in the runner view
        await page.goto('/workspace/workspace-e2e-id-1234/collections');
    });

    test('should render Request Builder elements after creating a new HTTP request', async ({ page }) => {
        // Find the global "New" button
        const addArtifactBtn = page.locator('button[title="Create New..."]').first();
        await expect(addArtifactBtn).toBeVisible({ timeout: 10000 });
        await addArtifactBtn.click();

        // Click the "HTTP" option from the grid
        const newHttpOption = page.locator('button', { hasText: 'HTTP' });
        await newHttpOption.click();

        // Verify the Send button mounts in the RequestBuilder
        const sendBtn = page.locator('button:text-is("Send")').first();
        await expect(sendBtn).toBeVisible({ timeout: 10000 });

        // Verify the Protocol Switcher defaults to HTTP
        const protocolText = page.locator('span:text-is("HTTP")').first();
        await expect(protocolText).toBeVisible();
    });

    test('should enter a URL and render tabs', async ({ page }) => {
        // Find the global "New" button
        const addArtifactBtn = page.locator('button[title="Create New..."]').first();
        await expect(addArtifactBtn).toBeVisible({ timeout: 10000 });
        await addArtifactBtn.click();

        // Click the "HTTP" option from the grid
        const newHttpOption = page.locator('button', { hasText: 'HTTP' });
        await newHttpOption.click();

        // URL Input Bar
        const urlInput = page.locator('input[placeholder="Enter URL or paste request"]');
        await expect(urlInput).toBeVisible({ timeout: 10000 });
        await urlInput.fill('https://api.github.com/users/octocat');

        // Check if the tabs exist below the URL bar
        const paramsTab = page.locator('div:text-is("Params")').first();
        const headersTab = page.locator('div:text-is("Headers")').first();
        const bodyTab = page.locator('div:text-is("Body")').first();

        await expect(paramsTab).toBeVisible();
        await expect(headersTab).toBeVisible();
        await expect(bodyTab).toBeVisible();
    });

});
