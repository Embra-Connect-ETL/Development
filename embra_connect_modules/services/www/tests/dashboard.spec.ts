import { test, expect } from '@playwright/test';

let baseUrl = 'https://embraconnect.onrender.com/';

test('Has Title', async ({ page }) => {
  await page.goto(baseUrl);
  await expect(page).toHaveTitle(/Embra Connect | Home/);
});

test('Create An Account Link', async ({ page }) => {
  await page.goto(baseUrl);
  await page.getByRole('button', { name: 'Create an Account' }).click();
  await expect(page).toHaveTitle(/Embra Connect | Set Up Account/);
});

test('Sign In Link', async ({ page }) => {
  await page.goto(baseUrl);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveTitle(/Embra Connect | Log In/);
});