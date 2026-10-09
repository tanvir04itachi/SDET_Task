import { expect, Locator, Page } from '@playwright/test';
import { parseMoney } from '../utils/dataGenerator';
import { BasePage } from './BasePage';

/** /agent/cash-in — used by SYSTEM (deposit to Agent) and by Agents (deposit to Customer). */
export class CashInPage extends BasePage {
  readonly heading: Locator;
  readonly successPanel: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('main').getByText('Cash In', { exact: true });
    // Innermost box holding both the success text and the "Transaction ID" result
    this.successPanel = page
      .locator('main div')
      .filter({ hasText: /successful/i, has: page.getByText('Transaction ID', { exact: true }) })
      .last();
  }

  async open(): Promise<void> {
    await this.page.getByRole('navigation').getByRole('link', { name: 'Cash In' }).click();
    await this.page.waitForURL('**/agent/cash-in');
    await expect(this.heading).toBeVisible();
  }

  async deposit(phone: string, amount: number): Promise<void> {
    await this.page.getByLabel('Customer Phone Number').fill(phone);
    await this.page.getByLabel('Amount (BDT)').fill(String(amount));
    await this.page.getByRole('button', { name: /Cash In →/ }).click();
    await expect(this.successPanel).toBeVisible();
  }

  /** Value box under a result label such as "Transaction ID" or "Current Balance". */
  private resultValue(label: string): Locator {
    return this.successPanel
      .locator('div')
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .last()
      .locator(':scope > *')
      .nth(1);
  }

  async successMessage(): Promise<string> {
    return (await this.successPanel.locator('p').first().innerText()).trim();
  }

  async trnxId(): Promise<string> {
    return (await this.resultValue('Transaction ID').innerText()).trim();
  }

  async totalAmount(): Promise<number> {
    return parseMoney((await this.resultValue('Total Amount').innerText()).replace('৳', ''));
  }

  async currentBalance(): Promise<number> {
    return parseMoney((await this.resultValue('Current Balance').innerText()).replace('৳', ''));
  }
}
