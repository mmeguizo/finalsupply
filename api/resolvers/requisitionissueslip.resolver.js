import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import requisitionIssueSlip from "../models/inspectionacceptancereport.js";
import { Op } from "sequelize";
import { sequelize } from "../db/connectDB.js";
import { generateNewRisId, resetRisIdBatch } from "../utils/risIdGenerator.js";
import PurchaseOrderItems from "../models/purchaseorderitems.js";
const requisitionIssueSlipResolver = {
  Query: {
    requisitionIssueSlip: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const requisitionIssueSlipReportdata =
          await requisitionIssueSlip.findAll({
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
        const requisitionIssueSlipReportdata =
          await requisitionIssueSlip.findAll({
            where: {
              isDeleted: false,
              category: "requisition issue slip",
            },
            order: [["createdAt", "DESC"]],
            include: [
              { model: PurchaseOrder },
              // include PurchaseOrderItems using the alias used in your models / code
              {
                model: PurchaseOrderItems,
                as: "PurchaseOrderItem",
                required: false,
              },
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
              id: { [Op.in]: input.ids },
            },
            returning: true,
          },
        );
        // console.log({updatedItems});

        // Fetch the updated items to return them
        const items = await requisitionIssueSlip.findAll({
          where: {
            id: { [Op.in]: input.ids },
          },
          include: [PurchaseOrder],
        });

        // console.log("Updated items:", items);

        return items;
      } catch (error) {
        console.error("Error updating RIS IDs:", error);
        throw new Error(error.message || "Failed to update RIS IDs");
      }
    },

    // Split items by quantity and assign separate RIS IDs with per-split signatories
    splitAndAssignRIS: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const { itemSplits } = input;
        const allResultIds = [];

        // Reset RIS ID batch counter so sequential IDs are generated properly
        resetRisIdBatch();

        const transaction = await sequelize.transaction();

        try {
          for (const itemSplit of itemSplits) {
            const { itemId, splits } = itemSplit;

            const original = await requisitionIssueSlip.findByPk(itemId, {
              transaction,
              include: [PurchaseOrder],
            });

            if (!original) {
              throw new Error(`Item with ID ${itemId} not found`);
            }

            if (splits.length === 0) {
              throw new Error("At least one split is required per item");
            }

            // Generate a split group ID to track all pieces back to this original
            const splitGroupId = `SPL-${original.id}-${Date.now()}`;
            const originalItemId = original.id;

            // First split: update the original record
            const firstSplit = splits[0];
            const firstRisId = await generateNewRisId();

            await original.update(
              {
                actualQuantityReceived: firstSplit.quantity,
                amount:
                  firstSplit.quantity * parseFloat(original.unitCost || 0),
                risId: firstRisId,
                risReceivedFrom: firstSplit.receivedFrom,
                risReceivedFromPosition: firstSplit.receivedFromPosition || "",
                risReceivedBy: firstSplit.receivedBy,
                risReceivedByPosition: firstSplit.receivedByPosition || "",
                risDepartment: firstSplit.department || "",
                risAssignedDate: new Date(),
                splitGroupId: splitGroupId,
                splitFromItemId: originalItemId,
                splitIndex: 1,
              },
              { transaction },
            );

            allResultIds.push(original.id);

            // Additional splits: clone the original record
            for (let i = 1; i < splits.length; i++) {
              const split = splits[i];
              const newRisId = await generateNewRisId();
              const originalData = original.toJSON();

              const clonedRecord = await requisitionIssueSlip.create(
                {
                  iarId: originalData.iarId,
                  icsId: originalData.icsId,
                  parId: originalData.parId,
                  purchaseOrderId: originalData.purchaseOrderId,
                  purchaseOrderItemId: originalData.purchaseOrderItemId,
                  iarStatus: originalData.iarStatus,
                  description: originalData.description,
                  unit: originalData.unit,
                  quantity: originalData.quantity,
                  unitCost: originalData.unitCost,
                  category: originalData.category,
                  tag: originalData.tag,
                  isDeleted: 0,
                  createdBy: originalData.createdBy,
                  updatedBy: originalData.updatedBy,
                  inventoryNumber: originalData.inventoryNumber,
                  itemName: originalData.itemName,
                  invoice: originalData.invoice,
                  invoiceDate: originalData.invoiceDate,
                  income: originalData.income,
                  mds: originalData.mds,
                  details: originalData.details,
                  actualQuantityReceived: split.quantity,
                  amount:
                    split.quantity * parseFloat(originalData.unitCost || 0),
                  risId: newRisId,
                  risReceivedFrom: split.receivedFrom,
                  risReceivedFromPosition: split.receivedFromPosition || "",
                  risReceivedBy: split.receivedBy,
                  risReceivedByPosition: split.receivedByPosition || "",
                  risDepartment: split.department || "",
                  risAssignedDate: new Date(),
                  splitGroupId: splitGroupId,
                  splitFromItemId: originalItemId,
                  splitIndex: i + 1,
                },
                { transaction },
              );

              allResultIds.push(clonedRecord.id);
            }
          }

          await transaction.commit();

          const resultItems = await requisitionIssueSlip.findAll({
            where: { id: { [Op.in]: allResultIds } },
            include: [PurchaseOrder],
          });

          return resultItems;
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in splitAndAssignRIS:", error);
        throw new Error(error.message || "Failed to split and assign RIS");
      }
    },

    // Create a single RIS assignment (saves immediately, clones from source)
    createSingleRISAssignment: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const {
          sourceItemId,
          quantity,
          department,
          receivedFrom,
          receivedFromPosition,
          receivedBy,
          receivedByPosition,
        } = input;

        // Fetch the source item
        const sourceItem = await requisitionIssueSlip.findByPk(sourceItemId, {
          include: [PurchaseOrder],
        });

        if (!sourceItem) {
          throw new Error(`Source item with ID ${sourceItemId} not found`);
        }

        const currentReceived = sourceItem.actualQuantityReceived || 0;
        if (quantity > currentReceived) {
          throw new Error(
            `Quantity (${quantity}) exceeds available (${currentReceived})`,
          );
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
              risReceivedFromPosition: receivedFromPosition || "",
              risReceivedBy: receivedBy,
              risReceivedByPosition: receivedByPosition || "",
              risDepartment: department || "",
              risAssignedDate: new Date(),
            },
            { transaction },
          );

          // Update source item: reduce actualQuantityReceived
          const newSourceQty = currentReceived - quantity;
          await sourceItem.update(
            { actualQuantityReceived: newSourceQty },
            { transaction },
          );

          await transaction.commit();

          // Fetch updated items with associations
          const updatedNewItem = await requisitionIssueSlip.findByPk(
            newItem.id,
            {
              include: [PurchaseOrder],
            },
          );
          const updatedSourceItem = await requisitionIssueSlip.findByPk(
            sourceItemId,
            {
              include: [PurchaseOrder],
            },
          );

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

    // Create a multi-item RIS assignment (multiple items share one RIS ID per end user)
    createMultiItemRISAssignment: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const {
          items,
          department,
          receivedFrom,
          receivedFromPosition,
          receivedBy,
          receivedByPosition,
        } = input;

        if (!items || items.length === 0) {
          throw new Error("At least one item is required");
        }

        // Generate a single RIS ID for all items in this assignment
        const sharedRisId = await generateNewRisId();

        const transaction = await sequelize.transaction();
        const newItemIds = [];
        const sourceItemIds = [];

        try {
          for (const entry of items) {
            const { sourceItemId, quantity } = entry;

            const sourceItem = await requisitionIssueSlip.findByPk(
              sourceItemId,
              {
                include: [PurchaseOrder],
                transaction,
              },
            );

            if (!sourceItem) {
              throw new Error(`Source item with ID ${sourceItemId} not found`);
            }

            const currentReceived = sourceItem.actualQuantityReceived || 0;
            if (quantity > currentReceived) {
              throw new Error(
                `Quantity (${quantity}) exceeds available (${currentReceived}) for item "${sourceItem.description}"`,
              );
            }
            if (quantity <= 0) {
              throw new Error("Quantity must be greater than 0");
            }

            const sourceData = sourceItem.toJSON();

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
                actualQuantityReceived: quantity,
                amount: quantity * parseFloat(sourceData.unitCost || 0),
                risId: sharedRisId,
                risReceivedFrom: receivedFrom,
                risReceivedFromPosition: receivedFromPosition || "",
                risReceivedBy: receivedBy,
                risReceivedByPosition: receivedByPosition || "",
                risDepartment: department || "",
                risAssignedDate: new Date(),
              },
              { transaction },
            );

            newItemIds.push(newItem.id);

            const newSourceQty = currentReceived - quantity;
            await sourceItem.update(
              { actualQuantityReceived: newSourceQty },
              { transaction },
            );

            sourceItemIds.push(sourceItemId);
          }

          await transaction.commit();

          const newItems = await requisitionIssueSlip.findAll({
            where: { id: { [Op.in]: newItemIds } },
            include: [PurchaseOrder],
          });
          const sourceItems = await requisitionIssueSlip.findAll({
            where: { id: { [Op.in]: sourceItemIds } },
            include: [PurchaseOrder],
          });

          return {
            newItems,
            sourceItems,
            generatedRisId: sharedRisId,
          };
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in createMultiItemRISAssignment:", error);
        throw new Error(
          error.message || "Failed to create multi-item RIS assignment",
        );
      }
    },

    // Add an item to an existing RIS ID
    addItemToExistingRIS: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const { sourceItemId, quantity, existingRisId } = input;

        if (!existingRisId) {
          throw new Error("Existing RIS ID is required");
        }

        const existingRISItem = await requisitionIssueSlip.findOne({
          where: { risId: existingRisId, isDeleted: false },
        });

        if (!existingRISItem) {
          throw new Error(
            `No existing item found with RIS ID "${existingRisId}"`,
          );
        }

        const sourceItem = await requisitionIssueSlip.findByPk(sourceItemId, {
          include: [PurchaseOrder],
        });

        if (!sourceItem) {
          throw new Error(`Source item with ID ${sourceItemId} not found`);
        }

        const currentReceived = sourceItem.actualQuantityReceived || 0;
        if (quantity > currentReceived) {
          throw new Error(
            `Quantity (${quantity}) exceeds available (${currentReceived})`,
          );
        }
        if (quantity <= 0) {
          throw new Error("Quantity must be greater than 0");
        }

        const sourceData = sourceItem.toJSON();
        const transaction = await sequelize.transaction();

        try {
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
              actualQuantityReceived: quantity,
              amount: quantity * parseFloat(sourceData.unitCost || 0),
              risId: existingRisId,
              risReceivedFrom: existingRISItem.risReceivedFrom,
              risReceivedFromPosition: existingRISItem.risReceivedFromPosition,
              risReceivedBy: existingRISItem.risReceivedBy,
              risReceivedByPosition: existingRISItem.risReceivedByPosition,
              risDepartment: existingRISItem.risDepartment,
              risAssignedDate: new Date(),
            },
            { transaction },
          );

          const newSourceQty = currentReceived - quantity;
          await sourceItem.update(
            { actualQuantityReceived: newSourceQty },
            { transaction },
          );

          await transaction.commit();

          const updatedNewItem = await requisitionIssueSlip.findByPk(
            newItem.id,
            {
              include: [PurchaseOrder],
            },
          );
          const updatedSourceItem = await requisitionIssueSlip.findByPk(
            sourceItemId,
            {
              include: [PurchaseOrder],
            },
          );

          return {
            newItem: updatedNewItem,
            sourceItem: updatedSourceItem,
            risId: existingRisId,
          };
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in addItemToExistingRIS:", error);
        throw new Error(error.message || "Failed to add item to existing RIS");
      }
    },

    // Update an existing RIS assignment
    updateRISAssignment: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const {
          itemId,
          quantity,
          department,
          receivedFrom,
          receivedFromPosition,
          receivedBy,
          receivedByPosition,
        } = input;

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
        if (receivedFrom !== undefined)
          updateData.risReceivedFrom = receivedFrom;
        if (receivedFromPosition !== undefined)
          updateData.risReceivedFromPosition = receivedFromPosition;
        if (receivedBy !== undefined) updateData.risReceivedBy = receivedBy;
        if (receivedByPosition !== undefined)
          updateData.risReceivedByPosition = receivedByPosition;

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
  },
};

export default requisitionIssueSlipResolver;
