import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class AdminUsersPage extends BasePage {
  readonly heading: Locator;
  readonly statusSelect: Locator;
  readonly statusChip: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'User List' });
    this.statusSelect = page.getByRole('combobox').filter({ hasText: /Pending|Active|Suspended/ });
    // Chip in the user detail header showing PENDING / ACTIVE / SUSPENDED
    this.statusChip = page.locator('main .MuiChip-label').filter({ hasText: /^(PENDING|ACTIVE|SUSPENDED)$/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/users');
    await expect(this.heading).toBeVisible();
  }

  /** Searches by email and returns the matching table row. */
  async searchByEmail(email: string): Promise<Locator> {
    await this.page.locator('main').getByRole('combobox').first().click();
    await this.page.getByRole('option', { name: 'Search by Email' }).click();
    await this.page.getByLabel('Enter Email').fill(email);
    await this.page.getByRole('button', { name: 'Search', exact: true }).click();
    const row = this.page.getByRole('row').filter({ hasText: email });
    await expect(row).toBeVisible();
    return row;
  }

  async openUser(email: string): Promise<void> {
    const row = await this.searchByEmail(email);
    await row.getByRole('button', { name: 'View' }).click();
    await this.page.waitForURL(/\/admin\/users\/\d+/);
    await expect(this.page.getByLabel('Email Address')).toHaveValue(email);
  }

  async setStatus(status: 'Pending' | 'Active' | 'Suspended'): Promise<void> {
    await this.page.getByRole('button', { name: 'Edit User' }).click();
    await this.statusSelect.click();
    await this.page.getByRole('option', { name: status }).click();
    await this.page.getByRole('button', { name: 'Save Changes' }).click();
  }
}
