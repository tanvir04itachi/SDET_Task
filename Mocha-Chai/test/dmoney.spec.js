/**
 * DMoney Transaction API — end-to-end integration test suite.
 *
 * Flow covered (executed strictly in this order, state is shared across tests):
 *   1. Self-register 2 Customers, 1 Agent, 1 Merchant (all start as "pending").
 *   2. Admin activates all 4 users.
 *   3. Each user logs in (OTP flow, bypassed via ?env=dev + DEFAULT_OTP) to get a JWT.
 *   4. SYSTEM account deposits 5000 tk to the new Agent.
 *   5. Agent deposits 2000 tk to Customer 1 — asserts the agent's deposit commission.
 *   6. Customer 1 sends 1000 tk to Customer 2 — asserts the P2P service fee.
 *   7. Customer 2 cashes out (withdraws) 500 tk via the Agent — asserts the withdraw service fee.
 *   8. Customer 1 pays 400 tk to the Merchant — asserts the service fee deducted from the customer.
 *
 * Every test asserts the HTTP response status code, in addition to business-logic assertions.
 */

const axios = require('axios');
const { expect } = require('chai');

const BASE_URL = process.env.BASE_URL;
const SECRET_KEY = process.env.SECRET_KEY;
const DEFAULT_OTP = process.env.DEFAULT_OTP;
const SYSTEM_EMAIL = process.env.SYSTEM_EMAIL;
const SYSTEM_PASSWORD = process.env.SYSTEM_PASSWORD;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Never throw on non-2xx — every test asserts `res.status` itself.
const api = axios.create({ baseURL: BASE_URL, validateStatus: () => true });

// ── Test data helpers ────────────────────────────────────────────────────────
const runId = Date.now().toString(36); // unique per test run, keeps reruns collision-free

function randomDigits(len) {
  let s = '';
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

// phone_number must be exactly 11 characters (API validation rule)
function genPhone() {
  return `01${randomDigits(9)}`;
}

function genEmail(tag) {
  return `dmoney.qa.${runId}.${tag}.${randomDigits(4)}@gmail.com`;
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'X-AUTH-SECRET-KEY': SECRET_KEY,
  };
}

/** Registers a new user via the public self-registration endpoint. */
async function registerUser({ name, email, password, phone_number, nid, role }) {
  return api.post('/user/register', { name, email, password, phone_number, nid, role });
}

/** Full login flow: POST /user/login → POST /user/verify-otp?env=dev, returns the JWT. */
async function loginAndGetToken(identifier, password) {
  const isEmail = identifier.includes('@');
  const loginBody = isEmail ? { email: identifier, password } : { phone_number: identifier, password };

  const loginRes = await api.post('/user/login', loginBody);
  expect(loginRes.status, 'login status').to.equal(200);

  // Admin / SYSTEM accounts skip OTP and return the token directly.
  if (loginRes.data.token) {
    return loginRes.data.token;
  }

  expect(loginRes.data.otpRequired).to.equal(true);

  const otpRes = await api.post('/user/verify-otp?env=dev', { identifier, otp: DEFAULT_OTP });
  expect(otpRes.status, 'verify-otp status').to.equal(200);
  expect(otpRes.data).to.have.property('token');
  return otpRes.data.token;
}

// ── Shared state across the whole suite ─────────────────────────────────────
const ctx = {
  customer1: { name: 'QA Customer One', nid: randomDigits(10), role: 'Customer' },
  customer2: { name: 'QA Customer Two', nid: randomDigits(10), role: 'Customer' },
  agent: { name: 'QA Agent', nid: randomDigits(10), role: 'Agent' },
  merchant: { name: 'QA Merchant', nid: randomDigits(10), role: 'Merchant' },
  adminToken: null,
  systemToken: null,
};

for (const key of ['customer1', 'customer2', 'agent', 'merchant']) {
  ctx[key].email = genEmail(key);
  ctx[key].phone_number = genPhone();
  ctx[key].password = 'Passw0rd!';
}

