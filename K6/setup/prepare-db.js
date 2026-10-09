/**
 * Raises the Customer daily/monthly outgoing limits in the local test DB.
 *
 * The defaults (10 txns/day, 50 txns/month) are far below what a 2-minute
 * continuous load test generates, so without this step most send-money and
 * payment requests would be rejected with 400 "limit exceeded".
 *
 * The original rows are saved once to setup/limits-backup.json; run
 * `npm run restore-db` afterwards to put them back.
 */
const fs = require('fs');
const path = require('path');
const { connect } = require('./db');

const BACKUP = path.join(__dirname, 'limits-backup.json');
const TEST_MAX_AMOUNT = 100000000;
const TEST_MAX_COUNT = 1000000;

(async () => {
  const db = await connect();
  try {
    const [rows] = await db.query('SELECT id, role, period, max_amount, max_count, is_active FROM TransactionLimits');

    // Keep the first backup only, so rerunning never overwrites the real values with test values.
    if (!fs.existsSync(BACKUP)) {
      fs.writeFileSync(BACKUP, JSON.stringify(rows, null, 2));
      console.log(`Saved ${rows.length} original limit row(s) to ${path.relative(process.cwd(), BACKUP)}`);
    } else {
      console.log('Backup already exists, keeping it.');
    }

    await db.query(
      "UPDATE TransactionLimits SET max_amount = ?, max_count = ? WHERE role = 'Customer'",
      [TEST_MAX_AMOUNT, TEST_MAX_COUNT]
    );
    const [after] = await db.query('SELECT role, period, max_amount, max_count, is_active FROM TransactionLimits');
    console.table(after);
  } finally {
    await db.end();
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
