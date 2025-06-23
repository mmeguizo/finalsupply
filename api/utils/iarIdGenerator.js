import inspectionAcceptanceReport from "../models/inspectionacceptancereport.js";
import { Op, Sequelize } from 'sequelize'; // Import Sequelize for literal

/**
 * Generates a new IAR ID in the format "MMDDYY-XXX-CC".
 * MMDDYY: Month, Day, Year (last two digits) of generation.
 * XXX: Sequential series number for the current year and campus (e.g., 001, 002).
 * CC: Campus code based on user's location.
 *
 * @param {string} userLocation The location of the user (e.g., 'Talisay', 'Fortune Town').
 * @returns {Promise<string>} The newly generated IAR ID.
 */
export async function generateNewIarId(userLocation) {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2); // Get last two digits of the year
  const currentYearFull = now.getFullYear();

  let campusCode = '';
  switch (userLocation) {
    case 'Talisay':
      campusCode = 'TI';
      break;
    case 'Fortune Town':
      campusCode = 'FT';
      break;
    case 'Binalbagan':
      campusCode = 'BI';
      break;
    case 'Alijis':
      campusCode = 'AI';
      break;
    default:
      // Fallback for unknown locations, or throw an error if strict
      console.warn(`Unknown user location: ${userLocation}. Using default campus code 'XX'.`);
      campusCode = 'XX';
  }

  // Find the latest IAR for the current year and campus code
  const latestIarEntry = await inspectionAcceptanceReport.findOne({
    where: {
      createdAt: {
        [Op.gte]: new Date(`${currentYearFull}-01-01T00:00:00.000Z`),
        [Op.lt]: new Date(`${currentYearFull + 1}-01-01T00:00:00.000Z`)
      },
      iarId: {
        [Op.like]: `%-${campusCode}` // Matches any iarId ending with -[campusCode]
      }
    }, // Order by the numeric part of the IAR series number in descending order
    order: [
      [Sequelize.literal("CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(iarId, '-', 2), '-', -1) AS UNSIGNED)"), 'DESC'],
      ['createdAt', 'DESC'] // Secondary sort by creation date in case series numbers are the same (unlikely but good for consistency)
    ]
  });

  let nextSeriesNumber = 1;
  if (latestIarEntry && latestIarEntry.iarId) {
    const parts = latestIarEntry.iarId.split('-');
    if (parts.length === 3) {
      const seriesPart = parts[1]; // This is the 'XXX' part
      const lastSeriesNumber = parseInt(seriesPart, 10);
      if (!isNaN(lastSeriesNumber)) {
        nextSeriesNumber = lastSeriesNumber + 1;
      }
    }
  }

  const formattedSeriesNumber = nextSeriesNumber.toString().padStart(3, '0');

  return `${month}${day}${year}-${formattedSeriesNumber}-${campusCode}`;
}