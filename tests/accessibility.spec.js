const { test, expect } = require('@playwright/test')
const AxeBuilder = require('@axe-core/playwright').default
const { login } = require('./helpers')

// Scoped to serious/critical only — this is a small dealership app, not a
// compliance audit; we want to catch real barriers (missing labels, contrast
// failures on text) without chasing every minor best-practice nit.
test.describe('Accessibility (serious/critical issues)', () => {
  test('dashboard has no serious or critical axe violations', async ({ page }) => {
    await login(page)
    const results = await new AxeBuilder({ page }).include('body').analyze()
    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact))
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
  })

  test('inventory page has no serious or critical axe violations', async ({ page }) => {
    await login(page)
    await page.goto('/admin/inventory')
    const results = await new AxeBuilder({ page }).include('body').analyze()
    const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact))
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
  })
})
