import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

// Define the path where Playwright will save the authentication state
const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page, context }) => {

    await page.route('**/api/v1/auth/login', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                status: 'success',
                token: 'e2e-mock-token',
                user: {
                    id: 'test-user',
                    fullName: 'Playwright Tester',
                    email: 'test@traceweave.local',
                    role: 'user'
                }
            })
        });
    });

    await page.route('**/api/v1/auth/me', route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                status: 'success',
                user: {
                    id: 'test-user',
                    fullName: 'Playwright Tester',
                    email: 'test@traceweave.local',
                    role: 'user'
                }
            })
        });
    });

    // Navigate directly to the login page
    await page.goto('/login');

    // Wait for the login page to fully load and hydrate
    await page.waitForLoadState('networkidle');

    // Bypass strict actionability and hydration detachments by injecting directly into the DOM
    await page.evaluate(() => {
        const email = document.querySelector('input[type="email"]');
        const pass = document.querySelector('input[type="password"]');
        const btn = document.querySelector('button[type="submit"]');

        if (email && pass && btn) {
            // React requires native value setters to recognize the change
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;

            nativeInputValueSetter.call(email, 'test@traceweave.local');
            email.dispatchEvent(new Event('input', { bubbles: true }));

            nativeInputValueSetter.call(pass, 'password123');
            pass.dispatchEvent(new Event('input', { bubbles: true }));

            btn.click();
        }
    });

    // Wait for the URL to change to the protected route
    await page.waitForURL('**/workspace');

    // Ensure Zustand is hydrated with the mocked auth API response
    await page.waitForFunction('window.localStorage.getItem("auth-storage") !== null');

    // Since NextJS might use cookies, let's explicitly inject a mock cookie too just to be safe
    await context.addCookies([{
        name: 'jwt',
        value: 'e2e-mock-token',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
    }]);

    // End of authentication steps. Save the storage state (cookies, local storage)
    await page.context().storageState({ path: authFile });
});
