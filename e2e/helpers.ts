import { Page, expect } from '@playwright/test'

export const checkHomepageContents = async (page: Page) => {
  await expect(page.getByRole('button', { name: /Example/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /New/i })).toBeVisible()
  await expect(
    page.getByText(
      'Decision Tree is simple generator of shareable and accessible decision trees. Decision tree data is serialized and saved in the URL, making it easy to share and save created decision trees.'
    )
  ).toBeVisible()
  await expect(page.getByText('Built by Lucas Silbernagel')).toBeVisible()
}

export const loadHomepage = async (page: Page) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await expect(page).toHaveTitle(/Home/i)
  await checkHomepageContents(page)
}

export const loadNewTree = async (page: Page) => {
  await loadHomepage(page)
  await page.click('text=New')
  await expect(page.getByRole('button', { name: /Share Tree/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Start Over/i })).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Decision Tree Title/i })
  ).toBeVisible()
  await expect(
    page.getByLabel('Decision root: Yes or no?.').getByLabel('edit text')
  ).toBeVisible()
  await expect(
    page.getByLabel('Decision : No.').getByLabel('edit text')
  ).toBeVisible()
  await expect(
    page.getByLabel('Decision : No.').getByLabel('Add child nodes')
  ).toBeVisible()
  await expect(
    page.getByLabel('Decision : Yes.').getByLabel('Add child nodes')
  ).toBeVisible()
  await expect(
    page.getByLabel('Decision : Yes.').getByLabel('edit text')
  ).toBeVisible()
  await expect(page.getByText('Built by Lucas Silbernagel')).toBeVisible()
}

export const loadExampleTree = async (page: Page) => {
  await loadHomepage(page)
  await page.click('text=Example')
  await expect(page.getByRole('button', { name: /Share Tree/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Start Over/i })).toBeVisible()
  await expect(
    page.getByRole('button', { name: /What should you have for lunch?/i })
  ).toBeVisible()
  await expect(
    page.getByLabel('Decision root: Are you at home?').getByLabel('edit text')
  ).toBeVisible()
  await expect(
    page
      .getByLabel('Decision : Do you want to go to a sit-down restaurant?')
      .getByLabel('edit text')
  ).toBeVisible()
  await expect(
    page
      .getByLabel('Decision : Do you have ingredients to make a sandwich?')
      .getByLabel('edit text')
  ).toBeVisible()
  await expect(
    page.getByLabel('Decision : Pick up a salad or').getByLabel('Delete node')
  ).toBeVisible()
  await expect(
    page
      .getByLabel('Decision : Pick up a salad or')
      .getByLabel('Add child nodes')
  ).toBeVisible()
  await expect(page.getByText('Built by Lucas Silbernagel')).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Back to start/i })
  ).not.toBeVisible()
  const scrollableArea = page.getByLabel('Decision tree navigation area')
  await scrollableArea.waitFor({ state: 'attached' })
  let scrollSuccess = false
  for (let i = 0; i < 3; i++) {
    try {
      // Simple scroll first
      await scrollableArea.evaluate((div) => {
        div.scrollTop = div.scrollHeight
      })
      // Wait a bit for scroll to settle
      await page.waitForTimeout(100)
      // Verify scroll position
      const isScrolled = await scrollableArea.evaluate((div) => {
        const maxScroll = div.scrollHeight - div.clientHeight
        return Math.abs(div.scrollTop - maxScroll) < 1
      })
      if (isScrolled) {
        scrollSuccess = true
        break
      }
    } catch (error) {
      if (i === 2) throw error // On last attempt, throw the error
      await page.waitForTimeout(100) // Wait before retry
    }
  }
  if (!scrollSuccess) {
    throw new Error('Failed to scroll to bottom')
  }
  // Wait for button to be visible with retry
  await expect(
    page.getByRole('button', { name: /Back to start/i })
  ).toBeVisible({ timeout: 5000 })
  await expect(
    page.getByLabel('Decision root: Are you at home?').getByLabel('edit text')
  ).not.toBeInViewport()
  await page.getByRole('button', { name: /Back to start/i }).click({
    timeout: 5000,
    force: true, // Use force: true to click even if element is moving
  })
  await expect(
    page.getByLabel('Decision root: Are you at home?').getByLabel('edit text')
  ).toBeInViewport()
}
