import http from 'k6/http';
import { check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { authHeaders } from './auth.js';

// Endpoint, expected status and exact success message for each transaction API.
export const APIS = {
  deposit:   { path: '/transaction/deposit',   status: 201, message: 'Deposit successful' },
  sendmoney: { path: '/transaction/sendmoney', status: 201, message: 'Send money successful' },
  payment:   { path: '/transaction/payment',   status: 201, message: 'Payment successful' },
};

const metrics = {};
for (const api of Object.keys(APIS)) {
  metrics[api] = {
    duration: new Trend(`${api}_duration`, true),
    success: new Rate(`${api}_success`),
    count: new Counter(`${api}_count`),
  };
}

function parse(res) {
  try {
    return res.json() || {};
  } catch (e) {
    return {};
  }
}

/**
 * Sends one transaction and validates it.
 * @param {string} api    deposit | sendmoney | payment
 * @param {object} ctx    { cfg, tokens, users } from setup()
 * @param {string} from   user key of the payer (whose token is used)
 * @param {string} to     user key of the receiver
 * @param {string} phase  p1..p4 (30-second window)
 */
export function transact(api, ctx, from, to, phase, amount) {
  const { cfg, tokens, users } = ctx;
  const spec = APIS[api];
  const tags = { type: 'transaction', api, phase, flow: `${from}->${to}` };

  const res = http.post(
    `${cfg.baseUrl}${spec.path}`,
    JSON.stringify({ from_account: users[from].phone_number, to_account: users[to].phone_number, amount }),
    { headers: authHeaders(cfg, tokens[from]), tags, timeout: '30s' }
  );
  const body = parse(res);

  const ok = check(
    res,
    {
      [`${api}: status is ${spec.status}`]: (r) => r.status === spec.status,
      [`${api}: transaction successful`]: () => !body.error && typeof body.message === 'string' && /successful/i.test(body.message),
      [`${api}: trnxId returned`]: () => typeof body.trnxId === 'string' && body.trnxId.length > 0,
      [`${api}: message is "${spec.message}"`]: () => body.message === spec.message,
    },
    tags
  );

  const m = metrics[api];
  m.duration.add(res.timings.duration, tags);
  m.success.add(ok, tags);
  m.count.add(1, tags);

  if (!ok) {
    console.warn(`[${phase}] ${api} ${from}->${to} failed: ${res.status} ${res.body}`);
  }
  return res;
}
