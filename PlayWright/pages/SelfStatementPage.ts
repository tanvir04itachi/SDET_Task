import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export interface StatementTable {
  headers: string[];
  rows: string[][];
}

export class SelfStatementPage extends BasePage {
  readonly table: Locator;
  readonly nextPage: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.locator('main table');
    this.nextPage = page.getByRole('button', { name: 'Go to next page' });
  }

  async open(): Promise<void> {
    await this.page.getByRole('navigation').getByRole('link', { name: 'Self Statement' }).click();
    await this.page.waitForURL('**/self-statement');
    await this.waitForRows();
  }

  /** Waits until the table shows data rows (or the empty-state row) instead of the spinner. */
  private async waitForRows(): Promise<void> {
    await expect(this.table.locator('tbody tr').first()).toBeVisible();
    await expect(this.page.locator('main .MuiCircularProgress-root')).toHaveCount(0);
  }

  async headers(): Promise<string[]> {
    return (await this.table.locator('thead th').allInnerTexts()).map((h) => h.trim());
  }

  private async visibleRows(): Promise<string[][]> {
    const rows = await this.table.locator('tbody tr').all();
    const data: string[][] = [];
    for (const row of rows) {
      const cells = (await row.locator('td').allInnerTexts()).map((c) => c.trim());
      if (cells.length > 1) data.push(cells); // skip the colSpan "No transactions" row
    }
    return data;
  }

  /** Reads every page of the statement table (or only the first `maxPages`). */
  async extractAll(maxPages = Infinity): Promise<StatementTable> {
    const headers = await this.headers();
    const rows = await this.visibleRows();
    for (let pageNo = 1; pageNo < maxPages && (await this.nextPage.count()) > 0 && (await this.nextPage.isEnabled()); pageNo++) {
      const firstBefore = await this.table.locator('tbody tr').first().innerText();
      await this.nextPage.click();
      await expect(this.table.locator('tbody tr').first()).not.toHaveText(firstBefore);
      await this.waitForRows();
      rows.push(...(await this.visibleRows()));
    }
    return { headers, rows };
  }

  /**
   * Row whose "Transaction ID" cell matches trnxId, as { header: value }.
   * The API serves the newest entries on page 1, so busy accounts (SYSTEM) only need maxPages = 1.
   */
  async findByTrnxId(trnxId: string, maxPages = Infinity): Promise<Record<string, string> | undefined> {
    const { headers, rows } = await this.extractAll(maxPages);
    const idx = headers.indexOf('Transaction ID');
    const matches = rows.filter((r) => r[idx] === trnxId);
    return matches.length ? Object.fromEntries(headers.map((h, i) => [h, matches[0][i]])) : undefined;
  }
}
