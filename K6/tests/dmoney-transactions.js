/**
 * DMoney transaction load test — 2 minutes, four 30-second windows.
 *
 * Every flow is its own constant-vus scenario with a startTime, so flows in the
 * same window run concurrently and keep running for the whole window.
 *
 * Run: npm test   (or: k6 run tests/dmoney-transactions.js)
 */
import { sleep } from 'k6';
import http from 'k6/http';
import exec from 'k6/execution';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/2.4.0/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.1.0/index.js';
import { login, authHeaders } from '../lib/auth.js';
import { transact } from '../lib/transactions.js';

const cfg = JSON.parse(open(__ENV.USERS_FILE || '../config/users.json'));
if (__ENV.BASE_URL) cfg.baseUrl = __ENV.BASE_URL;

const VUS = Number(__ENV.VUS || 1);
const THINK_TIME = Number(__ENV.THINK_TIME || 1);
const AMOUNT = Number(__ENV.AMOUNT || 10);
const WINDOW = '30s';

// [scenario name, exec fn, window start, api, payer, receiver]
const FLOWS = [
  ['p1_c1_send_c2', 'c1SendC2_p1', '0s',  'sendmoney', 'customer1', 'customer2'],
  ['p1_c2_pay_m1',  'c2PayM1_p1',  '0s',  'payment',   'customer2', 'merchant1'],

  ['p2_c2_send_c1', 'c2SendC1_p2', '30s', 'sendmoney', 'customer2', 'customer1'],
  ['p2_a1_dep_c2',  'a1DepC2_p2',  '30s', 'deposit',   'agent1',    'customer2'],
  ['p2_c1_pay_m1',  'c1PayM1_p2',  '30s', 'payment',   'customer1', 'merchant1'],

  ['p3_a1_dep_c1',  'a1DepC1_p3',  '60s', 'deposit',   'agent1',    'customer1'],
  ['p3_a2_dep_c2',  'a2DepC2_p3',  '60s', 'deposit',   'agent2',    'customer2'],
  ['p3_c1_send_c2', 'c1SendC2_p3', '60s', 'sendmoney', 'customer1', 'customer2'],
  ['p3_c2_pay_m2',  'c2PayM2_p3',  '60s', 'payment',   'customer2', 'merchant2'],

  ['p4_a1_pay_m1',  'a1PayM1_p4',  '90s', 'payment',   'agent1',    'merchant1'],
  ['p4_a2_pay_m2',  'a2PayM2_p4',  '90s', 'payment',   'agent2',    'merchant2'],
  ['p4_c1_pay_m1',  'c1PayM1_p4',  '90s', 'payment',   'customer1', 'merchant1'],
  ['p4_c2_pay_m2',  'c2PayM2_p4',  '90s', 'payment',   'customer2', 'merchant2'],
];

const scenarios = {};
for (const [name, fn, startTime, api] of FLOWS) {
  scenarios[name] = {
    executor: 'constant-vus',
    exec: fn,
    vus: VUS,
    startTime,
    duration: WINDOW,
    gracefulStop: '5s',
    tags: { scenario_api: api },
  };
}

// Per API x phase latency thresholds: they show how each API behaves as the workload changes.
// The count>0 entries only expose per-window request counts in the summary (for throughput per window).
const phaseThresholds = {};
for (const [name, , , api] of FLOWS) {
  const phase = name.slice(0, 2);
  phaseThresholds[`http_req_duration{api:${api},phase:${phase}}`] = ['p(95)<1000'];
  phaseThresholds[`http_reqs{api:${api},phase:${phase}}`] = ['count>0'];
  phaseThresholds[`http_req_failed{api:${api},phase:${phase}}`] = ['rate<0.01'];
}
for (const phase of ['p1', 'p2', 'p3', 'p4']) {
  phaseThresholds[`http_reqs{type:transaction,phase:${phase}}`] = ['count>0'];
  phaseThresholds[`http_req_failed{type:transaction,phase:${phase}}`] = ['rate<0.01'];
}

