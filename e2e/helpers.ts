import { Page, expect } from '@playwright/test'

export const checkHomepageContents = async (page: Page) => {
  await expect(page.getByRole('button', { name: /Example/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /New/i })).toBeVisible()
  await expect(
    page.getByText(
      'A simple generator of shareable and accessible decision trees.'
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
  await scrollableArea.evaluate((div) => (div.scrollTop = div.scrollHeight))
  await expect(
    page.getByRole('button', { name: /Back to start/i })
  ).toBeVisible()
  await expect(
    page.getByLabel('Decision root: Are you at home?').getByLabel('edit text')
  ).not.toBeInViewport()
  await page.click('role=button[name="Back to start"]', { force: true })
  await expect(
    page.getByLabel('Decision root: Are you at home?').getByLabel('edit text')
  ).toBeInViewport()
}
