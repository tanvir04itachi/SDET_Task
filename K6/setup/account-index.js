/**
 * Experiment helper: adds (or with --drop, removes) an index on Transactions.account.
 *
 * Without it, every `SELECT ... WHERE account = ? FOR UPDATE` in the deposit,
 * send money and payment controllers scans and locks the whole Transactions
 * table, which causes the MySQL deadlocks seen in the baseline runs.
 */
const { connect } = require('./db');

const INDEX = 'idx_transactions_account_k6';

(async () => {
  const drop = process.argv.includes('--drop');
  const db = await connect();
  try {
    const [rows] = await db.query('SHOW INDEX FROM Transactions WHERE Key_name = ?', [INDEX]);
    if (drop && rows.length) {
      await db.query(`DROP INDEX ${INDEX} ON Transactions`);
      console.log(`Dropped ${INDEX}.`);
    } else if (!drop && !rows.length) {
      await db.query(`CREATE INDEX ${INDEX} ON Transactions (account)`);
      console.log(`Created ${INDEX} on Transactions(account).`);
    } else {
      console.log(`Nothing to do (${INDEX} ${rows.length ? 'exists' : 'absent'}).`);
    }
  } finally {
    await db.end();
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
