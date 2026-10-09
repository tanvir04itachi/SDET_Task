import fs from 'fs';
import { BrowserContext, expect, Page, test } from '@playwright/test';
import { AdminUsersPage } from '../pages/AdminUsersPage';
import { BasePage } from '../pages/BasePage';
import { CashInPage } from '../pages/CashInPage';
import { LoginPage } from '../pages/LoginPage';
import { PasswordResetPage } from '../pages/PasswordResetPage';
import { RegisterPage } from '../pages/RegisterPage';
import { SelfStatementPage, StatementTable } from '../pages/SelfStatementPage';
import { readCsv, writeSelfStatementCsv } from '../utils/csvWriter';
import { AgentData, generateAgent, parseMoney, todayStamp } from '../utils/dataGenerator';
import { askInBrowser } from '../utils/manualInput';

const ADMIN = { email: process.env.ADMIN_EMAIL || 'admin@dmoney.com', password: process.env.ADMIN_PASSWORD || '1234' };
const SYSTEM = { email: process.env.SYSTEM_EMAIL || 'system@dmoney.com', password: process.env.SYSTEM_PASSWORD || '1234' };
const CUSTOMER_PHONE = process.env.CUSTOMER_PHONE || '';
const SYSTEM_DEPOSIT = 2000;
const CUSTOMER_DEPOSIT = 500;
// Agent earns this share of every Customer deposit (Commission table, "Deposit" rule)
const COMMISSION_RATE = Number(process.env.COMMISSION_RATE || 0.025);

/** Accepts a full reset link or the bare 64-hex token. */
function extractResetToken(input: string): string {
  const token = input.match(/[a-f0-9]{64}/i)?.[0];
  if (!token) throw new Error(`No reset token found in "${input}"`);
  return token;
}

// Every test is part of the regression suite; positive tests are also in the smoke suite.
const SMOKE = { tag: ['@regression', '@smoke'] };
const NEGATIVE = { tag: ['@regression'] };

test.describe.configure({ mode: 'serial' });

