import inspectionAcceptanceReport from "../models/inspectionacceptancereport.js";
import { Op } from "sequelize";

export async function generateNewParId() {
  const year = new Date().getFullYear();
  const yearPrefix = year.toString().slice(-2) + "-";
  console.log(yearPrefix);

  const lastestPar = await inspectionAcceptanceReport.findOne({
    where: {
      parId: {
        [Op.like]: `${yearPrefix}%`,
      },
    },
    order: [["createdAt", "DESC"]],
    attributes: ["parId"],
  });

  let nextSeriesNumber = 1;
  if (lastestPar && lastestPar.parId) {
    const parts = lastestPar.parId.split("-");

    if (parts.length === 2) {
      const lastSequence = parseInt(parts[1], 10);
      nextSeriesNumber = lastSequence + 1;
    }
  }

  const formattedSeriesNumber = nextSeriesNumber.toString().padStart(3, "0");
    return `${yearPrefix}${formattedSeriesNumber}`;
}
