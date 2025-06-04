import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Import the Sequelize models
import PurchaseOrderItemsHistory from "../models/purchaseorderitemshistory.js"; // Import history model
import inspectionAcceptanceReport from "../models/inspectionacceptancereport.js";
import { customAlphabet } from 'nanoid'
import { omitId } from '../utils/helper.js';
import { Op, Sequelize } from 'sequelize'
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
    iarForReports:  async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
    
        const inspectionAcceptanceReportdata = await inspectionAcceptanceReport.findAll({
          // Explicitly select only the attributes required by the IARonly GraphQL type
          // Using snake_case for database columns
          attributes: ['id', 'created_at', 'iar_id'],
          where: {
            isDeleted: false,
          },
          order: [
            ['created_at', 'DESC'], // Order by created_at (snake_case)
            ['id', 'DESC']          // Secondary sort for consistency
          ],
          // No need to include PurchaseOrder for the IARonly type
        });
    
        if (!inspectionAcceptanceReportdata || inspectionAcceptanceReportdata.length === 0) {
          console.log("No data fetched from database, returning empty array.");
          return [];
        }
    
        const uniqueIARs = new Map();
    
        inspectionAcceptanceReportdata.forEach(item => {
          // Access iar_id directly from dataValues
          const iarIdValue = item.dataValues.iar_id;
    
          if (iarIdValue) {
            if (!uniqueIARs.has(iarIdValue)) {
              uniqueIARs.set(iarIdValue, item);
            }
          } else {
            // Log items being skipped if iar_id is falsy
            // console.log(`Skipping item ID: ${item.id} because iar_id is falsy: '${iarIdValue}'`);
          }
        });
        // console.log("--- UNIQUE IARS MAP CONTENT (before final map) ---");
        // console.log(`Number of unique items found: ${uniqueIARs.size}`);
        // console.log("--- END UNIQUE IARS MAP CONTENT ---");
        // Convert the Map values to an array of plain objects, accessing
        // created_at and iar_id from dataValues
        return Array.from(uniqueIARs.values()).map(item => ({
          id: item.id,
          // CRITICAL FIX: Access created_at directly from dataValues
          createdAt: item.dataValues.created_at,
          // CRITICAL FIX: Access iar_id directly from dataValues
          iarId: item.dataValues.iar_id
        }));
    
      } catch (error) {
        console.error("Error fetching unique inspection acceptance report data: ", error);
        throw new Error("Failed to retrieve unique inspection acceptance reports.");
      }
    },
    getIARItemsByIarId : async (_, { iarId }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
    
        if (!iarId) {
            throw new Error("IAR ID is required."); // Ensure an iarId is provided
        }
    
        const iarItems = await inspectionAcceptanceReport.findAll({
          where: {
            iar_id: iarId, // Filter by the specific iar_id passed as an argument
            isDeleted: false, // Ensure you only get active records
          },
          order: [
            ['created_at', 'ASC'], // Order by creation date, maybe ascending for consistency
            ['id', 'ASC']          // Secondary sort
          ],
          include: [
            {
              model: PurchaseOrder, // Include the associated PurchaseOrder details
            }
          ],
          // If you don't want all fields for each item, you can specify them here:
          // attributes: ['id', 'itemName', 'description', 'quantity', 'actualQuantityReceived', 'category', 'createdAt'],
        });
    
        if (!iarItems || iarItems.length === 0) {
          // You might want to throw an error if no items are found for the IAR ID,
          // or simply return an empty array based on your frontend's expectation.
          // Returning an empty array usually handles "not found" gracefully.
          return [];
        }
        console.log("--- IAR ITEMS ---");
        console.log(iarItems);
        console.log("--- END IAR ITEMS ---");
        // Sequelize automatically handles mapping snake_case database columns to camelCase
        // JavaScript properties in the returned model instances (e.g., iar_id becomes iarId,
        // created_at becomes createdAt), thanks to `underscored: true` in your model.
        // The data grid is expecting the full item details (ItemWithPurchaseOrder),
        // so you don't need to manually map to a simpler object unless specific fields are excluded.
        return iarItems;
    
      } catch (error) {
        console.error(`Error fetching items for IAR ID ${iarId}: `, error);
        throw new Error(`Failed to retrieve items for IAR ID ${iarId}.`);
      }
    }
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
