const { test, expect } = require('@playwright/test')
const { login } = require('./helpers')

test.describe('Admin auth', () => {
  test('shows the login screen when signed out', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.getByText('Lead Dashboard')).toBeVisible()
    await expect(page.getByText('Staff access only')).toBeVisible()
  })

  test('rejects a wrong password', async ({ page }) => {
    await page.goto('/admin')
    await page.getByLabel('Password').fill('definitely-wrong')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/incorrect password/i)).toBeVisible()
  })

  test('logs in and shows the dashboard chrome', async ({ page }) => {
    await login(page)
    await expect(page.getByText('Dealer Command Center')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Affordable Car Sales', { exact: true })).toBeVisible()
  })

  test('sign out returns to the login screen', async ({ page }) => {
    await login(page)
    await page.getByRole('button', { name: /staff/i }).click()
    await page.getByRole('button', { name: /sign out/i }).click()
    await expect(page.getByText('Staff access only')).toBeVisible()
  })
})
