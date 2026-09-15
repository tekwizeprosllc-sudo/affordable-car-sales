const { test, expect } = require('@playwright/test')
const { login } = require('./helpers')

test.describe('Leads workspace', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('New Lead modal creates a lead that appears in the inbox', async ({ page }) => {
    await page.getByRole('button', { name: /new lead/i }).click()
    await expect(page.getByRole('heading', { name: 'New Lead' })).toBeVisible()

    const name = `Playwright Test ${Date.now()}`
    await page.getByPlaceholder('Name *').fill(name)
    await page.getByPlaceholder('Phone').fill('5135551234')
    await page.getByPlaceholder('Vehicle (optional)').fill('Test Vehicle')
    await page.getByRole('button', { name: /add lead/i }).click()

    const row = page.locator('button.adm-row', { hasText: name })
    await expect(row).toBeVisible()

    // Selecting the row opens the detail panel with working contact actions.
    await row.click()
    await expect(page.getByRole('heading', { name })).toBeVisible()
    await expect(page.getByRole('link', { name: /^call$/i })).toHaveAttribute('href', /^tel:/)

    // Status lives in the lead's action menu; the row badge follows it.
    await page.getByRole('button', { name: 'Lead actions' }).click()
    await page.getByRole('menuitemradio', { name: 'Won' }).click()
    await expect(row.getByText('Won', { exact: true })).toBeVisible()
  })

  test('search filters the leads list', async ({ page }) => {
    await page.getByPlaceholder(/search leads/i).fill('zzzznomatchzzzz')
    await expect(page.getByText('No leads match')).toBeVisible()
    await page.getByPlaceholder(/search leads/i).fill('')
  })

  test('status tabs filter by status', async ({ page }) => {
    await page.getByRole('tab', { name: /^lost \(/i }).click()
    await expect(page.getByRole('tab', { name: /^lost \(/i })).toHaveAttribute('aria-selected', 'true')
  })

  test('vehicle availability control persists on a real inventory vehicle', async ({ page }) => {
    const res = await page.request.get('/api/inventory/public')
    const { cars } = await res.json()
    const vehicle = cars[0]
    const name = `Availability Test Lead ${Date.now()}`

    await page.request.post('/api/leads', {
      data: {
        type: 'vehicle_inquiry',
        name,
        phone: '5135550000',
        message: 'Still available?',
        vehicleId: vehicle.id,
        vehicleTitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        source: 'facebook',
      },
    })

    await page.reload()
    await page.locator('button.adm-row', { hasText: name }).click()
    const availability = page.getByRole('group', { name: 'Vehicle status' })
    await expect(availability).toBeVisible()

    await availability.getByRole('button', { name: 'Pending', exact: true }).click()
    await expect(availability.getByRole('button', { name: 'Pending', exact: true })).toHaveAttribute('aria-pressed', 'true')

    // Reset so repeated test runs start from a known state.
    await availability.getByRole('button', { name: 'Available', exact: true }).click()
    await expect(availability.getByRole('button', { name: 'Available', exact: true })).toHaveAttribute('aria-pressed', 'true')
  })

  test('Facebook leads show quick replies and a copyable schedule link', async ({ page }) => {
    const res = await page.request.post('/api/admin/simulate-fb-lead')
    const { lead } = await res.json()
    await page.reload()

    await page.locator('button.adm-row', { hasText: lead.name }).first().click()
    await expect(page.getByRole('heading', { name: lead.name })).toBeVisible()

    await expect(page.getByText('FACEBOOK AUTO REPLY')).toBeVisible()
    await expect(page.getByRole('button', { name: /schedule at this link/i })).toBeVisible()

    await page.request.delete('/api/admin/simulate-fb-lead')
  })
})
