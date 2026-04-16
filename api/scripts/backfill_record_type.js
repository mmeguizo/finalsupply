/**
 * Backfill record_type for existing issuance clones
 * ===================================================
 *
 * PROBLEM:
 *   The migration 20260416 added `record_type` with default 'iar_original' to ALL rows.
 *   But some rows are actually issuance clones (created by PAR/ICS/RIS assignment
 *   mutations BEFORE the record_type column existed). These need to be corrected
 *   to 'issuance_clone'.
 *
 * HOW CLONES ARE CREATED (two patterns):
 *
 *   Pattern A — Split operations (PAR/ICS/RIS split):
 *     - The ORIGINAL record is updated in-place with splitIndex=1, splitFromItemId=its own ID
 *     - CLONE records are created with splitIndex > 1, splitFromItemId = original's ID
 *     → Definitive marker: split_index > 1
 *
 *   Pattern B — Simple assignments (single PAR/ICS/RIS assign):
 *     - A NEW clone record is created (copy of source) with the ticket ID set
 *     - The SOURCE record's actualQuantityReceived is reduced
 *     - NO split tracking fields are set on the clone
 *     → No definitive marker. Must use heuristic: duplicate purchase_order_item_id
 *       where the record is NOT the first (min ID) for that item.
 *
 * STRATEGY:
 *   Phase 1 (automatic, 100% confidence):
 *     Records with split_index > 1 AND record_type = 'iar_original' → update to 'issuance_clone'
 *
 *   Phase 2 (heuristic, high confidence):
 *     Records that share purchase_order_item_id with another record, are NOT the min ID
 *     in that group, AND have a ticket ID set (par_id, ics_id, or ris_id).
 *     These are shown for review and optionally updated.
 *
 * USAGE:
 *   node --experimental-modules scripts/backfill_record_type.js           # Dry run (default)
 *   node --experimental-modules scripts/backfill_record_type.js --apply   # Apply changes
 */

import { sequelize } from '../db/connectDB.js';
import { QueryTypes } from 'sequelize';

const DRY_RUN = !process.argv.includes('--apply');

