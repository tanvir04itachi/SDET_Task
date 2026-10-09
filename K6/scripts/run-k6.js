// Runs the k6 test with the project defaults. Finds k6 on PATH or in its default Windows install folder.
// Usage: node scripts/run-k6.js [--dashboard] [extra k6 args...]
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const candidates = ['k6', 'C:\\Program Files\\k6\\k6.exe'];
const k6 = candidates.find((c) => spawnSync(c, ['version']).status === 0);
if (!k6) {
  console.error('k6 not found. Install it with: winget install k6');
  process.exit(1);
}

const args = process.argv.slice(2);
const env = { ...process.env };
if (args.includes('--dashboard')) {
  env.K6_WEB_DASHBOARD = 'true';
  env.K6_WEB_DASHBOARD_EXPORT = 'reports/dashboard.html';
}

fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
const k6Args = ['run', ...args.filter((a) => a !== '--dashboard'), 'tests/dmoney-transactions.js'];
const result = spawnSync(k6, k6Args, { cwd: root, env, stdio: 'inherit' });
process.exit(result.status ?? 1);
