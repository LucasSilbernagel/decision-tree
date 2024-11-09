import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('pageload', () => {
  test('should load all landing page content as expected', async ({ page }) => {
    await expect(page).toHaveTitle(/Home/)
    await expect(page.getByRole('button', { name: /Example/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /New/i })).toBeVisible()
    await expect(
      page.getByText(
        'A simple generator of shareable and accessible decision trees.'
      )
    ).toBeVisible()
    await expect(page.getByText('Built by Lucas Silbernagel')).toBeVisible()
  })
})
