import { Locator, Page } from '@playwright/test';
import { AgentData } from '../utils/dataGenerator';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.successMessage = this.alert(/Registration successful|registered successfully|pending/i);
  }

  /** Opens the portal home and follows the "Sign Up" link in the header. */
  async openFromHome(): Promise<void> {
    await this.page.goto('/');
    await this.page.getByRole('banner').getByRole('link', { name: 'Sign Up' }).click();
    await this.page.waitForURL('**/register');
  }

  async register(user: Pick<AgentData, 'name' | 'email' | 'password' | 'phone' | 'nid'>, role: string): Promise<void> {
    await this.page.getByLabel('Full Name').fill(user.name);
    await this.page.getByLabel('Email Address').fill(user.email);
    await this.page.getByLabel('Password').fill(user.password);
    await this.page.getByLabel('Phone Number').fill(user.phone);
    await this.page.getByLabel('National ID (NID)').fill(user.nid);
    await this.page.getByRole('combobox').click();
    await this.page.getByRole('option', { name: new RegExp(role) }).click();
    await this.page.getByRole('button', { name: /Create Account/ }).click();
  }
}
