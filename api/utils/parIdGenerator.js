import inspectionAcceptanceReport from "../models/inspectionacceptancereport.js";
import { Op, Sequelize } from "sequelize";

// Track the last generated PAR ID within the same batch/request to avoid duplicates
let lastGeneratedParSequence = 0;
let lastGeneratedParYear = null;

// Call this at the start of each new request/transaction to reset batch tracking
export function resetParIdBatch() {
  lastGeneratedParSequence = 0;
  lastGeneratedParYear = null;
}

export async function generateNewParId() {
  const year = new Date().getFullYear();
  const yearPrefix = year.toString().slice(-2) + "-";
  console.log(yearPrefix);

  // Reset tracking if year changed
  if (lastGeneratedParYear !== year) {
    lastGeneratedParSequence = 0;
    lastGeneratedParYear = year;
  }

  const lastestPar = await inspectionAcceptanceReport.findOne({
    where: {
      parId: {
        [Op.like]: `${yearPrefix}%`,
      },
    },
    order: [
      [Sequelize.literal("CAST(REPLACE(SUBSTRING_INDEX(parId, '-', -1), SUBSTRING(SUBSTRING_INDEX(parId, '-', -1), -1), '') AS UNSIGNED)"), 'DESC'],
    ],
    attributes: ["parId"],
  });

  let nextSeriesNumber = 1;
  if (lastestPar && lastestPar.parId) {
    const parts = lastestPar.parId.split("-");

    if (parts.length === 2) {
      // Remove any suffix like 'B', 'T', 'A', 'F' etc.
      const numericPart = parts[1].replace(/[A-Za-z]/g, '');
      const lastSequence = parseInt(numericPart, 10);
      if (!isNaN(lastSequence)) {
        nextSeriesNumber = lastSequence + 1;
      }
    }
  }

  // Also check against the last generated sequence in this batch to avoid duplicates
  if (lastGeneratedParSequence >= nextSeriesNumber) {
    nextSeriesNumber = lastGeneratedParSequence + 1;
  }

  // Track this generated sequence
  lastGeneratedParSequence = nextSeriesNumber;

  const formattedSeriesNumber = nextSeriesNumber.toString().padStart(3, "0");
  return `${yearPrefix}${formattedSeriesNumber}`;
}
