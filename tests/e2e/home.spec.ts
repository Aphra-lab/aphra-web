import { expect, test } from '@playwright/test';

const WARNING =
  "L'abus d'alcool est dangereux pour la santé, à consommer avec modération.";

test.describe('Home page', () => {
  test('shows the mock image and the health warning in French', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page).toHaveTitle('Aphra');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    const image = page.getByRole('img', { name: /contact@aphralab\.com/ });
    await expect(image).toBeVisible();
    await expect
      .poll(() =>
        image.evaluate((img: HTMLImageElement) => [
          img.complete,
          img.naturalWidth,
          img.naturalHeight,
        ]),
      )
      .toEqual([true, 1004, 650]);
    await expect(page.getByText(WARNING)).toBeVisible();
  });

  test('sends unknown paths to the home page', async ({ page }) => {
    const response = await page.goto('/contact');

    expect(response?.status()).toBe(200);
    await expect.poll(() => new URL(page.url()).pathname).toBe('/');
    await expect(page.getByText(WARNING)).toBeVisible();
  });

  test('fits a phone screen without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    await expect(
      page.getByRole('img', { name: /contact@aphralab\.com/ }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      ),
    ).toBeLessThanOrEqual(0);
  });

  test('declares the link preview metadata', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://aphralab.com/aphra-hello.jpg',
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      'Aphra',
    );
  });
});
