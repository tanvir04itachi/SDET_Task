import { expect, Locator, Page } from '@playwright/test';
import { waitForTypedOtp } from '../utils/manualInput';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly identifier: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly otpInput: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.identifier = page.getByLabel('Email or Phone Number');
    this.password = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: /Login/ });
    this.otpInput = page.getByLabel(/4-Digit OTP/);
    this.errorMessage = page.locator('.MuiAlert-standardError, .MuiAlert-filledError, .MuiAlert-outlinedError');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async submitCredentials(email: string, password: string): Promise<void> {
    await this.goto();
    await this.identifier.fill(email);
    await this.password.fill(password);
    await this.loginButton.click();
  }

  /** Admin/SYSTEM log in directly; Agent/Customer/Merchant get a 4-digit OTP by email, typed in by hand. */
  async login(email: string, password: string, { otp = false } = {}): Promise<void> {
    await this.submitCredentials(email, password);
    if (otp) {
      await expect(this.otpInput).toBeVisible();
      await waitForTypedOtp(this.page, this.otpInput, email);
      // The person may already have pressed Enter after typing the OTP.
      const verify = this.page.getByRole('button', { name: /Verify OTP/ });
      if (await verify.isVisible()) await verify.click().catch(() => undefined);
    }
    await this.page.waitForURL((url) => !url.pathname.startsWith('/login'));
  }
}
