import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** /forgot-password + /reset-password?token=... */
export class PasswordResetPage extends BasePage {
  readonly requestSuccess: Locator;
  readonly resetSuccess: Locator;

  constructor(page: Page) {
    super(page);
    this.requestSuccess = this.alert(/reset link has been sent/i);
    this.resetSuccess = this.alert(/password has been reset successfully/i);
  }

  async requestResetLink(email: string): Promise<void> {
    await this.page.goto('/login');
    await this.page.getByText('Forgot password?').click();
    await this.page.waitForURL('**/forgot-password');
    await this.page.getByLabel('Email or Phone Number').fill(email);
    await this.page.getByRole('button', { name: /Send Reset Link/ }).click();
    await expect(this.requestSuccess).toBeVisible();
  }

  async resetWithToken(token: string, newPassword: string): Promise<void> {
    await this.page.goto(`/reset-password?token=${token}`);
    const fields = this.page.locator('input[type="password"]');
    await expect(fields).toHaveCount(2);
    await fields.nth(0).fill(newPassword);
    await fields.nth(1).fill(newPassword);
    await this.page.getByRole('button', { name: /Reset Password/ }).click();
  }
}