(async () => {
  try {
    console.log('='.repeat(70));
    console.log('  BACKFILL record_type FOR PRE-EXISTING ISSUANCE CLONES');
    console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (pass --apply to execute)' : '⚡ APPLYING CHANGES'}`);
    console.log('='.repeat(70));
    console.log();

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 0: Show current state
    // ──────────────────────────────────────────────────────────────────────
    const summary = await sequelize.query(
      `SELECT record_type, COUNT(*) AS cnt
       FROM inspection_acceptance_report
       WHERE is_deleted = 0
       GROUP BY record_type`,
      { type: QueryTypes.SELECT }
    );
    console.log('📊 Current record_type distribution:');
    summary.forEach((row) => console.log(`   ${row.record_type}: ${row.cnt} rows`));
    console.log();

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 1: Definitive split clones (split_index > 1)
    // ──────────────────────────────────────────────────────────────────────
    console.log('─'.repeat(70));
    console.log('PHASE 1: Split clones (split_index > 1, currently iar_original)');
    console.log('─'.repeat(70));

    const splitClones = await sequelize.query(
      `SELECT id, iar_id, purchase_order_item_id, split_from_item_id, split_index,
              split_group_id, actual_quantity_received, par_id, ics_id, ris_id, record_type
       FROM inspection_acceptance_report
       WHERE split_index > 1
         AND record_type = 'iar_original'
         AND is_deleted = 0
       ORDER BY id`,
      { type: QueryTypes.SELECT }
    );

    if (splitClones.length === 0) {
      console.log('   ✅ No split clones need backfilling.\n');
    } else {
      console.log(
        `   Found ${splitClones.length} split clone(s) incorrectly marked as iar_original:\n`
      );
      splitClones.forEach((row) => {
        const ticket = row.par_id || row.ics_id || row.ris_id || '(none)';
        console.log(
          `   ID ${row.id} | iarId: ${row.iar_id} | poItemId: ${row.purchase_order_item_id} ` +
            `| splitFrom: ${row.split_from_item_id} | splitIndex: ${row.split_index} ` +
            `| qty: ${row.actual_quantity_received} | ticket: ${ticket}`
        );
      });
      console.log();

      if (!DRY_RUN) {
        const [, meta] = await sequelize.query(
          `UPDATE inspection_acceptance_report
           SET record_type = 'issuance_clone'
           WHERE split_index > 1
             AND record_type = 'iar_original'
             AND is_deleted = 0`
        );
        const affected = meta?.affectedRows ?? meta?.rowCount ?? splitClones.length;
        console.log(`   ⚡ Updated ${affected} split clone(s) to 'issuance_clone'.\n`);
      } else {
        console.log(`   🔍 DRY RUN — would update ${splitClones.length} row(s).\n`);
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 2: Simple assignment clones (no split fields, duplicate poItemId)
    //
    // Logic: For each purchase_order_item_id that appears more than once,
    // the record with the LOWEST id is the original IAR record (created
    // during IAR generation). Records with HIGHER ids that also have a
    // ticket ID set (par_id, ics_id, or ris_id) are likely clones created
    // by simple (non-split) assignment mutations before the fix.
    //
    // NOTE: We exclude records that already have split tracking fields
    // (those are handled in Phase 1) and records already marked as
    // issuance_clone (already correct).
    // ──────────────────────────────────────────────────────────────────────
    console.log('─'.repeat(70));
    console.log('PHASE 2: Simple assignment clones (no split fields, duplicate poItemId)');
    console.log('─'.repeat(70));

    const simpleClones = await sequelize.query(
      `SELECT iar.id, iar.iar_id, iar.purchase_order_item_id,
              iar.actual_quantity_received, iar.par_id, iar.ics_id, iar.ris_id,
              iar.record_type, iar.split_from_item_id, iar.split_index,
              grp.min_id AS original_id
       FROM inspection_acceptance_report iar
       INNER JOIN (
         SELECT purchase_order_item_id, MIN(id) AS min_id, COUNT(*) AS cnt
         FROM inspection_acceptance_report
         WHERE is_deleted = 0
         GROUP BY purchase_order_item_id
         HAVING cnt > 1
       ) grp ON iar.purchase_order_item_id = grp.purchase_order_item_id
       WHERE iar.id != grp.min_id
         AND iar.record_type = 'iar_original'
         AND iar.is_deleted = 0
         AND iar.split_from_item_id IS NULL
         AND iar.split_index IS NULL
         AND (iar.par_id IS NOT NULL OR iar.ics_id IS NOT NULL OR iar.ris_id IS NOT NULL)
       ORDER BY iar.purchase_order_item_id, iar.id`,
      { type: QueryTypes.SELECT }
    );

    if (simpleClones.length === 0) {
      console.log('   ✅ No simple assignment clones detected.\n');
    } else {
      console.log(`   Found ${simpleClones.length} likely simple clone(s):\n`);
      simpleClones.forEach((row) => {
        const ticket = row.par_id || row.ics_id || row.ris_id || '(none)';
        console.log(
          `   ID ${row.id} | iarId: ${row.iar_id} | poItemId: ${row.purchase_order_item_id} ` +
            `| originalId: ${row.original_id} | qty: ${row.actual_quantity_received} ` +
            `| ticket: ${ticket}`
        );
      });
      console.log();

      if (!DRY_RUN) {
        const ids = simpleClones.map((r) => r.id);
        const [, meta] = await sequelize.query(
          `UPDATE inspection_acceptance_report
           SET record_type = 'issuance_clone'
           WHERE id IN (${ids.join(',')})`
        );
        const affected = meta?.affectedRows ?? meta?.rowCount ?? ids.length;
        console.log(`   ⚡ Updated ${affected} simple clone(s) to 'issuance_clone'.\n`);
      } else {
        console.log(`   🔍 DRY RUN — would update ${simpleClones.length} row(s).\n`);
      }
    }

    // ──────────────────────────────────────────────────────────────────────
    // PHASE 3: Edge case detection — duplicates WITHOUT ticket IDs
    //
    // These are records sharing purchase_order_item_id with others, NOT
    // the min ID, but also don't have par_id/ics_id/ris_id set.
    // Could be partial delivery records (legitimate originals) or clones
    // from an unusual path. Shown for manual review only.
    // ──────────────────────────────────────────────────────────────────────
    console.log('─'.repeat(70));
    console.log('PHASE 3: Edge cases — duplicates without ticket IDs (manual review)');
    console.log('─'.repeat(70));

    const edgeCases = await sequelize.query(
      `SELECT iar.id, iar.iar_id, iar.purchase_order_item_id,
              iar.actual_quantity_received, iar.par_id, iar.ics_id, iar.ris_id,
              iar.record_type, iar.split_from_item_id, iar.split_index,
              grp.min_id AS original_id, grp.cnt AS group_count
       FROM inspection_acceptance_report iar
       INNER JOIN (
         SELECT purchase_order_item_id, MIN(id) AS min_id, COUNT(*) AS cnt
         FROM inspection_acceptance_report
         WHERE is_deleted = 0
         GROUP BY purchase_order_item_id
         HAVING cnt > 1
       ) grp ON iar.purchase_order_item_id = grp.purchase_order_item_id
       WHERE iar.id != grp.min_id
         AND iar.record_type = 'iar_original'
         AND iar.is_deleted = 0
         AND iar.split_from_item_id IS NULL
         AND iar.split_index IS NULL
         AND iar.par_id IS NULL
         AND iar.ics_id IS NULL
         AND iar.ris_id IS NULL
       ORDER BY iar.purchase_order_item_id, iar.id`,
      { type: QueryTypes.SELECT }
    );

    if (edgeCases.length === 0) {
      console.log('   ✅ No edge cases found.\n');
    } else {
      console.log(`   ⚠️  Found ${edgeCases.length} ambiguous record(s) — NOT auto-updated:\n`);
      console.log(
        '   These share a purchase_order_item_id with other records but have no ticket ID.'
      );
      console.log(
        '   They could be partial delivery originals OR unusual clones. Review manually:\n'
      );
      edgeCases.forEach((row) => {
        console.log(
          `   ID ${row.id} | iarId: ${row.iar_id} | poItemId: ${row.purchase_order_item_id} ` +
            `| originalId: ${row.original_id} | qty: ${row.actual_quantity_received} ` +
            `| groupSize: ${row.group_count}`
        );
      });
      console.log();
    }

    // ──────────────────────────────────────────────────────────────────────
    // FINAL: Show updated state
    // ──────────────────────────────────────────────────────────────────────
    if (!DRY_RUN) {
      console.log('─'.repeat(70));
      console.log('FINAL STATE');
      console.log('─'.repeat(70));
      const finalSummary = await sequelize.query(
        `SELECT record_type, COUNT(*) AS cnt
         FROM inspection_acceptance_report
         WHERE is_deleted = 0
         GROUP BY record_type`,
        { type: QueryTypes.SELECT }
      );
      finalSummary.forEach((row) => console.log(`   ${row.record_type}: ${row.cnt} rows`));
      console.log();
    }

    console.log('='.repeat(70));
    console.log(
      DRY_RUN ? '  DRY RUN COMPLETE. Run with --apply to execute changes.' : '  BACKFILL COMPLETE.'
    );
    console.log('='.repeat(70));
  } catch (err) {
    console.error('❌ Backfill failed:', err);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch {}
  }
})();
