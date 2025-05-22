import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Import the Sequelize models
import PurchaseOrderItemsHistory from "../models/purchaseorderitemshistory.js"; // Import history model
import inspectionAcceptanceReport from "../models/inspectionacceptancereport.js";
import { customAlphabet } from 'nanoid'
import { omitId } from '../utils/helper.js';
import { Op } from 'sequelize'
const nanoid = customAlphabet('1234567890meguizomarkoliver', 10)
const inspectionAcceptanceReportResolver = {
  Query: {
    inspectionAcceptanceReport: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const inspectionAcceptanceReportdata = await inspectionAcceptanceReport.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrder],
        });

        if (!inspectionAcceptanceReportdata) {
          throw new Error("Purchase order not found");
        }
        return inspectionAcceptanceReportdata;
      } catch (error) {
        console.error("Error fetching purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    inspectionAcceptanceReportForICS: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const inspectionAcceptanceReportdata = await inspectionAcceptanceReport.findAll({
          where: {
            isDeleted: false,
            tag: {
              [Op.or]: ["high", "low"]
            }
          },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrder],
        });

        if (!inspectionAcceptanceReportdata) {
          throw new Error("Purchase order not found");
        }
        return inspectionAcceptanceReportdata;
      } catch (error) {
        console.error("Error fetching purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },

  Mutation: {
    updateICSInventoryIDs: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        
        // Generate a single batch ICS ID for all items
        const batchIcsId = nanoid();
        console.log("Updating items with IDs:", input.ids);
        console.log("Generated batch ICS ID:", batchIcsId);
        
        // Find all items by their IDs and update them with the same ICS ID
        const updatedItems = await inspectionAcceptanceReport.update(
          { icsId: batchIcsId },
          { 
            where: { 
              id: { [Op.in]: input.ids } 
            },
            returning: true
          }
        );
        console.log({updatedItems});
        
        // Fetch the updated items to return them
        const items = await inspectionAcceptanceReport.findAll({
          where: { 
            id: { [Op.in]: input.ids } 
          },
          include: [PurchaseOrder]
        });

        console.log("Updated items:", items);
        
        return items;
      } catch (error) {
        console.error("Error updating ICS IDs:", error);
        throw new Error(error.message || "Failed to update ICS IDs");
      }
    }
  }
};

export default inspectionAcceptanceReportResolver;