export const options = {
  scenarios,
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  thresholds: {
    // Assignment-wide requirements
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
    'http_req_failed{type:transaction}': ['rate<0.01'],
    'http_req_duration{type:transaction}': ['p(95)<1000'],
    'checks{type:transaction}': ['rate>=0.99'],

    // Deposit
    'http_req_duration{api:deposit}': ['p(95)<1000'],
    'http_req_failed{api:deposit}': ['rate<0.01'],
    'checks{api:deposit}': ['rate>=0.99'],
    deposit_success: ['rate>=0.99'],
    deposit_duration: ['p(95)<1000'],

    // Send Money
    'http_req_duration{api:sendmoney}': ['p(95)<1000'],
    'http_req_failed{api:sendmoney}': ['rate<0.01'],
    'checks{api:sendmoney}': ['rate>=0.99'],
    sendmoney_success: ['rate>=0.99'],
    sendmoney_duration: ['p(95)<1000'],

    // Payment
    'http_req_duration{api:payment}': ['p(95)<1000'],
    'http_req_failed{api:payment}': ['rate<0.01'],
    'checks{api:payment}': ['rate>=0.99'],
    payment_success: ['rate>=0.99'],
    payment_duration: ['p(95)<1000'],

    // Per 30-second window
    'http_req_duration{type:transaction,phase:p1}': ['p(95)<1000'],
    'http_req_duration{type:transaction,phase:p2}': ['p(95)<1000'],
    'http_req_duration{type:transaction,phase:p3}': ['p(95)<1000'],
    'http_req_duration{type:transaction,phase:p4}': ['p(95)<1000'],
    ...phaseThresholds,
  },
};

// Rough worst-case spend per payer (ignores incoming money): iterations x (amount + 5 tk min fee).
const OUTGOING_WINDOWS = { customer1: 4, customer2: 4, agent1: 3, agent2: 2 };

export function setup() {
  const tokens = {};
  for (const [key, user] of Object.entries(cfg.users)) {
    tokens[key] = login(cfg, user); // each user authenticates with their own credentials
  }

  const iterations = Math.ceil(30 / Math.max(THINK_TIME, 0.1)) * VUS;
  for (const [key, windows] of Object.entries(OUTGOING_WINDOWS)) {
    const phone = cfg.users[key].phone_number;
    const res = http.get(`${cfg.baseUrl}/transaction/balance/${phone}`, {
      headers: authHeaders(cfg, tokens[key]),
      tags: { type: 'auth' },
    });
    const balance = Number(res.json('balance'));
    const needed = windows * iterations * (AMOUNT + 5);
    console.log(`${key}: balance ${balance} tk, estimated max spend ${needed} tk`);
    if (!(balance >= needed)) {
      exec.test.abort(`${key} is underfunded (${balance} < ${needed}). Run "npm run seed" first.`);
    }
  }
  return { cfg, tokens, users: cfg.users };
}

function flow(api, from, to, ctx) {
  const phase = exec.scenario.name.slice(0, 2);
  transact(api, ctx, from, to, phase, AMOUNT);
  sleep(THINK_TIME);
}

// 0–30s
export function c1SendC2_p1(ctx) { flow('sendmoney', 'customer1', 'customer2', ctx); }
export function c2PayM1_p1(ctx)  { flow('payment',   'customer2', 'merchant1', ctx); }
// 30–60s
export function c2SendC1_p2(ctx) { flow('sendmoney', 'customer2', 'customer1', ctx); }
export function a1DepC2_p2(ctx)  { flow('deposit',   'agent1',    'customer2', ctx); }
export function c1PayM1_p2(ctx)  { flow('payment',   'customer1', 'merchant1', ctx); }
// 60–90s
export function a1DepC1_p3(ctx)  { flow('deposit',   'agent1',    'customer1', ctx); }
export function a2DepC2_p3(ctx)  { flow('deposit',   'agent2',    'customer2', ctx); }
export function c1SendC2_p3(ctx) { flow('sendmoney', 'customer1', 'customer2', ctx); }
export function c2PayM2_p3(ctx)  { flow('payment',   'customer2', 'merchant2', ctx); }
// 90–120s
export function a1PayM1_p4(ctx)  { flow('payment',   'agent1',    'merchant1', ctx); }
export function a2PayM2_p4(ctx)  { flow('payment',   'agent2',    'merchant2', ctx); }
export function c1PayM1_p4(ctx)  { flow('payment',   'customer1', 'merchant1', ctx); }
export function c2PayM2_p4(ctx)  { flow('payment',   'customer2', 'merchant2', ctx); }

export function handleSummary(data) {
  // setup_data holds tokens, passwords and the partner key: never write it to the reports.
  delete data.setup_data;
  return {
    'reports/summary.html': htmlReport(data, { title: 'DMoney Transactions' }),
    'reports/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
