// Turns reports/summary.json into Markdown tables comparing the three APIs and the four 30-second windows.
// Usage: node scripts/compare.js [path/to/summary.json]
const fs = require('fs');
const path = require('path');

const file = process.argv[2] || path.join(__dirname, '..', 'reports', 'summary.json');
const { metrics, state } = JSON.parse(fs.readFileSync(file, 'utf8'));
const runSeconds = state.testRunDurationMs / 1000;
const WINDOW_SECONDS = 30;

const ms = (v) => (v === undefined ? '-' : `${v.toFixed(2)} ms`);
const pct = (v) => (v === undefined ? '-' : `${(v * 100).toFixed(2)}%`);
const val = (name) => metrics[name] && metrics[name].values;
const passed = (name) => {
  const t = metrics[name] && metrics[name].thresholds;
  if (!t) return '';
  return Object.values(t).every((x) => x.ok) ? '✅' : '❌';
};

const APIS = ['deposit', 'sendmoney', 'payment'];
const LABEL = { deposit: 'Deposit', sendmoney: 'Send Money', payment: 'Payment' };

console.log(`Test duration: ${runSeconds.toFixed(1)} s\n`);
console.log('### Per-API comparison\n');
console.log('| API | Requests | Throughput | Avg | Median | p(90) | p(95) | Max | Failure rate | Check pass rate |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
for (const api of APIS) {
  const d = val(`http_req_duration{api:${api}}`) || {};
  const count = (val(`${api}_count`) || {}).count || 0;
  const failed = (val(`http_req_failed{api:${api}}`) || {}).rate;
  const checks = (val(`checks{api:${api}}`) || {}).rate;
  console.log(`| ${LABEL[api]} | ${count} | ${(count / runSeconds).toFixed(2)} req/s | ${ms(d.avg)} | ${ms(d.med)} | ${ms(d['p(90)'])} | ${ms(d['p(95)'])} ${passed(`http_req_duration{api:${api}}`)} | ${ms(d.max)} | ${pct(failed)} ${passed(`http_req_failed{api:${api}}`)} | ${pct(checks)} ${passed(`checks{api:${api}}`)} |`);
}
const all = val('http_req_duration{type:transaction}') || {};
const allCount = (val('http_reqs{type:transaction}') || {}).count
  || APIS.reduce((s, a) => s + ((val(`${a}_count`) || {}).count || 0), 0);
console.log(`| **All transactions** | ${allCount} | ${(allCount / runSeconds).toFixed(2)} req/s | ${ms(all.avg)} | ${ms(all.med)} | ${ms(all['p(90)'])} | ${ms(all['p(95)'])} | ${ms(all.max)} | ${pct((val('http_req_failed{type:transaction}') || {}).rate)} | ${pct((val('checks{type:transaction}') || {}).rate)} |`);

console.log('\n### Per-window (workload change)\n');
const FLOWS = { p1: '0–30s (2 flows)', p2: '30–60s (3 flows)', p3: '60–90s (4 flows)', p4: '90–120s (4 payment flows)' };
console.log('| Window | Requests | Throughput | Avg | p(95) | Max | Failure rate |');
console.log('|---|---|---|---|---|---|---|');
for (const [phase, label] of Object.entries(FLOWS)) {
  const d = val(`http_req_duration{type:transaction,phase:${phase}}`) || {};
  const count = (val(`http_reqs{type:transaction,phase:${phase}}`) || {}).count || 0;
  const failed = (val(`http_req_failed{type:transaction,phase:${phase}}`) || {}).rate;
  console.log(`| ${label} | ${count} | ${(count / WINDOW_SECONDS).toFixed(2)} req/s | ${ms(d.avg)} | ${ms(d['p(95)'])} | ${ms(d.max)} | ${pct(failed)} |`);
}

console.log('\n### Per-API per-window\n');
console.log('| API | Window | Requests | Avg | p(95) | Max | Failure rate |');
console.log('|---|---|---|---|---|---|---|');
for (const api of APIS) {
  for (const phase of Object.keys(FLOWS)) {
    const d = val(`http_req_duration{api:${api},phase:${phase}}`);
    if (!d) continue;
    const count = (val(`http_reqs{api:${api},phase:${phase}}`) || {}).count;
    const failed = (val(`http_req_failed{api:${api},phase:${phase}}`) || {}).rate;
    console.log(`| ${LABEL[api]} | ${phase} | ${count ?? '-'} | ${ms(d.avg)} | ${ms(d['p(95)'])} | ${ms(d.max)} | ${pct(failed)} |`);
  }
}

console.log('\n### Thresholds\n');
const failedThresholds = Object.entries(metrics)
  .filter(([, m]) => m.thresholds)
  .flatMap(([name, m]) => Object.entries(m.thresholds).filter(([, t]) => !t.ok).map(([expr]) => `${name}: ${expr}`));
const total = Object.values(metrics).reduce((s, m) => s + (m.thresholds ? Object.keys(m.thresholds).length : 0), 0);
console.log(`${total - failedThresholds.length}/${total} thresholds passed.`);
failedThresholds.forEach((t) => console.log(`- ❌ ${t}`));
