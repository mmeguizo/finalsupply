import inspectionAcceptanceReport from '../models/inspectionacceptancereport.js';
import { Op } from 'sequelize';

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

  // Find the latest RIS entry for the current year to determine the next sequence number.
  const latestRis = await inspectionAcceptanceReport.findOne({
    where: {
      risId: {
        [Op.like]: `${yearPrefix}%`,
      },
    },
    order: [['createdAt', 'DESC']], // Assuming updatedAt reflects the order of ID generation.
    attributes: ['risId'],
  });

  let newSequence = 1;
  if (latestRis && latestRis.risId) {
    const parts = latestRis.risId.split('-');
    if (parts.length === 3) {
      const lastSequence = parseInt(parts[2], 10);
      if (!isNaN(lastSequence)) {
        newSequence = lastSequence + 1;
      }
    }
  }

  const sequenceStr = newSequence.toString().padStart(4, '0');
  return `${year}-${month}-${sequenceStr}`;
}