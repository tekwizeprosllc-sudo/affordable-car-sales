const { test, expect } = require('@playwright/test')
const { login } = require('./helpers')

test.describe('Inventory admin', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/admin/inventory')
  })

  test('lists real vehicles with resolvable images and a working VDP link', async ({ page }) => {
    const firstRow = page.locator('article').first()
    await expect(firstRow).toBeVisible()

    const img = firstRow.locator('img').first()
    if (await img.count()) {
      const src = await img.getAttribute('src')
      const res = await page.request.get(src)
      expect(res.ok()).toBeTruthy()
    }

    const vdpLink = firstRow.getByRole('link').first()
    const href = await vdpLink.getAttribute('href')
    expect(href).toMatch(/^\/inventory\//)
  })

  test('search filters the vehicle list', async ({ page }) => {
    await page.getByPlaceholder(/search make, model/i).fill('zzzznomatchzzzz')
    await expect(page.getByText('No vehicles match that search.')).toBeVisible()
  })

  test('availability control has all four states', async ({ page }) => {
    const firstRow = page.locator('article').first()
    for (const label of ['Available', 'Pending', 'Sold', 'Unknown']) {
      await expect(firstRow.getByRole('button', { name: label, exact: true })).toBeVisible()
    }
  })
})
