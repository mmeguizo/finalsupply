import { Sequelize } from 'sequelize';
import { sequelize } from '../db/connectDB.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, '..', 'migrations');

async function ensureLedger() {
  const query = sequelize.getQueryInterface();
  const tables = await query.showAllTables();
  if (!tables.includes('_migrations')) {
    await query.createTable('_migrations', {
      name: { type: Sequelize.STRING(255), primaryKey: true },
      appliedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });
  }
}

async function getApplied() {
  const [rows] = await sequelize.query('SELECT name FROM _migrations ORDER BY name');
  return new Set(rows.map((r) => r.name));
}

async function removeFromLedger(name) {
  await sequelize.query('DELETE FROM _migrations WHERE name = ?', { replacements: [name] });
}

async function loadMod(name) {
  const file = fs.readdirSync(migrationsDir).find((f) => f.startsWith(name) && f.endsWith('.js'));
  if (!file) throw new Error(`Migration file for ${name} not found`);
  const fullPath = path.join(migrationsDir, file);
  return import(`file://${fullPath.replace(/\\/g, '/')}`);
}

function extractUp(mod) {
  return mod.up || (mod.default && mod.default.up);
}

function extractDown(mod) {
  return mod.down || (mod.default && mod.default.down);
}

async function callMigrationFn(fn, name) {
  const queryInterface = sequelize.getQueryInterface();
  const args = fn.length >= 2
    ? [queryInterface, Sequelize]
    : fn.length === 1
      ? [queryInterface]
      : [];
  await fn(...args);
}

async function runUp(name) {
  const mod = await loadMod(name);
  const upFn = extractUp(mod);
  if (!upFn) throw new Error(`Migration ${name} has no up() export`);
  await callMigrationFn(upFn, name);
}

async function runDown(name) {
  const mod = await loadMod(name);
  const downFn = extractDown(mod);
  if (!downFn) throw new Error(`Migration ${name} has no down() export`);
  await callMigrationFn(downFn, name);
}

function getMigrationFiles() {
  return fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.js'))
    .sort();
}

function getMigrationName(file) {
  return path.parse(file).name;
}

export async function migrate() {
  await sequelize.authenticate();
  await ensureLedger();
  const applied = await getApplied();

  const files = getMigrationFiles();
  let count = 0;

  for (const file of files) {
    const name = getMigrationName(file);
    if (applied.has(name)) {
      continue;
    }

    try {
      await runUp(name);
      await markApplied(name);
      console.log(`[migrate] ${name} applied`);
      count++;
    } catch (err) {
      console.error(`[migrate] ${name} FAILED:`, err);
      process.exit(1);
    }
  }

  if (count === 0) {
    console.log('[migrate] All migrations already applied');
  } else {
    console.log(`[migrate] Applied ${count} migration(s)`);
  }
  await sequelize.close();
}

async function markApplied(name) {
  await sequelize.query('INSERT INTO _migrations (name, appliedAt) VALUES (?, NOW())', {
    replacements: [name],
  });
}

export async function rollback(steps = 1) {
  await sequelize.authenticate();
  await ensureLedger();

  const [rows] = await sequelize.query(
    'SELECT name FROM _migrations ORDER BY name DESC LIMIT ?',
    { replacements: [steps] }
  );

  if (rows.length === 0) {
    console.log('[rollback] No migrations to roll back');
    await sequelize.close();
    return;
  }

  for (const row of rows) {
    try {
      await runDown(row.name);
      await removeFromLedger(row.name);
      console.log(`[rollback] ${row.name} reverted`);
    } catch (err) {
      console.error(`[rollback] ${row.name} FAILED:`, err);
      process.exit(1);
    }
  }

  await sequelize.close();
}

export async function check() {
  await sequelize.authenticate();
  await ensureLedger();
  const applied = await getApplied();
  const files = getMigrationFiles();

  console.log('=== Migration Status ===');
  let pending = 0;

  for (const file of files) {
    const name = getMigrationName(file);
    const status = applied.has(name) ? 'APPLIED' : 'PENDING';
    console.log(`  ${status}  ${name}`);
    if (!applied.has(name)) pending++;
  }

  console.log(`\nTotal: ${files.length}, Applied: ${files.length - pending}, Pending: ${pending}`);

  if (pending > 0) {
    console.log('\nWARNING: There are pending migrations. Run `npm run migrate` to apply them.');
  }

  await sequelize.close();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];

  if (arg === '--down') {
    const steps = parseInt(process.argv[3], 10) || 1;
    rollback(steps).catch((err) => { console.error(err); process.exit(1); });
  } else if (arg === '--check') {
    check().catch((err) => { console.error(err); process.exit(1); });
  } else {
    migrate().catch((err) => { console.error(err); process.exit(1); });
  }
}
