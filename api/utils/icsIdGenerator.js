import inspectionAcceptanceReport from '../models/inspectionacceptancereport.js';
import { Op, Sequelize } from 'sequelize';

// Assuming you have a sequelize instance exported from connectDB.js for standalone testing
// import { sequelize } from '../db/connectDB.js';

/**
 * Generates a new Inventory Custodian Slip (ICS) ID based on item tag.
 * Format: PREFIX-YYYY-MM-NNNN
 * - PREFIX: SPHV for 'high' tag, SPLV for 'low' tag.
 * - YYYY: Current year.
 * - MM: Current month (01-12).
 * - NNNN: 4-digit series number, resetting annually for each tag type.
 * @param {string} tag - The tag of the item ('low' or 'high').
 * @returns {Promise<string>} A promise that resolves to the new ICS ID.
 */
export async function generateNewIcsId(tag) {
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');

  let prefix;
  if (tag === 'high') {
    prefix = 'SPHV';
  } else if (tag === 'low') {
    prefix = 'SPLV';
  } else {
    throw new Error("Invalid tag provided. Must be 'low' or 'high'.");
  }

  // The search prefix should only contain the year for an annual series.
  const searchPrefix = `${prefix}-${year}-`;

  // Find the latest ICS entry for the current year and specific tag type.
  const latestIcs = await inspectionAcceptanceReport.findOne({
    where: {
      icsId: {
        [Op.like]: `${searchPrefix}%`,
      },
      // Ensure we are only looking at records from the current year.
      createdAt: {
        [Op.gte]: new Date(`${year}-01-01T00:00:00.000Z`),
        [Op.lt]: new Date(`${parseInt(year, 10) + 1}-01-01T00:00:00.000Z`),
      },
      tag: tag, // Filter by the specific tag ('low' or 'high')
    },
    order: [
      // Order by the numeric part of the ID (NNNN) to get the highest sequence.
      [Sequelize.literal("CAST(SUBSTRING_INDEX(icsId, '-', -1) AS UNSIGNED)"), 'DESC'],
    ],
    attributes: ['icsId'],
  });

  let newSequence = 1;
  if (latestIcs && latestIcs.icsId) {
    const parts = latestIcs.icsId.split('-');
    // Expected parts: ["PREFIX", "YYYY", "MM", "NNNN"]
    if (parts.length === 4) {
      const lastSequence = parseInt(parts[3], 10); // Extract NNNN part
      if (!isNaN(lastSequence)) {
        newSequence = lastSequence + 1;
      }
    }
  }

  const sequenceStr = newSequence.toString().padStart(4, '0');
  // The final ID includes the month, even though the series is annual.
  return `${prefix}-${year}-${month}-${sequenceStr}`;
}

// --- For testing purposes (uncomment to run directly with Node.js) ---
// async function testIcsIdGenerator() {
//   try {
//     console.log("Attempting to generate ICS IDs...");
//     const highValueId = await generateNewIcsId('high');
//     console.log("Generated High Value ICS ID:", highValueId);
//
//     const lowValueId = await generateNewIcsId('low');
//     console.log("Generated Low Value ICS ID:", lowValueId);
//
//     // Example of invalid tag (will throw an error)
//     // await generateNewIcsId('medium');
//
//   } catch (error) {
//     console.error("Error during ICS ID generation test:", error.message);
//   } finally {
//     // If you imported sequelize, close the connection here
//     // if (sequelize) {
//     //   await sequelize.close();
//     //   console.log("Database connection closed.");
//     // }
//   }
// }
//
// // Call the test function
// testIcsIdGenerator();