test.describe('DMoney Agent end-to-end journey', () => {
  let context: BrowserContext;
  let page: Page;
  let agent: AgentData;
  let systemTrnxId: string;
  let customerTrnxId: string;
  let balanceAfterCustomerDeposit: number;
  let statement: StatementTable;

  // Pages
  let base: BasePage;
  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let adminUsers: AdminUsersPage;
  let cashIn: CashInPage;
  let selfStatement: SelfStatementPage;
  let passwordReset: PasswordResetPage;

  test.beforeAll(async ({ browser }) => {
    expect(CUSTOMER_PHONE, 'CUSTOMER_PHONE must be set in .env').not.toBe('');
    // One shared page so the whole journey plays as one continuous session (and one video).
    context = await browser.newContext({
      baseURL: process.env.BASE_URL || 'https://dmoneyportal.roadtocareer.net',
      viewport: { width: 1366, height: 768 },
      recordVideo: { dir: 'test-results/videos', size: { width: 1366, height: 768 } },
    });
    page = await context.newPage();
    base = new BasePage(page);
    loginPage = new LoginPage(page);
    registerPage = new RegisterPage(page);
    adminUsers = new AdminUsersPage(page);
    cashIn = new CashInPage(page);
    selfStatement = new SelfStatementPage(page);
    passwordReset = new PasswordResetPage(page);

    agent = generateAgent();
    console.log(`Agent for this run: ${agent.email} / ${agent.phone}`);
  });

  test.afterAll(async () => {
    await context?.close();
  });

  // ── Registration ─────────────────────────────────────────────────────────
  test('1. Agent registration is successful', SMOKE, async () => {
    await registerPage.openFromHome();
    await registerPage.register(agent, 'Agent');
    await expect(registerPage.successMessage).toBeVisible();
  });

  // ── Admin ────────────────────────────────────────────────────────────────
  test('2. Admin login fails with a wrong password', NEGATIVE, async () => {
    await loginPage.submitCredentials(ADMIN.email, 'wrong-password');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('3. Admin login is successful', SMOKE, async () => {
    await loginPage.login(ADMIN.email, ADMIN.password);
    await expect(page.getByRole('banner')).toContainText('Admin Dashboard');
    await expect(page.getByRole('navigation').getByRole('link', { name: 'User List' })).toBeVisible();
  });

  test('4. Newly created Agent appears in the Admin user list', SMOKE, async () => {
    await adminUsers.goto();
    const row = await adminUsers.searchByEmail(agent.email);
    await expect(row).toContainText(agent.phone);
    await expect(row).toContainText('Agent');
  });

  test('5. Newly created Agent is initially inactive', SMOKE, async () => {
    const row = page.getByRole('row').filter({ hasText: agent.email });
    await expect(row).toContainText('PENDING');
    await adminUsers.openUser(agent.email);
    await expect(adminUsers.statusChip).toHaveText('PENDING');
  });

  test('6. Admin can activate the Agent', SMOKE, async () => {
    await adminUsers.setStatus('Active');
    await expect(adminUsers.alert('User updated successfully')).toBeVisible();
    await expect(adminUsers.statusChip).toHaveText('ACTIVE');
  });

  test('7. Agent remains active after page reload', SMOKE, async () => {
    await page.reload();
    await expect(page.getByLabel('Email Address')).toHaveValue(agent.email);
    await expect(adminUsers.statusChip).toHaveText('ACTIVE');
    await base.logout();
  });

  // ── SYSTEM ───────────────────────────────────────────────────────────────
  test('8. System login is successful', SMOKE, async () => {
    await loginPage.login(SYSTEM.email, SYSTEM.password);
    await expect(page.getByRole('banner')).toContainText('SYSTEM');
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Cash In' })).toBeVisible();
  });

  test('9. System can deposit 2000 Tk to the Agent', SMOKE, async () => {
    await cashIn.open();
    await cashIn.deposit(agent.phone, SYSTEM_DEPOSIT);
    expect(await cashIn.successMessage()).toMatch(/success/i);
    systemTrnxId = await cashIn.trnxId();
    expect(systemTrnxId).toMatch(/^TXN\w+$/);
    expect(await cashIn.totalAmount()).toBe(SYSTEM_DEPOSIT);
  });

  test('10. System deposit creates the correct transaction record', SMOKE, async () => {
    await selfStatement.open();
    const record = await selfStatement.findByTrnxId(systemTrnxId, 1);
    expect(record, `trnxId ${systemTrnxId} in SYSTEM statement`).toBeDefined();
    expect(record!['Sender Account']).toBe('SYSTEM');
    expect(record!['Receiver Account']).toBe(agent.phone);
    expect(record!['Type']).toMatch(/Deposit/i);
    expect(parseMoney(record!['Debit'])).toBe(SYSTEM_DEPOSIT);
    await base.logout();
  });

  // ── Agent ────────────────────────────────────────────────────────────────
  test('11. Agent can log in after activation', SMOKE, async () => {
    await loginPage.login(agent.email, agent.password, { otp: true });
    await expect(page.getByRole('banner')).toContainText('Agent Dashboard');
    // Header shows the first name only
    await expect(page.getByRole('banner')).toContainText(agent.name.split(' ')[0]);
  });

  test('12. Agent balance is exactly 2000 Tk', SMOKE, async () => {
    expect(await base.readBalance()).toBe(SYSTEM_DEPOSIT);
  });

  test('13. Agent can deposit 500 Tk to an existing Customer', SMOKE, async () => {
    await cashIn.open();
    await cashIn.deposit(CUSTOMER_PHONE, CUSTOMER_DEPOSIT);
    expect(await cashIn.successMessage()).toMatch(/success/i);
    customerTrnxId = await cashIn.trnxId();
    expect(customerTrnxId).toMatch(/^TXN\w+$/);
    expect(await cashIn.totalAmount()).toBe(CUSTOMER_DEPOSIT);
  });

  test('14. Agent balance is updated correctly after the transaction', SMOKE, async () => {
    const commission = CUSTOMER_DEPOSIT * COMMISSION_RATE;
    balanceAfterCustomerDeposit = SYSTEM_DEPOSIT - CUSTOMER_DEPOSIT + commission; // 2000 - 500 + 12.50
    expect(await cashIn.currentBalance()).toBeCloseTo(balanceAfterCustomerDeposit, 2);
    await page.reload();
    expect(await base.readBalance()).toBeCloseTo(balanceAfterCustomerDeposit, 2);
  });

  test("15. Customer deposit appears in the Agent's Self Statement", SMOKE, async () => {
    await selfStatement.open();
    const record = await selfStatement.findByTrnxId(customerTrnxId);
    expect(record, `trnxId ${customerTrnxId} in Agent statement`).toBeDefined();
    expect(record!['Sender Account']).toBe(agent.phone);
    expect(record!['Receiver Account']).toBe(CUSTOMER_PHONE);
    expect(parseMoney(record!['Debit'])).toBe(CUSTOMER_DEPOSIT);
    expect(parseMoney(record!['Credit'])).toBeCloseTo(CUSTOMER_DEPOSIT * COMMISSION_RATE, 2);
  });

  test('16. Agent logout works successfully', SMOKE, async () => {
    await base.logout();
    await page.goto('/agent/cash-in');
    await expect(page).toHaveURL(/\/login/);
  });

  // ── Password reset ───────────────────────────────────────────────────────
  test('17. Agent password reset works successfully', SMOKE, async () => {
    await passwordReset.requestResetLink(agent.email);
    const link = await askInBrowser(page, `Paste the password reset link emailed to ${agent.email}`, /[a-f0-9]{64}/i);
    const token = extractResetToken(link);
    await passwordReset.resetWithToken(token, agent.newPassword);
    await expect(passwordReset.resetSuccess).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('18. Login with the old password fails after password reset', NEGATIVE, async () => {
    await loginPage.submitCredentials(agent.email, agent.password);
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.otpInput).toBeHidden();
    await expect(page).toHaveURL(/\/login/);
  });

  test('19. Login with the new password succeeds', SMOKE, async () => {
    await loginPage.login(agent.email, agent.newPassword, { otp: true });
    await expect(page.getByRole('banner')).toContainText('Agent Dashboard');
  });

  // ── Self Statement → CSV ─────────────────────────────────────────────────
  test('20. Self Statement contains the expected transaction data', SMOKE, async () => {
    await selfStatement.open();
    statement = await selfStatement.extractAll();
    expect(statement.headers).toEqual([
      'Transaction ID', 'Sender Account', 'Receiver Account', 'Type', 'Debit', 'Credit', 'Balance', 'Date',
    ]);
    expect(statement.rows).toHaveLength(2);

    const col = (name: string) => statement.headers.indexOf(name);
    const systemRow = statement.rows.find((r) => r[col('Transaction ID')] === systemTrnxId);
    const customerRow = statement.rows.find((r) => r[col('Transaction ID')] === customerTrnxId);
    expect(systemRow, 'SYSTEM deposit row').toBeDefined();
    expect(customerRow, 'Customer deposit row').toBeDefined();

    expect(systemRow![col('Sender Account')]).toBe('SYSTEM');
    expect(parseMoney(systemRow![col('Credit')])).toBe(SYSTEM_DEPOSIT);
    expect(customerRow![col('Receiver Account')]).toBe(CUSTOMER_PHONE);
    expect(parseMoney(customerRow![col('Debit')])).toBe(CUSTOMER_DEPOSIT);

    const balances = statement.rows.map((r) => parseMoney(r[col('Balance')]));
    expect(balances).toContain(balanceAfterCustomerDeposit);
  });

  test('21. Self Statement data is saved into the required CSV file', SMOKE, async ({}, testInfo) => {
    const file = writeSelfStatementCsv(statement.headers, statement.rows);
    expect(file).toMatch(new RegExp(`self_statement_${todayStamp()}\\.csv$`));
    expect(fs.existsSync(file)).toBe(true);

    const csv = readCsv(file);
    expect(csv[0]).toEqual(statement.headers);
    expect(csv.slice(1)).toEqual(statement.rows);
    await testInfo.attach(`self_statement_${todayStamp()}.csv`, { path: file, contentType: 'text/csv' });
    console.log(`CSV saved: ${file}`);
  });
});
