import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import inspectionAcceptanceReportResolver from "../models/inspectionacceptancereport.js";
import { customAlphabet } from 'nanoid'
import { Op } from 'sequelize'
const nanoid = customAlphabet('1234567890meguizomarkoliver', 10)
const propertyAcknowledgmentReportResolver = {
  Query: {
    propertyAcknowledgmentReport: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const propertyAcknowledgmentReportdata = await inspectionAcceptanceReportResolver.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrder],
        });

        if (!propertyAcknowledgmentReportdata) {
          throw new Error("Purchase order not found");
        }
        return propertyAcknowledgmentReportdata;
      } catch (error) {
        console.error("Error fetching purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    propertyAcknowledgmentReportForView: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const propertyAcknowledgmentReportdata = await inspectionAcceptanceReportResolver.findAll({
          where: {
            isDeleted: false,
            category: "property acknowledgement reciept"
          },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrder],
        });

        if (!propertyAcknowledgmentReportdata) {
          throw new Error("Purchase order not found");
        }
        return propertyAcknowledgmentReportdata;
      } catch (error) {
        console.error("Error fetching purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },

  Mutation: {
    updatePARInventoryIDs: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        
        // Generate a single batch ICS ID for all items
        const batchParId = nanoid();
        console.log("Updating items with IDs:", input.ids);
        console.log("Generated batch ICS ID:", batchParId);
        
        // Find all items by their IDs and update them with the same ICS ID
        const updatedItems = await inspectionAcceptanceReportResolver.update(
          { parId: batchParId },
          { 
            where: { 
              id: { [Op.in]: input.ids } 
            },
            returning: true
          }
        );
        console.log({updatedItems});
        
        // Fetch the updated items to return them
        const items = await inspectionAcceptanceReportResolver.findAll({
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

export default propertyAcknowledgmentReportResolver;