describe('DMoney API Integration Tests', function () {
  this.timeout(20000);

  // ══════════════════════════════════════════════════════════════════════
  // 1. User creation — 2 Customers, 1 Agent, 1 Merchant
  // ══════════════════════════════════════════════════════════════════════
  describe('1. Create users (2 Customer, 1 Agent, 1 Merchant)', () => {
    it('registers Customer 1 successfully (201, status=pending)', async () => {
      const res = await registerUser(ctx.customer1);
      expect(res.status).to.equal(201);
      expect(res.data.user.status).to.equal('pending');
      ctx.customer1.id = res.data.user.id;
    });

    it('registers Customer 2 successfully (201, status=pending)', async () => {
      const res = await registerUser(ctx.customer2);
      expect(res.status).to.equal(201);
      expect(res.data.user.status).to.equal('pending');
      ctx.customer2.id = res.data.user.id;
    });

    it('registers the Agent successfully (201, status=pending)', async () => {
      const res = await registerUser(ctx.agent);
      expect(res.status).to.equal(201);
      expect(res.data.user.status).to.equal('pending');
      ctx.agent.id = res.data.user.id;
    });

    it('registers the Merchant successfully (201, status=pending)', async () => {
      const res = await registerUser(ctx.merchant);
      expect(res.status).to.equal(201);
      expect(res.data.user.status).to.equal('pending');
      ctx.merchant.id = res.data.user.id;
    });

    it('rejects registering the same phone number twice (208)', async () => {
      const res = await registerUser({ ...ctx.customer1, email: genEmail('dup') });
      expect(res.status).to.equal(208);
    });

    it('rejects an invalid role (400)', async () => {
      const res = await registerUser({
        name: 'Invalid Role User',
        email: genEmail('invalidrole'),
        password: 'Passw0rd!',
        phone_number: genPhone(),
        nid: randomDigits(10),
        role: 'Admin', // Admin cannot self-register
      });
      expect(res.status).to.equal(400);
    });
  });

  // ══════════════════════════════════════════════════════════════════════
  // 2. Admin activates the newly created users
  // ══════════════════════════════════════════════════════════════════════
  describe('2. Admin activates users', () => {
    before(async () => {
      ctx.adminToken = await loginAndGetToken(ADMIN_EMAIL, ADMIN_PASSWORD);
    });

    it('activates Customer 1 (200)', async () => {
      const res = await api.patch(`/user/update/${ctx.customer1.id}`, { status: 'active' }, { headers: authHeaders(ctx.adminToken) });
      expect(res.status).to.equal(200);
      expect(res.data.user.status).to.equal('active');
    });

    it('activates Customer 2 (200)', async () => {
      const res = await api.patch(`/user/update/${ctx.customer2.id}`, { status: 'active' }, { headers: authHeaders(ctx.adminToken) });
      expect(res.status).to.equal(200);
      expect(res.data.user.status).to.equal('active');
    });

    it('activates the Agent (200)', async () => {
      const res = await api.patch(`/user/update/${ctx.agent.id}`, { status: 'active' }, { headers: authHeaders(ctx.adminToken) });
      expect(res.status).to.equal(200);
      expect(res.data.user.status).to.equal('active');
    });

    it('activates the Merchant (200)', async () => {
      const res = await api.patch(`/user/update/${ctx.merchant.id}`, { status: 'active' }, { headers: authHeaders(ctx.adminToken) });
      expect(res.status).to.equal(200);
      expect(res.data.user.status).to.equal('active');
    });

    it('rejects a non-admin activation attempt with the wrong secret key (401)', async () => {
      const res = await api.patch(
        `/user/update/${ctx.merchant.id}`,
        { status: 'active' },
        { headers: { Authorization: `Bearer ${ctx.adminToken}`, 'X-AUTH-SECRET-KEY': 'WRONG-KEY' } }
      );
      expect(res.status).to.equal(401);
    });
  });

  // ══════════════════════════════════════════════════════════════════════
  // 3. Login as each activated user (OTP flow)
  // ══════════════════════════════════════════════════════════════════════
  describe('3. Login as activated users', () => {
    it('logs in Customer 1 and receives a JWT', async () => {
      ctx.customer1.token = await loginAndGetToken(ctx.customer1.phone_number, ctx.customer1.password);
      expect(ctx.customer1.token).to.be.a('string').and.not.empty;
    });

    it('logs in Customer 2 and receives a JWT', async () => {
      ctx.customer2.token = await loginAndGetToken(ctx.customer2.phone_number, ctx.customer2.password);
      expect(ctx.customer2.token).to.be.a('string').and.not.empty;
    });

    it('logs in the Agent and receives a JWT', async () => {
      ctx.agent.token = await loginAndGetToken(ctx.agent.phone_number, ctx.agent.password);
      expect(ctx.agent.token).to.be.a('string').and.not.empty;
    });

    it('logs in the Merchant and receives a JWT', async () => {
      ctx.merchant.token = await loginAndGetToken(ctx.merchant.phone_number, ctx.merchant.password);
      expect(ctx.merchant.token).to.be.a('string').and.not.empty;
    });

    it('rejects login with an incorrect password (401)', async () => {
      const res = await api.post('/user/login', { phone_number: ctx.customer1.phone_number, password: 'WrongPassword!' });
      expect(res.status).to.equal(401);
    });
  });

  // ══════════════════════════════════════════════════════════════════════
  // 4. SYSTEM account deposits 5000 tk to the Agent
  // ══════════════════════════════════════════════════════════════════════
  describe('4. SYSTEM deposits 5000 tk to Agent', () => {
    before(async () => {
      ctx.systemToken = await loginAndGetToken(SYSTEM_EMAIL, SYSTEM_PASSWORD);
    });

    it('deposits 5000 tk from SYSTEM to the Agent (201)', async () => {
      const res = await api.post(
        '/transaction/deposit',
        { from_account: 'SYSTEM', to_account: ctx.agent.phone_number, amount: 5000 },
        { headers: authHeaders(ctx.systemToken) }
      );
      expect(res.status).to.equal(201);
      expect(res.data.amount).to.equal(5000);
      expect(res.data.agentBalance).to.equal(5000);
    });

    it('rejects SYSTEM deposit to a non-Agent account (400)', async () => {
      const res = await api.post(
        '/transaction/deposit',
        { from_account: 'SYSTEM', to_account: ctx.customer1.phone_number, amount: 100 },
        { headers: authHeaders(ctx.systemToken) }
      );
      expect(res.status).to.equal(400);
    });
  });

  // ══════════════════════════════════════════════════════════════════════
  // 5. Agent deposits 2000 tk to Customer 1 — assert deposit commission
  // ══════════════════════════════════════════════════════════════════════
  describe('5. Agent deposits 2000 tk to Customer 1 (assert commission)', () => {
    const depositAmount = 2000;
    const expectedCommission = depositAmount * 0.025; // 2.5% agent commission, per Commissions table

    it('deposits 2000 tk to Customer 1 and returns the correct commission (201)', async () => {
      const res = await api.post(
        '/transaction/deposit',
        { from_account: ctx.agent.phone_number, to_account: ctx.customer1.phone_number, amount: depositAmount },
        { headers: authHeaders(ctx.agent.token) }
      );
      expect(res.status).to.equal(201);
      expect(res.data.commission).to.equal(expectedCommission);
    });

    it('rejects a deposit initiated by someone other than the Agent account owner (403)', async () => {
      const res = await api.post(
        '/transaction/deposit',
        { from_account: ctx.agent.phone_number, to_account: ctx.customer1.phone_number, amount: 100 },
        { headers: authHeaders(ctx.customer1.token) }
      );
      expect(res.status).to.equal(403);
    });
  });

  // ══════════════════════════════════════════════════════════════════════
  // 6. Customer 1 sends 1000 tk to Customer 2 — assert service fee
  // ══════════════════════════════════════════════════════════════════════
  describe('6. Customer 1 sends 1000 tk to Customer 2 (assert service fee)', () => {
    const sendAmount = 1000;
    const expectedFee = 5; // flat SendMoney "Service Fee" rule in Commissions table

    it('sends 1000 tk and returns the correct P2P service fee (201)', async () => {
      const res = await api.post(
        '/transaction/sendmoney',
        { from_account: ctx.customer1.phone_number, to_account: ctx.customer2.phone_number, amount: sendAmount },
        { headers: authHeaders(ctx.customer1.token) }
      );
      expect(res.status).to.equal(201);
      expect(res.data.fee).to.equal(expectedFee);
    });

    it('rejects send money to a Merchant account (400)', async () => {
      const res = await api.post(
        '/transaction/sendmoney',
        { from_account: ctx.customer1.phone_number, to_account: ctx.merchant.phone_number, amount: 100 },
        { headers: authHeaders(ctx.customer1.token) }
      );
      expect(res.status).to.equal(400);
    });
  });

  // ══════════════════════════════════════════════════════════════════════
  // 7. Customer 2 cashes out 500 tk from the Agent — assert service fee
  // ══════════════════════════════════════════════════════════════════════
  describe('7. Customer 2 cashes out 500 tk via Agent (assert service fee)', () => {
    const withdrawAmount = 500;
    const expectedFee = Math.max(withdrawAmount * 0.01, 5); // 1% withdraw fee, 5 tk floor

    it('withdraws 500 tk through the Agent and returns the correct service fee (201)', async () => {
      const res = await api.post(
        '/transaction/withdraw',
        { from_account: ctx.customer2.phone_number, to_account: ctx.agent.phone_number, amount: withdrawAmount },
        { headers: authHeaders(ctx.customer2.token) }
      );
      expect(res.status).to.equal(201);
      expect(res.data.fee).to.equal(expectedFee);
    });

    it('rejects withdraw to a non-Agent account (400)', async () => {
      const res = await api.post(
        '/transaction/withdraw',
        { from_account: ctx.customer2.phone_number, to_account: ctx.customer1.phone_number, amount: 50 },
        { headers: authHeaders(ctx.customer2.token) }
      );
      expect(res.status).to.equal(400);
    });
  });

  // ══════════════════════════════════════════════════════════════════════
  // 8. Customer 1 pays 400 tk to the Merchant — assert fee deducted from customer
  // ══════════════════════════════════════════════════════════════════════
  describe('8. Customer 1 pays 400 tk to Merchant (assert service fee deducted)', () => {
    const paymentAmount = 400;
    const expectedFee = Math.max(paymentAmount * 0.01, 5); // 1% payment fee, 5 tk floor

    it('pays 400 tk to the Merchant, deducting amount + fee from the customer (201)', async () => {
      const beforeRes = await api.get(`/transaction/balance/${ctx.customer1.phone_number}`, { headers: authHeaders(ctx.customer1.token) });
      expect(beforeRes.status).to.equal(200);
      const balanceBefore = beforeRes.data.balance;

      const res = await api.post(
        '/transaction/payment',
        { from_account: ctx.customer1.phone_number, to_account: ctx.merchant.phone_number, amount: paymentAmount },
        { headers: authHeaders(ctx.customer1.token) }
      );
      expect(res.status).to.equal(201);
      expect(res.data.fee).to.equal(expectedFee);
      expect(res.data.currentBalance).to.equal(balanceBefore - paymentAmount - expectedFee);
    });

    it('rejects payment to a non-Merchant account (400)', async () => {
      const res = await api.post(
        '/transaction/payment',
        { from_account: ctx.customer1.phone_number, to_account: ctx.customer2.phone_number, amount: 50 },
        { headers: authHeaders(ctx.customer1.token) }
      );
      expect(res.status).to.equal(400);
    });
  });
});
