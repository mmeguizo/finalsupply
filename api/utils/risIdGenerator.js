import inspectionAcceptanceReport from '../models/inspectionacceptancereport.js';
import { Op, Sequelize } from 'sequelize';

// Track the last generated RIS ID within the same batch/request to avoid duplicates
let lastGeneratedRisSequence = 0;
let lastGeneratedRisYear = null;

// Call this at the start of each new request/transaction to reset batch tracking
export function resetRisIdBatch() {
  lastGeneratedRisSequence = 0;
  lastGeneratedRisYear = null;
}

/**
 * Generates a new Requisition and Issue Slip (RIS) ID in the format YYYY-MM-NNNN.
 * - YYYY is the current year.
 * - MM is the current month.
 * - NNNN is a 4-digit sequence number that resets annually.
 * @returns {Promise<string>} A promise that resolves to the new RIS ID.
 */
export async function generateNewRisId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');

  const yearPrefix = `${year}-`;

  // Reset tracking if year changed
  if (lastGeneratedRisYear !== year) {
    lastGeneratedRisSequence = 0;
    lastGeneratedRisYear = year;
  }

  // Find the latest RIS entry for the current year to determine the next sequence number.
  const latestRis = await inspectionAcceptanceReport.findOne({
    where: {
      risId: {
        [Op.like]: `${yearPrefix}%`,
      },
    },
    order: [
      [Sequelize.literal("CAST(REPLACE(SUBSTRING_INDEX(risId, '-', -1), SUBSTRING(SUBSTRING_INDEX(risId, '-', -1), -1), '') AS UNSIGNED)"), 'DESC'],
    ],
    attributes: ['risId'],
  });

  let newSequence = 1;
  if (latestRis && latestRis.risId) {
    const parts = latestRis.risId.split('-');
    if (parts.length === 3) {
      // Remove any suffix like 'B', 'T', 'A', 'F' etc.
      const numericPart = parts[2].replace(/[A-Za-z]/g, '');
      const lastSequence = parseInt(numericPart, 10);
      if (!isNaN(lastSequence)) {
        newSequence = lastSequence + 1;
      }
    }
  }

  // Also check against the last generated sequence in this batch to avoid duplicates
  if (lastGeneratedRisSequence >= newSequence) {
    newSequence = lastGeneratedRisSequence + 1;
  }

  // Track this generated sequence
  lastGeneratedRisSequence = newSequence;

  const sequenceStr = newSequence.toString().padStart(4, '0');
  return `${year}-${month}-${sequenceStr}`;
}