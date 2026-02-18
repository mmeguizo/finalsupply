import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import requisitionIssueSlip from "../models/inspectionacceptancereport.js";
import { Op } from 'sequelize'
import { sequelize } from '../db/connectDB.js'
import { generateNewRisId } from "../utils/risIdGenerator.js";
import PurchaseOrderItems from "../models/purchaseorderitems.js";
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
          include: [
             { model: PurchaseOrder },
            // include PurchaseOrderItems using the alias used in your models / code
            { model: PurchaseOrderItems, as: "PurchaseOrderItem", required: false }
          ],
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
        // Generate a single batch RIS ID for all items
        const batchRisId = await generateNewRisId();
        console.log("Updating items with IDs:", input.ids);
        console.log("Generated batch RIS ID:", batchRisId);
        
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
        // console.log({updatedItems});
        
        // Fetch the updated items to return them
        const items = await requisitionIssueSlip.findAll({
          where: { 
            id: { [Op.in]: input.ids } 
          },
          include: [PurchaseOrder]
        });

        // console.log("Updated items:", items);
        
        return items;
      } catch (error) {
        console.error("Error updating RIS IDs:", error);
        throw new Error(error.message || "Failed to update RIS IDs");
      }
    },

    // Create a single RIS assignment (saves immediately, clones from source)
    createSingleRISAssignment: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const { sourceItemId, quantity, department, receivedFrom, receivedFromPosition, receivedBy, receivedByPosition } = input;

        // Fetch the source item
        const sourceItem = await requisitionIssueSlip.findByPk(sourceItemId, {
          include: [PurchaseOrder],
        });

        if (!sourceItem) {
          throw new Error(`Source item with ID ${sourceItemId} not found`);
        }

        const currentReceived = sourceItem.actualQuantityReceived || 0;
        if (quantity > currentReceived) {
          throw new Error(`Quantity (${quantity}) exceeds available (${currentReceived})`);
        }
        if (quantity <= 0) {
          throw new Error("Quantity must be greater than 0");
        }

        // Generate new RIS ID
        const newRisId = await generateNewRisId();
        const sourceData = sourceItem.toJSON();

        // Use transaction for atomicity
        const transaction = await sequelize.transaction();

        try {
          // Create new record with the assigned quantity and RIS ID
          const newItem = await requisitionIssueSlip.create(
            {
              iarId: sourceData.iarId,
              icsId: sourceData.icsId,
              parId: sourceData.parId,
              purchaseOrderId: sourceData.purchaseOrderId,
              purchaseOrderItemId: sourceData.purchaseOrderItemId,
              iarStatus: sourceData.iarStatus,
              description: sourceData.description,
              unit: sourceData.unit,
              quantity: sourceData.quantity,
              unitCost: sourceData.unitCost,
              category: sourceData.category,
              tag: sourceData.tag,
              isDeleted: 0,
              createdBy: sourceData.createdBy,
              updatedBy: sourceData.updatedBy,
              inventoryNumber: sourceData.inventoryNumber,
              itemName: sourceData.itemName,
              invoice: sourceData.invoice,
              invoiceDate: sourceData.invoiceDate,
              income: sourceData.income,
              mds: sourceData.mds,
              details: sourceData.details,
              // Assignment-specific fields
              actualQuantityReceived: quantity,
              amount: quantity * parseFloat(sourceData.unitCost || 0),
              risId: newRisId,
              risReceivedFrom: receivedFrom,
              risReceivedFromPosition: receivedFromPosition || '',
              risReceivedBy: receivedBy,
              risReceivedByPosition: receivedByPosition || '',
              risDepartment: department || '',
              risAssignedDate: new Date(),
            },
            { transaction }
          );

          // Update source item: reduce actualQuantityReceived
          const newSourceQty = currentReceived - quantity;
          await sourceItem.update(
            { actualQuantityReceived: newSourceQty },
            { transaction }
          );

          await transaction.commit();

          // Fetch updated items with associations
          const updatedNewItem = await requisitionIssueSlip.findByPk(newItem.id, {
            include: [PurchaseOrder],
          });
          const updatedSourceItem = await requisitionIssueSlip.findByPk(sourceItemId, {
            include: [PurchaseOrder],
          });

          return {
            newItem: updatedNewItem,
            sourceItem: updatedSourceItem,
            generatedRisId: newRisId,
          };
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in createSingleRISAssignment:", error);
        throw new Error(error.message || "Failed to create RIS assignment");
      }
    },

    // Update an existing RIS assignment
    updateRISAssignment: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const { itemId, quantity, department, receivedFrom, receivedFromPosition, receivedBy, receivedByPosition } = input;

        const item = await requisitionIssueSlip.findByPk(itemId);
        if (!item) {
          throw new Error(`Item with ID ${itemId} not found`);
        }

        // Build update object with only provided fields
        const updateData = {};
        if (quantity !== undefined && quantity !== null) {
          updateData.actualQuantityReceived = quantity;
          updateData.amount = quantity * parseFloat(item.unitCost || 0);
        }
        if (department !== undefined) updateData.risDepartment = department;
        if (receivedFrom !== undefined) updateData.risReceivedFrom = receivedFrom;
        if (receivedFromPosition !== undefined) updateData.risReceivedFromPosition = receivedFromPosition;
        if (receivedBy !== undefined) updateData.risReceivedBy = receivedBy;
        if (receivedByPosition !== undefined) updateData.risReceivedByPosition = receivedByPosition;

        await item.update(updateData);

        // Return updated item with associations
        const updatedItem = await requisitionIssueSlip.findByPk(itemId, {
          include: [PurchaseOrder],
        });

        return updatedItem;
      } catch (error) {
        console.error("Error in updateRISAssignment:", error);
        throw new Error(error.message || "Failed to update RIS assignment");
      }
    },
   
  }
};

export default requisitionIssueSlipResolver;
