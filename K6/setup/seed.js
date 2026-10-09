/**
 * Creates (or reuses) the six test users and funds them so the 2-minute
 * k6 run never hits "Insufficient balance" or the 10000 tk customer cap.
 *
 *   Agents    -> topped up to AGENT_TARGET by the SYSTEM account
 *   Customers -> brought into [CUSTOMER_TARGET, CUSTOMER_MAX] by an agent
 *                deposit (if low) or a merchant payment (if high)
 *
 * Writes config/users.json, which the k6 script reads.
 * Pass --fresh to ignore the existing users.json and register new users.
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { BASE_URL, SECRET_KEY, DEFAULT_OTP, SYSTEM_EMAIL, SYSTEM_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
const USERS_FILE = path.join(__dirname, '..', 'config', 'users.json');
const PASSWORD = process.env.TEST_USER_PASSWORD || 'K6perf#1234'; // local throwaway test users only

const AGENT_TARGET = 6000;
const CUSTOMER_TARGET = 3000;
const CUSTOMER_MAX = 6000; // keeps customers far from the 10000 tk deposit cap

const USERS = {
  agent1:    { name: 'K6 Agent One',    role: 'Agent' },
  agent2:    { name: 'K6 Agent Two',    role: 'Agent' },
  customer1: { name: 'K6 Customer One', role: 'Customer' },
  customer2: { name: 'K6 Customer Two', role: 'Customer' },
  merchant1: { name: 'K6 Merchant One', role: 'Merchant' },
  merchant2: { name: 'K6 Merchant Two', role: 'Merchant' },
};

const runId = Date.now().toString(36);
const digits = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');

async function call(method, url, body, token) {
  const headers = { 'Content-Type': 'application/json', 'X-AUTH-SECRET-KEY': SECRET_KEY };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE_URL + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
}

async function login(identifier, password) {
  const body = identifier.includes('@') ? { email: identifier, password } : { phone_number: identifier, password };
  const res = await call('POST', '/user/login', body);
  if (res.status !== 200) return null;
  if (res.data.token) return res.data.token;
  const otp = await call('POST', '/user/verify-otp?env=dev', { identifier, otp: DEFAULT_OTP });
  return otp.status === 200 ? otp.data.token : null;
}

async function balance(account, token) {
  const res = await call('GET', `/transaction/balance/${account}`, null, token);
  if (res.status !== 200) throw new Error(`Balance check failed for ${account}: ${res.status} ${res.data.message}`);
  return Number(res.data.balance);
}

function expect201(res, what) {
  if (res.status !== 201) throw new Error(`${what} failed: ${res.status} ${JSON.stringify(res.data)}`);
}

async function main() {
  const adminToken = await login(ADMIN_EMAIL, ADMIN_PASSWORD);
  const systemToken = await login(SYSTEM_EMAIL, SYSTEM_PASSWORD);
  if (!adminToken || !systemToken) throw new Error('Admin/SYSTEM login failed. Check .env and that the API is running.');

  const fresh = process.argv.includes('--fresh');
  const saved = !fresh && fs.existsSync(USERS_FILE) ? JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')).users : {};
  const users = {};

  // 1. Reuse saved users when they can still log in, otherwise register + activate.
  for (const [key, def] of Object.entries(USERS)) {
    const prev = saved[key];
    if (prev && (await login(prev.phone_number, prev.password))) {
      users[key] = prev;
      console.log(`reuse    ${key.padEnd(10)} ${prev.phone_number}`);
      continue;
    }
    const user = {
      ...def,
      email: `dmoney.k6.${runId}.${key}@gmail.com`,
      phone_number: `01${digits(9)}`,
      nid: digits(10),
      password: PASSWORD,
    };
    const reg = await call('POST', '/user/register', user);
    expect201(reg, `Register ${key}`);
    const act = await call('PATCH', `/user/update/${reg.data.user.id}`, { status: 'active' }, adminToken);
    if (act.status !== 200) throw new Error(`Activate ${key} failed: ${act.status} ${JSON.stringify(act.data)}`);
    users[key] = { id: reg.data.user.id, ...user };
    console.log(`created  ${key.padEnd(10)} ${user.phone_number}`);
  }

  const tokens = {};
  for (const key of Object.keys(users)) tokens[key] = await login(users[key].phone_number, users[key].password);

  const topUpAgent = async (key, target) => {
    const bal = await balance(users[key].phone_number, systemToken);
    if (bal >= target) return;
    const amount = Math.min(Math.ceil(target - bal), 10000);
    const res = await call('POST', '/transaction/deposit',
      { from_account: 'SYSTEM', to_account: users[key].phone_number, amount }, systemToken);
    expect201(res, `SYSTEM deposit to ${key}`);
  };

  // 2. Agents need enough float to fund the customers too.
  for (const key of ['agent1', 'agent2']) await topUpAgent(key, AGENT_TARGET + CUSTOMER_TARGET);

  // 3. Bring each customer into the safe balance band.
  for (const key of ['customer1', 'customer2']) {
    const phone = users[key].phone_number;
    const bal = await balance(phone, systemToken);
    if (bal < CUSTOMER_TARGET) {
      const res = await call('POST', '/transaction/deposit',
        { from_account: users.agent1.phone_number, to_account: phone, amount: Math.ceil(CUSTOMER_TARGET - bal) }, tokens.agent1);
      expect201(res, `Agent deposit to ${key}`);
    } else if (bal > CUSTOMER_MAX) {
      // Drain the excess (payment adds a 1% fee) so later deposits stay under the cap.
      const res = await call('POST', '/transaction/payment',
        { from_account: phone, to_account: users.merchant1.phone_number, amount: Math.floor((bal - CUSTOMER_TARGET) / 1.01) }, tokens[key]);
      expect201(res, `Drain payment from ${key}`);
    }
  }

  // 4. Refill agents after funding customers.
  for (const key of ['agent1', 'agent2']) await topUpAgent(key, AGENT_TARGET);

  console.log('\nBalances before the test:');
  const table = {};
  for (const [key, u] of Object.entries(users)) table[key] = { phone: u.phone_number, balance: await balance(u.phone_number, systemToken) };
  console.table(table);

  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify({ baseUrl: BASE_URL, secretKey: SECRET_KEY, otp: DEFAULT_OTP, users }, null, 2));
  console.log(`Wrote ${path.relative(process.cwd(), USERS_FILE)}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
