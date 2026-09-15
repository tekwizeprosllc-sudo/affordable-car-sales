const ADMIN_PASSWORD = 'test-admin-password'

async function login(page) {
  await page.goto('/admin')
  await page.getByLabel('Password').fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL('**/admin')
  await page.getByText('Dealer Command Center').waitFor()
}

module.exports = { login, ADMIN_PASSWORD }
