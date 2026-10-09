// Restores the TransactionLimits rows saved by prepare-db.js.
const fs = require('fs');
const path = require('path');
const { connect } = require('./db');

const BACKUP = path.join(__dirname, 'limits-backup.json');

(async () => {
  if (!fs.existsSync(BACKUP)) {
    console.log('No backup found, nothing to restore.');
    return;
  }
  const rows = JSON.parse(fs.readFileSync(BACKUP, 'utf8'));
  const db = await connect();
  try {
    for (const r of rows) {
      await db.query(
        'UPDATE TransactionLimits SET max_amount = ?, max_count = ?, is_active = ? WHERE id = ?',
        [r.max_amount, r.max_count, r.is_active, r.id]
      );
    }
    fs.unlinkSync(BACKUP);
    const [after] = await db.query('SELECT role, period, max_amount, max_count, is_active FROM TransactionLimits');
    console.table(after);
    console.log('Original limits restored.');
  } finally {
    await db.end();
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
