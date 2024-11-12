import { test, expect } from '@playwright/test'
import {
  checkHomepageContents,
  loadExampleTree,
  loadHomepage,
  loadNewTree,
} from './helpers'

test.describe('pageload', () => {
  test('should load landing page content as expected', async ({ page }) => {
    await loadHomepage(page)
  })

  test('should load 404 page content as expected', async ({ page }) => {
    await page.goto('/random-invalid-page')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/404/i)
    await expect(page.getByText('404')).toBeVisible()
    await expect(page.getByText('Page not found.')).toBeVisible()
    await expect(page.getByRole('link', { name: /Home/i })).toBeVisible()
    await expect(page.getByText('Built by Lucas Silbernagel')).toBeVisible()
    await page.click('text=Home')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/Home/i)
    await page.goto('/random-invalid-page')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/404/i)
  })
})

test.describe('decision tree functionality', () => {
  test('should create a new decision tree on button click', async ({
    page,
  }) => {
    await loadNewTree(page)
  })

  test('should load an example decision tree on button click', async ({
    page,
  }) => {
    await loadExampleTree(page)
  })

  test('should copy decision tree URL on button click', async ({ page }) => {
    await loadNewTree(page)
    await page.evaluate(() => {
      navigator.clipboard.writeText = async () => Promise.resolve()
    })
    await page.click('role=button[name="Share Tree"]')
    await expect(page.getByText('URL copied to clipboard!')).toBeVisible()
  })

  test('should clear the decision tree and return to the landing page on button click', async ({
    page,
  }) => {
    await loadExampleTree(page)
    await page.click('role=button[name="Start Over"]')
    await expect(
      page.getByRole('heading', { name: 'Start Over' })
    ).toBeVisible()
    await expect(page.getByText('Are you sure you want to')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()
    await page.click('role=button[name="Cancel"]')
    await expect(
      page.getByRole('heading', { name: 'Start Over' })
    ).not.toBeVisible()
    await page.click('role=button[name="Start Over"]')
    await page.click('role=button[name="Continue"]')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveTitle(/Home/i)
    await checkHomepageContents(page)
  })

  test('should be able to edit the decision tree title', async ({ page }) => {
    await loadNewTree(page)
    await page.click('role=button[name="Decision Tree Title - edit"]')
    await expect(
      page.getByRole('button', { name: /Decision Tree Title/i })
    ).not.toBeVisible()
    await expect(page.getByPlaceholder('Decision Tree Title')).toBeVisible()
    await page.fill('[placeholder="Decision Tree Title"]', 'My fancy new title')
    await page.keyboard.press('Enter')
    await expect(page.getByPlaceholder('Decision Tree Title')).not.toBeVisible()
    await expect(page.getByLabel('My fancy new title - edit')).toBeVisible()
  })

  test('should be able to edit decision node text', async ({ page }) => {
    await loadNewTree(page)
    await page
      .getByLabel('Decision root: Yes or no?.')
      .getByLabel('edit text')
      .click()
    await expect(page.getByPlaceholder('Yes or no?')).toBeVisible()
    await page.fill('[placeholder="Yes or no?"]', 'Example decision node text.')
    await page.keyboard.press('Enter')
    await expect(page.getByPlaceholder('Yes or no?')).not.toBeVisible()
    await expect(
      page.getByLabel('Decision root: Example decision node text.')
    ).toBeVisible()
  })

  test('should be able to add a new decision node', async ({ page }) => {
    await loadExampleTree(page)
    await page
      .getByLabel('Decision : Pick up a salad or')
      .getByLabel('Add child nodes')
      .click()
    await expect(
      page.getByLabel('Decision : No.').getByLabel('edit text')
    ).toBeVisible()
    await expect(
      page.getByLabel('Decision : Yes.').getByLabel('edit text')
    ).toBeVisible()
  })

  test('should be able to delete a decision node', async ({ page }) => {
    await loadExampleTree(page)
    await expect(
      page.getByLabel('Decision : Pick up a salad or').getByLabel('edit text')
    ).toBeVisible()
    await page
      .getByLabel('Decision : Pick up a salad or')
      .getByLabel('Delete node')
      .click()
    await expect(
      page.getByLabel('Decision : Pick up a salad or').getByLabel('edit text')
    ).not.toBeVisible()
  })
})
