const { test, expect } = require('@playwright/test')
const { login } = require('./helpers')

// A manual mobile viewport rather than devices['iPhone 13']: that preset pins
// browserName to webkit, and this project only installs chromium.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

test.describe('Mobile admin', () => {
  test('sidebar opens as a drawer from the hamburger button', async ({ page }) => {
    await login(page)

    // Desktop nav is hidden at this width; the hamburger opens the same links in a drawer.
    await expect(page.getByRole('link', { name: 'Inventory' })).toBeHidden()
    await page.getByRole('button', { name: /toggle navigation/i }).click()
    await expect(page.getByRole('link', { name: 'Inventory' })).toBeVisible()
    await page.getByRole('link', { name: 'Inventory' }).click()
    await expect(page).toHaveURL(/\/admin\/inventory$/)
  })

  test('selecting a lead opens a full-screen drawer, not a side panel', async ({ page }) => {
    await login(page)
    const res = await page.request.post('/api/admin/simulate-fb-lead')
    const { lead } = await res.json()
    await page.reload()

    await page.locator('button', { hasText: lead.name }).first().click()
    await expect(page.getByRole('link', { name: /^call$/i })).toBeVisible()

    await page.request.delete('/api/admin/simulate-fb-lead')
  })
})
