const { test, expect } = require('@playwright/test');
const jwt = require('jsonwebtoken');

// Use seeded tenant admin user
const adminUser = {
  userId: '33333333-3333-3333-3333-333333333333',
  tenantId: '22222222-2222-2222-2222-222222222222',
  role: 'tenant_admin'
};
const JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

test.describe('Tasks E2E', () => {
  test('create task with assignee / priority / due date and find via filter', async ({ page, baseURL }) => {
    // Create token and set localStorage before navigating
    const token = jwt.sign(adminUser, JWT_SECRET, { expiresIn: '1h' });

    // Visit app and set token
    await page.goto(baseURL + '/');
    await page.evaluate((t) => localStorage.setItem('token', t), token);

    // Navigate to project details (Project Alpha)
    await page.goto(baseURL + '/tenant-admin/projects/66666666-6666-6666-6666-666666666666');

    // Wait for tasks section to render
    await expect(page.locator('h5', { hasText: 'Tasks' })).toBeVisible();

    // Open advanced modal
    await page.click('button:has-text("Add (advanced)")');

    // Fill modal
    await expect(page.locator('h3', { hasText: 'Add Task' })).toBeVisible();
    await page.fill('input[placeholder="Task title"]', 'E2E Task ' + Date.now());
    await page.fill('textarea', 'Created by Playwright E2E test');

    // Set priority
    await page.selectOption('select:has-text("Priority")', 'low');

    // Set assignee (expect Demo User 2 exists)
    await page.selectOption('select:has-text("Assignee")', '55555555-5555-5555-5555-555555555555');

    // Set due date
    await page.fill('input[type="date"]', '2030-01-01');

    // Save
    await page.click('button:has-text("Save")');

    // Wait for the task to appear in the list
    await expect(page.locator('text=E2E Task')).toBeVisible({ timeout: 5000 });

    // Apply filter: priority=low
    await page.selectOption('select', { label: 'Low' });
    await page.click('button:has-text("Apply")');

    // Ensure the created task shows up in filtered list
    const found = await page.locator('text=E2E Task').first();
    await expect(found).toBeVisible();

    // Cleanup: attempt to delete the created task via UI (click Delete on matching item)
    const deleteBtn = found.locator('xpath=ancestor::li//button[text()="Delete"]');
    if (await deleteBtn.count()) {
      await deleteBtn.click();
      // confirm dialog
      await page.waitForTimeout(200); // dialog is native confirm; Playwright will auto-dismiss unless handled.
    }
  });
});