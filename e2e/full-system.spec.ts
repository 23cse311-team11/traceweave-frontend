import { test, expect, request as playwrightRequest, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// TraceWeave — Full System E2E Test Suite
// Run with: npx playwright test e2e/full-system.spec.ts --ui
//
// Structure:
//   1. Public Pages         — Landing, home, public routes
//   2. Authentication       — Login / Register form validation
//   3. Protected Routes     — Unauthenticated redirect regression
//   4. Workspace Dashboard  — Mocked auth: workspace list & creation modal
//   5. Collection Mgmt      — Mocked auth: sidebar, create collection modal
//   6. Request Builder      — Mocked auth: request panel rendering
//   7. Environment Mgmt     — Mocked auth: environment tab visibility
//   8. True E2E Journey     — Real backend (runs only when gateway is live)
// ─────────────────────────────────────────────────────────────────────────────

// ── Shared helpers ────────────────────────────────────────────────────────────

const MOCK_USER = {
    id: 'test-user-sys',
    fullName: 'System Tester',
    email: 'system@traceweave.local',
    role: 'user',
};

const MOCK_WORKSPACE = {
    id: 'ws-system-test-1234',
    name: 'System Test Workspace',
    description: 'Created by full-system.spec.ts',
    role: 'owner',
};

/** Intercepts auth/me and workspaces to inject a mocked session. */
async function mockAuthenticatedSession(page: Page) {
    await page.route('**/api/v1/auth/me', (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ status: 'success', user: MOCK_USER }),
        })
    );

    // Match exactly the workspace list endpoint — NOT sub-routes like /workspaces/:id
    await page.route(/\/api\/v1\/workspaces(\/?$|\?[^/]*)/, (route) =>
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            // workspaceSlice: const workspaces = response.data || []
            // workspaceApi.getMyWorkspaces returns axiosResponse.data
            // So the mock body (= axiosResponse.data) must have .data as the array
            body: JSON.stringify({
                status: 'success',
                data: [MOCK_WORKSPACE],
            }),
        })
    );

    await page.addInitScript((user: typeof MOCK_USER) => {
        window.localStorage.setItem(
            'auth-storage',
            JSON.stringify({
                state: { user, isAuthenticated: true, isChecking: false },
                version: 0,
            })
        );
        document.cookie = 'jwt=mock-jwt-system-test; path=/; max-age=3600; samesite=lax';
    }, MOCK_USER);
}

