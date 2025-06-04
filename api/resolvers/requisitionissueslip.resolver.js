import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import requisitionIssueSlip from "../models/inspectionacceptancereport.js";
import { customAlphabet } from 'nanoid'
import { Op } from 'sequelize'
const nanoid = customAlphabet('1234567890meguizomarkoliver', 10)
const requisitionIssueSlipResolver = {
  Query: {
    requisitionIssueSlip: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const requisitionIssueSlipReportdata = await requisitionIssueSlip.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrder],
        });

        if (!requisitionIssueSlipReportdata) {
          throw new Error("Purchase order not found");
        }
        return requisitionIssueSlipReportdata;
      } catch (error) {
        console.error("Error fetching purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    requisitionIssueSlipForView: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const requisitionIssueSlipReportdata = await requisitionIssueSlip.findAll({
          where: {
            isDeleted: false,
            category: "requisition issue slip"
          },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrder],
        });

        if (!requisitionIssueSlipReportdata) {
          throw new Error("Purchase order not found");
        }
        return requisitionIssueSlipReportdata;
      } catch (error) {
        console.error("Error fetching purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },

  Mutation: {
    updateRISInventoryIDs: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Generate a single batch ICS ID for all items
        const batchRisId = nanoid();
        console.log("Updating items with IDs:", input.ids);
        console.log("Generated batch ICS ID:", batchRisId);
        
        // Find all items by their IDs and update them with the same ICS ID
        const updatedItems = await requisitionIssueSlip.update(
          { risId: batchRisId },
          { 
            where: { 
              id: { [Op.in]: input.ids } 
            },
            returning: true
          }
        );
        console.log({updatedItems});
        
        // Fetch the updated items to return them
        const items = await requisitionIssueSlip.findAll({
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
    },
   
  }
};

export default requisitionIssueSlipResolver;
