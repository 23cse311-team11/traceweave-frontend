const { test, expect, request } = require('@playwright/test');

test.describe('True End-to-End User Journey', () => {
    // Generate a unique identifier for this test run to avoid collision
    const uniqueId = Date.now().toString(36);
    const testEmail = `tester_${uniqueId}@example.com`;
    const testPassword = 'Password123!';
    const testName = `E2E Tester ${uniqueId}`;
    const workspaceName = `E2E WS ${uniqueId}`;

    // ── Check backend is running before any test ───────────────────────────
    test.beforeAll(async () => {
        const apiContext = await request.newContext();
        let backendUp = false;
        try {
            const res = await apiContext.get('http://localhost:8080/api/v1/health', { timeout: 5000 });
            backendUp = res.status() < 500;
        } catch {
            backendUp = false;
        }
        await apiContext.dispose();
        if (!backendUp) {
            test.skip(true, 'Backend gateway not reachable on localhost:80 — make sure docker-compose is running');
        }
    });

    test('Complete user journey: Register → Workspace → Navigate', async ({ page }) => {
        // Debugging: Log browser console errors
        page.on('console', msg => {
            if (msg.type() === 'error') console.log(`BROWSER ERROR [${msg.text()}]`);
        });

        test.setTimeout(90000); // Extended timeout for full journey

        // ── STEP 1: REGISTRATION ─────────────────────────────────
        await test.step('Register a new user account', async () => {
            const isWebKit = test.info().project.name === 'webkit';

            await page.goto('/register');
            await page.waitForLoadState('networkidle');

            if (isWebKit) {
                console.log('WEBKIT DETECTED: Adding hydration delay...');
                await page.waitForTimeout(3000); // 3s delay for hydration
            }

            // Fill the registration form using exact placeholder values from the source
            await page.locator('input[placeholder="John Doe"]').fill(testName);
            await page.locator('input[placeholder="name@company.com"]').fill(testEmail);
            await page.locator('input[placeholder="••••••••"]').fill(testPassword);

            console.log(`Submitting registration for ${testEmail}...`);
            // Click "GET STARTED" submit button
            await page.locator('button[type="submit"]').click();

            // Backend returns 201 Created, frontend redirects to /workspace
            try {
                await page.waitForURL('**/workspace', { timeout: 30000 });
                console.log('Registration redirect successful');
            } catch (err) {
                console.log(`Registration redirect failed: ${err.message}`);
                // Capture screenshot on failure
                await page.screenshot({ path: `test-results/registration-failure-${test.info().project.name}.png` });
                throw err;
            }
            await expect(page.locator('h1', { hasText: 'Workspaces' })).toBeVisible({ timeout: 15000 });
        });

        // ── STEP 2: CREATE WORKSPACE ─────────────────────────────
        await test.step('Create a new workspace', async () => {
            // Click "New Workspace" button
            const newWsBtn = page.locator('button', { hasText: 'New Workspace' });
            await expect(newWsBtn).toBeVisible({ timeout: 5000 });
            await newWsBtn.click();

            // Verify modal appeared
            await expect(page.locator('h3', { hasText: 'Create Workspace' })).toBeVisible({ timeout: 5000 });

            // Fill workspace details
            await page.locator('input[placeholder="e.g. Acme Production"]').fill(workspaceName);
            await page.locator('textarea[placeholder="Briefly describe the purpose of this workspace..."]').fill('True E2E test workspace');

            // Submit via the form submit button
            await page.locator('form button[type="submit"]').click();

            // Modal should close
            await expect(page.locator('h3', { hasText: 'Create Workspace' })).toBeHidden({ timeout: 10000 });

            // The new workspace should appear in the workspace list
            await expect(page.locator(`text=${workspaceName}`)).toBeVisible({ timeout: 10000 });
        });

        // ── STEP 3: ENTER WORKSPACE ──────────────────────────────
        await test.step('Navigate into the created workspace', async () => {
            // Click the workspace card/link
            await page.locator(`text=${workspaceName}`).first().click();

            // Should navigate to /workspace/<uuid>
            await page.waitForURL(/\/workspace\/.+/, { timeout: 15000 });
            await expect(page).toHaveURL(/\/workspace\/.+/);
        });

        // ── STEP 4: SESSION COOKIE VALIDATION ────────────────────
        await test.step('Verify JWT session cookie is persisted', async () => {
            const cookies = await page.context().cookies();
            const tokenCookie = cookies.find(c => c.name === 'token');

            // The backend sets an httpOnly cookie named "token"
            expect(tokenCookie).toBeDefined();
            expect(tokenCookie.value.length).toBeGreaterThan(10);
        });

        // ── STEP 5: RE-LOGIN AFTER LOGOUT ────────────────────────
        await test.step('Logout and re-login to verify credential persistence', async () => {
            const isWebKit = test.info().project.name === 'webkit';

            // Clear the token cookie to simulate logout
            await page.context().clearCookies();

            // Navigate to login
            await page.goto('/login');
            await page.waitForLoadState('networkidle');

            if (isWebKit) {
                console.log('WEBKIT DETECTED: Adding hydration delay before re-login...');
                await page.waitForTimeout(3000);
            }

            await expect(page.locator('h1', { hasText: 'WELCOME BACK' })).toBeVisible({ timeout: 10000 });

            // Login with the previously created credentials
            await page.locator('input[placeholder="name@company.com"]').fill(testEmail);
            await page.locator('input[placeholder="••••••••"]').fill(testPassword);

            // Pre-register the URL expectation BEFORE clicking to avoid a race
            // condition on WebKit where the navigation event fires before the
            // Promise.all listener is registered.
            const navigationPromise = page.waitForURL('**/workspace', { timeout: 45000 });
            await page.locator('button[type="submit"]').click();
            await navigationPromise;

            await expect(page.locator('h1', { hasText: 'Workspaces' })).toBeVisible({ timeout: 10000 });

            // Verify the previously created workspace still appears
            await expect(page.locator(`text=${workspaceName}`)).toBeVisible({ timeout: 10000 });
        });
    });
});

// regression testing sweep

// e2e true journey check
