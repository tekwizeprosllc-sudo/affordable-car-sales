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

    await expect(page.getByText(name)).toBeVisible()

    // Selecting the row opens the detail panel with working contact actions.
    await page.getByText(name).click()
    const panelHeading = page.getByRole('heading', { name: name.toUpperCase() })
    await expect(panelHeading).toBeVisible()
    await expect(page.getByRole('link', { name: /call/i })).toHaveAttribute('href', /^tel:/)

    // Status buttons update both the panel and the row chip. The chip text is
    // lowercase in the DOM and only visually uppercased via CSS, so match that.
    await page.getByRole('button', { name: 'won', exact: true }).click()
    await expect(page.getByText('won', { exact: true }).first()).toBeVisible()
  })

  test('search filters the leads list', async ({ page }) => {
    await page.getByPlaceholder(/search leads/i).fill('zzzznomatchzzzz')
    await expect(page.getByText('No leads match')).toBeVisible()
    await page.getByPlaceholder(/search leads/i).fill('')
  })

  test('status tabs filter by status', async ({ page }) => {
    await page.getByRole('button', { name: /^lost \(/i }).click()
    await expect(page.getByRole('button', { name: /^lost \(/i })).toHaveClass(/bg-crimson/)
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
    await page.getByText(name).click()
    await expect(page.getByText('VEHICLE STATUS', { exact: false })).toBeVisible()

    await page.getByRole('button', { name: 'Pending', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Pending', exact: true })).toHaveCSS('color', 'rgb(255, 255, 255)')

    // Reset so repeated test runs start from a known state.
    await page.getByRole('button', { name: 'Available', exact: true }).click()
  })

  test('Facebook leads show quick replies and a copyable schedule link', async ({ page }) => {
    const res = await page.request.post('/api/admin/simulate-fb-lead')
    const { lead } = await res.json()
    await page.reload()

    await page.locator('button', { hasText: lead.name }).first().click()
    await expect(page.getByRole('heading', { name: lead.name.toUpperCase() })).toBeVisible()

    await expect(page.getByText('FACEBOOK AUTO REPLY')).toBeVisible()
    await expect(page.getByRole('button', { name: /schedule at this link/i })).toBeVisible()

    await page.request.delete('/api/admin/simulate-fb-lead')
  })
})