/** Intercepts auth/me with 401 to simulate a logged-out visitor. */
async function mockUnauthenticatedSession(page: Page) {
    await page.route('**/api/v1/auth/me', (route) =>
        route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Unauthorized' }),
        })
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PUBLIC PAGES
// ─────────────────────────────────────────────────────────────────────────────
test.describe('1. Public Pages', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test('landing page title contains TraceWeave', async ({ page }) => {
        await expect(page).toHaveTitle(/TraceWeave/i);
    });

    test('hero section h1 is visible', async ({ page }) => {
        await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
    });

    test('navbar contains a login link', async ({ page }) => {
        await expect(page.locator('nav a[href="/login"]').first()).toBeVisible({ timeout: 15000 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. AUTHENTICATION FORMS
// ─────────────────────────────────────────────────────────────────────────────
test.describe('2. Authentication Forms', () => {
    test('login page renders email, password, and submit', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('register page renders name, email, password inputs', async ({ page }) => {
        await page.goto('/register');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('input[placeholder="name@company.com"]')).toBeVisible();
        await expect(page.locator('input[placeholder="••••••••"]')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('empty login does not navigate away from /login', async ({ page }) => {
        await page.goto('/login');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/\/login/);
    });

    test('invalid email format shows validation', async ({ page }) => {
        await page.goto('/login');
        await page.locator('input[type="email"]').fill('not-an-email');
        await page.locator('button[type="submit"]').click();
        await expect(page).toHaveURL(/\/login/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. PROTECTED ROUTE REGRESSION
// ─────────────────────────────────────────────────────────────────────────────
test.describe('3. Protected Route Regression', () => {
    test('unauthenticated /workspace redirects to /login', async ({ page }) => {
        await mockUnauthenticatedSession(page);
        await page.goto('/workspace').catch(e => { if (!e.message.includes('ERR_ABORTED')) throw e; });
        await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
    });

    test('unauthenticated /workspace/:id redirects to /login', async ({ page }) => {
        await mockUnauthenticatedSession(page);
        await page.goto('/workspace/some-fake-id').catch(e => { if (!e.message.includes('ERR_ABORTED')) throw e; });
        await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
    });

    test('unauthenticated /workspace/:id/collections redirects to /login', async ({ page }) => {
        await mockUnauthenticatedSession(page);
        await page.goto('/workspace/some-fake-id/collections').catch(e => { if (!e.message.includes('ERR_ABORTED')) throw e; });
        await expect(page).toHaveURL(/\/login/, { timeout: 30000 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. WORKSPACE DASHBOARD (Mocked Auth)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('4. Workspace Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Set up mocked session (routes + localStorage) BEFORE navigating
        await mockAuthenticatedSession(page);
        // Navigate AND wait for the workspace API response before running any test
        const [response] = await Promise.all([
            page.waitForResponse(/\/api\/v1\/workspaces(\/?$|\?)/),
            page.goto('/workspace'),
        ]);
        // Give React one tick to render after the data arrives
        await page.waitForTimeout(500);
    });

    test('stays on /workspace, does not redirect to /login', async ({ page }) => {
        await expect(page).toHaveURL(/\/workspace/);
    });

    test('renders the Workspaces heading', async ({ page }) => {
        await expect(page.locator('h1', { hasText: 'Workspaces' }).first()).toBeVisible({ timeout: 10000 });
    });

    test('"New Workspace" button is visible', async ({ page }) => {
        await expect(page.locator('button', { hasText: 'New Workspace' }).first()).toBeVisible({ timeout: 10000 });
    });

    test('"Create Workspace" modal opens on button click', async ({ page }) => {
        await page.locator('button', { hasText: 'New Workspace' }).first().click();
        await expect(page.locator('h3', { hasText: 'Create Workspace' })).toBeVisible({ timeout: 8000 });
    });

    test('workspace creation form has Name and Description inputs', async ({ page }) => {
        await page.locator('button', { hasText: 'New Workspace' }).first().click();
        await expect(page.locator('input[placeholder="e.g. Acme Production"]')).toBeVisible();
        await expect(page.locator('textarea[placeholder="Briefly describe the purpose of this workspace..."]')).toBeVisible();
    });

    test('mocked workspace "System Test Workspace" appears in list', async ({ page }) => {
        // Use getByText for a more reliable match than text= locator
        await expect(page.getByText('System Test Workspace', { exact: false }).first()).toBeVisible({ timeout: 10000 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. COLLECTION MANAGEMENT (Mocked Auth)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('5. Collection Management', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthenticatedSession(page);
        await page.addInitScript(() => {
            window.localStorage.setItem(
                'traceweave-ui-state',
                JSON.stringify({ state: { activeView: 'runner', activeSidebarItem: 'Collections' }, version: 0 })
            );
        });
        await page.goto(`/workspace/${MOCK_WORKSPACE.id}/collections`);
        await page.waitForLoadState('load');
    });

    test('stays in workspace after navigating to collections', async ({ page }) => {
        await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 });
        await expect(page).toHaveURL(/\/workspace/);
    });

    test('"Create New" button is present in sidebar', async ({ page }) => {
        const btn = page.locator('button[title="Create New..."]').first();
        await expect(btn).toBeVisible({ timeout: 10000 });
    });

    test('clicking "Create New" shows the Artifact picker modal', async ({ page }) => {
        const btn = page.locator('button[title="Create New..."]').first();
        await expect(btn).toBeVisible({ timeout: 10000 });
        await btn.click();
        await expect(page.locator('h2', { hasText: 'Create New Artifact' })).toBeVisible({ timeout: 10000 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. ENVIRONMENT MANAGEMENT (Mocked Auth)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('6. Environment Management', () => {
    test.beforeEach(async ({ page }) => {
        await mockAuthenticatedSession(page);
        // Mock environments endpoint
        await page.route(`**/api/v1/workspaces/${MOCK_WORKSPACE.id}/environments`, (route) => {
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
                            ],
                        },
                    }),
                });
            } else {
                route.fulfill({ status: 201, body: JSON.stringify({ id: 'env3', name: 'Staging' }) });
            }
        });
        await page.goto(`/workspace/${MOCK_WORKSPACE.id}/environments`);
        await page.waitForLoadState('load');
    });

    test('stays on workspace environment page, no login redirect', async ({ page }) => {
        await expect(page).toHaveURL(/\/workspace/, { timeout: 10000 });
        await expect(page).not.toHaveURL(/\/login/);
    });

    test('environment URL contains /environments', async ({ page }) => {
        await expect(page).toHaveURL(/\/environments/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. TRUE E2E JOURNEY (Real Backend — skips gracefully if Docker is not up)
// ─────────────────────────────────────────────────────────────────────────────
test.describe('7. True End-to-End Journey (Live Backend)', () => {
    const uniqueId = Date.now().toString(36);
    const testEmail = `sys_tester_${uniqueId}@example.com`;
    const testPassword = 'Password123!';
    const testName = `Sys Tester ${uniqueId}`;
    const workspaceName = `SysTest WS ${uniqueId}`;

    let liveBackendBaseUrl = '';

    test.beforeAll(async () => {
        // Try multiple possible backend URLs — accept any response (even 401/404) as proof the server is alive
        const apiCtx = await playwrightRequest.newContext();
        const candidates = [
            'http://localhost:8080',   // Nginx gateway (docker-compose up)
            'http://localhost:4000',   // core-api running directly (npm run dev)
        ];
        for (const baseUrl of candidates) {
            try {
                const res = await apiCtx.get(`${baseUrl}/api/v1/auth/me`, { timeout: 4000 });
                // 401 means auth failed (expected with no token) — server IS running
                if (res.status() < 600) { liveBackendBaseUrl = baseUrl; break; }
            } catch {
                // connection refused — try next
            }
        }
        await apiCtx.dispose();
        if (!liveBackendBaseUrl) {
            test.skip(true,
                'Live backend not reachable on localhost:8080 or localhost:4000 — ' +
                'start with: docker-compose up  OR  npm run dev in backend/core-api'
            );
        }
    });

    test('full journey: Register → Create Workspace → Login → Verify', async ({ page }) => {
        test.setTimeout(180000);

        // Forward all browser /api/v1/* calls directly to the live backend
        // (Next.js proxy rewrite needs a server restart to take effect — this avoids the dependency)
        // SET UP ROUTE BEFORE NAVIGATION so auth checks during hydration are intercepted
        await page.route('**/api/v1/**', async (route) => {
            const req = route.request();
            // Strip any localhost host (port 80, 3000, anything) from the URL and route to the live backend
            const path = req.url().replace(/^https?:\/\/[^/]+\/api\/v1/, '/api/v1');
            const targetUrl = `${liveBackendBaseUrl}${path}`;
            try {
                const response = await page.context().request.fetch(targetUrl, {
                    method: req.method(),
                    headers: { ...req.headers(), 'origin': 'http://localhost:4000' },
                    data: req.postData() ?? undefined,
                });
                await route.fulfill({
                    status: response.status(),
                    headers: Object.fromEntries(
                        Object.entries(response.headers() as Record<string, string>)
                            .filter(([k]) => k !== 'content-encoding')
                    ),
                    body: await response.body(),
                });
            } catch {
                // Backend unreachable — return synthetic 401 so auth store
                // can set isChecking=false and render the login form
                await route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Service unavailable', isAuthenticated: false }),
                });
            }
        });

        // STEP 1: Register
        await test.step('Register a new user account', async () => {
            await page.goto('/register');
            await page.waitForLoadState('networkidle');
            await page.locator('input[placeholder="John Doe"]').fill(testName);
            await page.locator('input[placeholder="name@company.com"]').fill(testEmail);
            await page.locator('input[placeholder="••••••••"]').fill(testPassword);
            await page.locator('button[type="submit"]').click();
            await page.waitForURL('**/workspace', { timeout: 60000 });
            await expect(page.locator('h1', { hasText: 'Workspaces' })).toBeVisible({ timeout: 15000 });
        });

        // STEP 2: Create Workspace
        await test.step('Create a new workspace', async () => {
            await page.locator('button', { hasText: 'New Workspace' }).first().click();
            await expect(page.locator('h3', { hasText: 'Create Workspace' })).toBeVisible({ timeout: 8000 });
            await page.locator('input[placeholder="e.g. Acme Production"]').fill(workspaceName);
            await page.locator('textarea[placeholder="Briefly describe the purpose of this workspace..."]').fill('Full system test');
            await page.locator('form button[type="submit"]').click();
            await expect(page.locator('h3', { hasText: 'Create Workspace' })).toBeHidden({ timeout: 10000 });
            await expect(page.locator(`text=${workspaceName}`)).toBeVisible({ timeout: 10000 });
        });

        // STEP 3: Navigate into Workspace
        await test.step('Navigate into the created workspace', async () => {
            await page.locator(`text=${workspaceName}`).first().click();
            await page.waitForURL(/\/workspace\/.+/, { timeout: 15000 });
            await expect(page).toHaveURL(/\/workspace\/.+/);
        });

        // STEP 4: Session cookie check
        await test.step('Verify JWT session cookie is set', async () => {
            const cookies = await page.context().cookies();
            const token = cookies.find((c) => c.name === 'token');
            expect(token).toBeDefined();
            expect(token!.value.length).toBeGreaterThan(10);
        });

        // STEP 5: Logout and re-login
        await test.step('Logout and re-login', async () => {
            // Clear session state — both cookies (JWT) and localStorage (Zustand auth state)
            await page.context().clearCookies();
            await page.evaluate(() => window.localStorage.clear());
            await page.goto('/login');
            // Wait directly for the email input — avoids fragile waitForResponse which
            // can time out if the auth/me request is aborted or already resolved
            await page.locator('input[placeholder="name@company.com"]').waitFor({ state: 'visible', timeout: 30000 });
            await page.locator('input[placeholder="name@company.com"]').fill(testEmail);
            await page.locator('input[placeholder="••••••••"]').fill(testPassword);
            const nav = page.waitForURL('**/workspace', { timeout: 60000 });
            await page.locator('input[placeholder="••••••••"]').press('Enter');
            await nav;
            await expect(page.locator('h1', { hasText: 'Workspaces' })).toBeVisible({ timeout: 15000 });
            await expect(page.locator(`text=${workspaceName}`)).toBeVisible({ timeout: 10000 });
        });
    });
});

// regression testing sweep

// e2e true journey check
