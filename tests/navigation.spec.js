const { test, expect } = require('@playwright/test')
const { login } = require('./helpers')

const ROUTES = [
  ['Dashboard', '/admin', 'Dealer Command Center'],
  ['Leads', '/admin/leads', 'Leads Inbox'],
  ['Messenger', '/admin/messenger', 'Messenger'],
  ['Test Drives', '/admin/test-drives', 'Test Drives'],
  ['Inventory', '/admin/inventory', 'Inventory'],
  ['Playbook', '/admin/playbook', 'Playbook'],
  ['Settings', '/admin/settings', 'Settings'],
]

test.describe('Admin sidebar navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  for (const [label, path, heading] of ROUTES) {
    test(`"${label}" nav item goes to ${path}`, async ({ page }) => {
      await page.getByRole('navigation', { name: 'Admin' }).getByRole('link', { name: label }).click()
      await expect(page).toHaveURL(new RegExp(`${path}$`))
      await expect(page.getByText(heading).first()).toBeVisible()
    })
  }

  test('View Site opens the public homepage in a new tab', async ({ page, context }) => {
    await page.getByRole('button', { name: 'Staff menu' }).click()
    const [publicPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('menuitem', { name: /view site/i }).click(),
    ])
    await publicPage.waitForLoadState()
    await expect(publicPage.getByText('Drive More.')).toBeVisible()
  })
})
