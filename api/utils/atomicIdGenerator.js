import { sequelize } from '../db/connectDB.js';

const CAMPUS_CODES = { Talisay: 'T', 'Fortune Town': 'F', Binalbagan: 'B', Alijis: 'A' };

function campusCode(location) {
  return CAMPUS_CODES[location] || 'T';
}

async function nextVal(type, year, scope, t) {
  scope = scope || '';
  const [rows] = await sequelize.query(
    `SELECT counter FROM id_counters WHERE type = ? AND year = ? AND scope = ? FOR UPDATE`,
    { replacements: [type, year, scope], transaction: t }
  );
  if (rows.length === 0) {
    await sequelize.query(
      `INSERT INTO id_counters (type, year, scope, counter) VALUES (?, ?, ?, 1)`,
      { replacements: [type, year, scope], transaction: t }
    );
    return 1;
  }
  const next = rows[0].counter + 1;
  await sequelize.query(
    `UPDATE id_counters SET counter = ? WHERE type = ? AND year = ? AND scope = ?`,
    { replacements: [next, type, year, scope], transaction: t }
  );
  return next;
}

async function withTransaction(fn) {
  const t = await sequelize.transaction();
  try {
    const result = await fn(t);
    await t.commit();
    return result;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

export async function nextIarId(campus, t) {
  const now = new Date();
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const yy = now.getFullYear().toString().slice(-2);
  const year = now.getFullYear();
  const scope = campusCode(campus);

  const work = async (tx) => {
    const seq = await nextVal('iar', year, scope, tx);
    return `${mm}${dd}${yy}-${seq.toString().padStart(3, '0')}-${scope}`;
  };

  return t ? work(t) : withTransaction(work);
}

export async function nextParId(t) {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const year = now.getFullYear();

  const work = async (tx) => {
    const seq = await nextVal('par', year, '', tx);
    return `${yy}-${seq.toString().padStart(3, '0')}`;
  };

  return t ? work(t) : withTransaction(work);
}

export async function nextRisId(t) {
  const now = new Date();
  const year = now.getFullYear();
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');

  const work = async (tx) => {
    const seq = await nextVal('ris', year, '', tx);
    return `${year}-${mm}-${seq.toString().padStart(4, '0')}`;
  };

  return t ? work(t) : withTransaction(work);
}

export async function nextIcsId(tag, t) {
  const now = new Date();
  const year = now.getFullYear();
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const prefix = tag === 'high' ? 'SPHV' : 'SPLV';
  const type = tag === 'high' ? 'ics_high' : 'ics_low';

  const work = async (tx) => {
    const seq = await nextVal(type, year, '', tx);
    return `${prefix}-${year}-${mm}-${seq.toString().padStart(4, '0')}`;
  };

  return t ? work(t) : withTransaction(work);
}
