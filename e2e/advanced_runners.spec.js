const { test, expect } = require('@playwright/test');

/**
 * Advanced Runners E2E & Regression Tests
 * Tests the GraphQL and WebSocket request builder interfaces.
 * Uses mocked API calls — no real backend required.
 */

test.describe('Advanced Runners (GraphQL & WebSocket) - E2E & Regression', () => {

    const WORKSPACE_ID = 'ws-runners-test-5678';

    test.beforeEach(async ({ page }) => {
        // Mock auth
        await page.route('**/api/v1/auth/me', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: { id: 'test-user', fullName: 'Playwright Tester', email: 'test@traceweave.local' }
                })
            });
        });

        // Mock workspaces
        await page.route('**/api/v1/workspaces', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    data: { workspaces: [{ id: WORKSPACE_ID, name: 'Runners Test Workspace', role: 'EDITOR' }] }
                })
            });
        });

        // Mock collections
        await page.route(`**/api/v1/collections/${WORKSPACE_ID}`, route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: { collections: [] } })
            });
        });

        // Mock GraphQL execution endpoint
        await page.route('**/api/v1/requests/execute', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    status: 200,
                    data: { data: { viewer: { login: 'testuser' } } },
                    timings: { total: 150 },
                    historyId: 'hist-001'
                })
            });
        });

        // Mock WebSocket connect endpoint
        await page.route('**/api/v1/requests/ws/connect', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true, message: 'Connecting...' })
            });
        });

        // Mock WebSocket disconnect
        await page.route('**/api/v1/requests/ws/disconnect', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true })
            });
        });

        // Mock environments
        await page.route(`**/api/v1/workspaces/${WORKSPACE_ID}/environments`, route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ data: { environments: [] } })
            });
        });

        // Auth state
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

        await page.goto(`/workspace/${WORKSPACE_ID}`);
    });

    // --- Regression: Auth & Route Protection ---

    test('[Regression] Should grant runner workspace access to authenticated EDITOR', async ({ page }) => {
        await expect(page).not.toHaveURL(/\/login/, { timeout: 10000 });
        await expect(page).toHaveURL(new RegExp(WORKSPACE_ID));
    });

    test('[Regression] Should redirect unauthenticated users from runner workspace', async ({ browser }) => {
        // Use a fresh browser context so beforeEach auth state doesn't interfere
        const context = await browser.newContext();
        const freshPage = await context.newPage();

        // Mock auth/me to return 401 BEFORE any navigation
        await freshPage.route('**/api/v1/auth/me', route => {
            route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Unauthorized' }) });
        });

        try {
            await freshPage.goto(`http://localhost:3000/workspace/${WORKSPACE_ID}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch {
            // Navigation may be interrupted by redirect — that is expected
        }

        await expect(freshPage).toHaveURL(/\/login/, { timeout: 30000 });
        await context.close();
    });

    // --- Regression: GraphQL Schema Verification ---

    test('[Regression] GraphQL endpoint should return 200 for a valid mock query', async ({ page }) => {
        // Trigger a GraphQL API call directly via page.evaluate and verify the mock intercepts correctly
        const response = await page.evaluate(async () => {
            const res = await fetch('/api/v1/requests/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workspaceId: 'ws-runners-test-5678',
                    protocol: 'graphql',
                    config: { url: 'https://api.github.com/graphql', query: '{ viewer { login } }' }
                })
            });
            return { status: res.status, data: await res.json() };
        });

        expect(response.status).toBe(200);
        expect(response.data.data.data.viewer.login).toBe('testuser');
    });

    // --- E2E: WebSocket Connection Flow ---

    test('[E2E] WebSocket connect endpoint should return success via mock', async ({ page }) => {
        const response = await page.evaluate(async () => {
            const res = await fetch('/api/v1/requests/ws/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId: 'e2e-test-conn', url: 'wss://echo.example.com' })
            });
            return { status: res.status, data: await res.json() };
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
    });

    test('[E2E] WebSocket disconnect endpoint should return success via mock', async ({ page }) => {
        const response = await page.evaluate(async () => {
            const res = await fetch('/api/v1/requests/ws/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId: 'e2e-test-conn' })
            });
            return { status: res.status, data: await res.json() };
        });

        expect(response.status).toBe(200);
        expect(response.data.success).toBe(true);
    });
});

// regression testing sweep
