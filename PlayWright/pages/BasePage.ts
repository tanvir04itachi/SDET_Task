import { expect, Locator, Page } from '@playwright/test';
import { parseMoney } from '../utils/dataGenerator';

export class BasePage {
  readonly banner: Locator;
  readonly balanceButton: Locator;

  constructor(readonly page: Page) {
    this.banner = page.getByRole('banner');
    this.balanceButton = this.banner.getByRole('button', { name: /Balance|৳/ });
  }

  /** MUI Alert / Snackbar message text (ignores Next.js' empty route announcer). */
  alert(text: string | RegExp): Locator {
    return this.page.locator('.MuiAlert-message').filter({ hasText: text });
  }

  /** Clicks the header Balance toggle and returns the live balance fetched from the API. */
  async readBalance(): Promise<number> {
    await expect(this.balanceButton).toBeEnabled();
    const label = (await this.balanceButton.innerText()).trim();
    if (!label.includes('৳')) await this.balanceButton.click();
    await expect(this.balanceButton).toContainText('৳');
    return parseMoney((await this.balanceButton.innerText()).replace('৳', ''));
  }

  async logout(): Promise<void> {
    await this.banner.locator('.MuiAvatar-root').click();
    await this.page.getByRole('menuitem', { name: /Logout/ }).click();
    await expect(this.page).toHaveURL(/\/login/);
  }
}
