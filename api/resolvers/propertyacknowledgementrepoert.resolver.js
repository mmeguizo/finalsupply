import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import inspectionAcceptanceReportResolver from "../models/inspectionacceptancereport.js";
import { customAlphabet } from "nanoid";
import { Op, Sequelize } from "sequelize";
import { sequelize } from "../db/connectDB.js";

// const nanoid = customAlphabet('1234567890meguizomarkoliver', 10)
import { generateNewParId, resetParIdBatch } from "../utils/parIdGenerator.js";
import PurchaseOrderItems from "../models/purchaseorderitems.js";
const propertyAcknowledgmentReportResolver = {
  Query: {
    propertyAcknowledgmentReport: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const propertyAcknowledgmentReportdata =
          await inspectionAcceptanceReportResolver.findAll({
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
        const propertyAcknowledgmentReportdata =
          await inspectionAcceptanceReportResolver.findAll({
            where: {
              isDeleted: false,
              category: "property acknowledgement reciept",
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

        if (!propertyAcknowledgmentReportdata) {
          throw new Error("Purchase order not found");
        }
        return propertyAcknowledgmentReportdata;
      } catch (error) {
        console.error("Error fetching purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    // Get the next available PAR ID without assigning it
    getNextParId: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const year = new Date().getFullYear();
        const yearPrefix = year.toString().slice(-2) + "-";

        const latestPar = await inspectionAcceptanceReportResolver.findOne({
          where: {
            parId: {
              [Op.like]: `${yearPrefix}%`,
            },
          },
          order: [
            [
              Sequelize.literal(
                "CAST(REPLACE(SUBSTRING_INDEX(parId, '-', -1), SUBSTRING(SUBSTRING_INDEX(parId, '-', -1), -1), '') AS UNSIGNED)",
              ),
              "DESC",
            ],
          ],
          attributes: ["parId"],
        });

        let nextSequence = 1;
        if (latestPar && latestPar.parId) {
          const parts = latestPar.parId.split("-");
          if (parts.length === 2) {
            const numericPart = parts[1].replace(/[A-Za-z]/g, "");
            const lastSequence = parseInt(numericPart, 10);
            if (!isNaN(lastSequence)) {
              nextSequence = lastSequence + 1;
            }
          }
        }

        const formattedSeriesNumber = nextSequence.toString().padStart(3, "0");
        return {
          nextId: `${yearPrefix}${formattedSeriesNumber}`,
          currentYear: year,
          nextSequence: nextSequence,
        };
      } catch (error) {
        console.error("Error getting next PAR ID:", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    // Get all existing PAR IDs for the current year
    getExistingParIds: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const year = new Date().getFullYear();
        const yearPrefix = year.toString().slice(-2) + "-";

        const items = await inspectionAcceptanceReportResolver.findAll({
          where: {
            parId: {
              [Op.like]: `${yearPrefix}%`,
            },
            isDeleted: false,
          },
          attributes: ["parId"],
          group: ["parId"],
          order: [["parId", "ASC"]],
        });

        return items.map((item) => item.parId).filter(Boolean);
      } catch (error) {
        console.error("Error getting existing PAR IDs:", error);
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
        // const batchParId = nanoid();
        const batchParId = await generateNewParId();
        // console.log("Updating items with IDs:", input.ids);
        console.log("Generated batch ICS ID:", batchParId);

        // Find all items by their IDs and update them with the same ICS ID
        const updatedItems = await inspectionAcceptanceReportResolver.update(
          { parId: batchParId },
          {
            where: {
              id: { [Op.in]: input.ids },
            },
            returning: true,
          },
        );
        // console.log({updatedItems});
        // console.log({batchParId});

        // Fetch the updated items to return them
        const items = await inspectionAcceptanceReportResolver.findAll({
          where: {
            id: { [Op.in]: input.ids },
          },
          include: [PurchaseOrder],
        });

        // console.log("Updated items:", items);

        return items;
      } catch (error) {
        console.error("Error updating ICS IDs:", error);
        throw new Error(error.message || "Failed to update ICS IDs");
      }
    },

    // New mutation for manual PAR assignment with per-item signatories
    assignPARWithSignatories: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const {
          itemIds,
          parId,
          receivedFrom,
          receivedFromPosition,
          receivedBy,
          receivedByPosition,
          department,
        } = input;

        // Determine the PAR ID to use
        let assignedParId = parId;
        if (!assignedParId) {
          // Generate a new PAR ID if not provided
          assignedParId = await generateNewParId();
        }

        console.log("Assigning PAR ID:", assignedParId, "to items:", itemIds);
        console.log("Signatories - From:", receivedFrom, "By:", receivedBy);

        // Update all items with the PAR ID and signatories
        await inspectionAcceptanceReportResolver.update(
          {
            parId: assignedParId,
            parReceivedFrom: receivedFrom,
            parReceivedFromPosition: receivedFromPosition || "",
            parReceivedBy: receivedBy,
            parReceivedByPosition: receivedByPosition || "",
            parDepartment: department || "",
            parAssignedDate: new Date(),
          },
          {
            where: {
              id: { [Op.in]: itemIds },
            },
            returning: true,
          },
        );

        // Fetch the updated items to return them
        const items = await inspectionAcceptanceReportResolver.findAll({
          where: {
            id: { [Op.in]: itemIds },
          },
          include: [PurchaseOrder],
        });

        return items;
      } catch (error) {
        console.error("Error assigning PAR with signatories:", error);
        throw new Error(error.message || "Failed to assign PAR");
      }
    },

    // Split items by received quantity and assign separate PAR IDs with per-group signatories
    splitAndAssignPAR: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const { itemSplits } = input;
        const allResultIds = [];

        // Reset PAR ID batch counter so sequential IDs are generated properly
        resetParIdBatch();

        // Use a transaction to ensure atomicity
        const transaction = await sequelize.transaction();

        try {
          for (const itemSplit of itemSplits) {
            const { itemId, splits } = itemSplit;

            // Fetch the original item
            const original = await inspectionAcceptanceReportResolver.findByPk(
              itemId,
              {
                transaction,
                include: [PurchaseOrder],
              },
            );

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
            const firstParId = await generateNewParId();

            await original.update(
              {
                actualQuantityReceived: firstSplit.quantity,
                amount:
                  firstSplit.quantity * parseFloat(original.unitCost || 0),
                parId: firstParId,
                parReceivedFrom: firstSplit.receivedFrom,
                parReceivedFromPosition: firstSplit.receivedFromPosition || "",
                parReceivedBy: firstSplit.receivedBy,
                parReceivedByPosition: firstSplit.receivedByPosition || "",
                parDepartment: firstSplit.department || "",
                parAssignedDate: new Date(),
                splitGroupId: splitGroupId,
                splitFromItemId: originalItemId,
                splitIndex: 1,
              },
              { transaction },
            );

            allResultIds.push(original.id);

            // Additional splits: clone the original record with new quantities
            for (let i = 1; i < splits.length; i++) {
              const split = splits[i];
              const newParId = await generateNewParId();

              // Get the original's raw data for cloning
              const originalData = original.toJSON();

              const clonedRecord =
                await inspectionAcceptanceReportResolver.create(
                  {
                    // Copy all original fields
                    iarId: originalData.iarId,
                    icsId: originalData.icsId,
                    risId: originalData.risId,
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
                    // Split-specific fields
                    actualQuantityReceived: split.quantity,
                    amount:
                      split.quantity * parseFloat(originalData.unitCost || 0),
                    parId: newParId,
                    parReceivedFrom: split.receivedFrom,
                    parReceivedFromPosition: split.receivedFromPosition || "",
                    parReceivedBy: split.receivedBy,
                    parReceivedByPosition: split.receivedByPosition || "",
                    parDepartment: split.department || "",
                    parAssignedDate: new Date(),
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

          // Fetch all resulting items to return
          const resultItems = await inspectionAcceptanceReportResolver.findAll({
            where: { id: { [Op.in]: allResultIds } },
            include: [PurchaseOrder],
          });

          return resultItems;
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in splitAndAssignPAR:", error);
        throw new Error(error.message || "Failed to split and assign PAR");
      }
    },

    // Create a single PAR assignment - saves immediately, clones from source item
    createSinglePARAssignment: async (_, { input }, context) => {
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
        const sourceItem = await inspectionAcceptanceReportResolver.findByPk(
          sourceItemId,
          {
            include: [PurchaseOrder],
          },
        );

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

        // Generate new PAR ID
        const newParId = await generateNewParId();
        const sourceData = sourceItem.toJSON();

        // Use transaction for atomicity
        const transaction = await sequelize.transaction();

        try {
          // Create new record with the assigned quantity and PAR ID
          const newItem = await inspectionAcceptanceReportResolver.create(
            {
              iarId: sourceData.iarId,
              icsId: sourceData.icsId,
              risId: sourceData.risId,
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
              parId: newParId,
              parReceivedFrom: receivedFrom,
              parReceivedFromPosition: receivedFromPosition || "",
              parReceivedBy: receivedBy,
              parReceivedByPosition: receivedByPosition || "",
              parDepartment: department || "",
              parAssignedDate: new Date(),
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
          const updatedNewItem =
            await inspectionAcceptanceReportResolver.findByPk(newItem.id, {
              include: [PurchaseOrder],
            });
          const updatedSourceItem =
            await inspectionAcceptanceReportResolver.findByPk(sourceItemId, {
              include: [PurchaseOrder],
            });

          return {
            newItem: updatedNewItem,
            sourceItem: updatedSourceItem,
            generatedParId: newParId,
          };
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in createSinglePARAssignment:", error);
        throw new Error(error.message || "Failed to create PAR assignment");
      }
    },

    // Create a multi-item PAR assignment (multiple items share one PAR ID per end user)
    createMultiItemPARAssignment: async (_, { input }, context) => {
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

        // Generate a single PAR ID for all items in this assignment
        const sharedParId = await generateNewParId();

        const transaction = await sequelize.transaction();
        const newItemIds = [];
        const sourceItemIds = [];

        try {
          for (const entry of items) {
            const { sourceItemId, quantity } = entry;

            // Fetch the source item
            const sourceItem =
              await inspectionAcceptanceReportResolver.findByPk(sourceItemId, {
                include: [PurchaseOrder],
                transaction,
              });

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

            // Create new record with the assigned quantity and shared PAR ID
            const newItem = await inspectionAcceptanceReportResolver.create(
              {
                iarId: sourceData.iarId,
                icsId: sourceData.icsId,
                risId: sourceData.risId,
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
                // Assignment-specific fields — shared PAR ID
                actualQuantityReceived: quantity,
                amount: quantity * parseFloat(sourceData.unitCost || 0),
                parId: sharedParId,
                parReceivedFrom: receivedFrom,
                parReceivedFromPosition: receivedFromPosition || "",
                parReceivedBy: receivedBy,
                parReceivedByPosition: receivedByPosition || "",
                parDepartment: department || "",
                parAssignedDate: new Date(),
              },
              { transaction },
            );

            newItemIds.push(newItem.id);

            // Update source item: reduce actualQuantityReceived
            const newSourceQty = currentReceived - quantity;
            await sourceItem.update(
              { actualQuantityReceived: newSourceQty },
              { transaction },
            );

            sourceItemIds.push(sourceItemId);
          }

          await transaction.commit();

          // Fetch all created items and updated source items
          const newItems = await inspectionAcceptanceReportResolver.findAll({
            where: { id: { [Op.in]: newItemIds } },
            include: [PurchaseOrder],
          });
          const sourceItems = await inspectionAcceptanceReportResolver.findAll({
            where: { id: { [Op.in]: sourceItemIds } },
            include: [PurchaseOrder],
          });

          return {
            newItems,
            sourceItems,
            generatedParId: sharedParId,
          };
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in createMultiItemPARAssignment:", error);
        throw new Error(
          error.message || "Failed to create multi-item PAR assignment",
        );
      }
    },

    // Add an item to an existing PAR ID
    addItemToExistingPAR: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const { sourceItemId, quantity, existingParId } = input;

        if (!existingParId) {
          throw new Error("Existing PAR ID is required");
        }

        // Find an existing item with this PAR ID to copy signatory info
        const existingPARItem =
          await inspectionAcceptanceReportResolver.findOne({
            where: { parId: existingParId, isDeleted: false },
          });

        if (!existingPARItem) {
          throw new Error(
            `No existing item found with PAR ID "${existingParId}"`,
          );
        }

        // Fetch the source item
        const sourceItem = await inspectionAcceptanceReportResolver.findByPk(
          sourceItemId,
          {
            include: [PurchaseOrder],
          },
        );

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
          // Create new record with the existing PAR ID and copied signatory info
          const newItem = await inspectionAcceptanceReportResolver.create(
            {
              iarId: sourceData.iarId,
              icsId: sourceData.icsId,
              risId: sourceData.risId,
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
              // Use existing PAR ID and copy signatory info
              actualQuantityReceived: quantity,
              amount: quantity * parseFloat(sourceData.unitCost || 0),
              parId: existingParId,
              parReceivedFrom: existingPARItem.parReceivedFrom,
              parReceivedFromPosition: existingPARItem.parReceivedFromPosition,
              parReceivedBy: existingPARItem.parReceivedBy,
              parReceivedByPosition: existingPARItem.parReceivedByPosition,
              parDepartment: existingPARItem.parDepartment,
              parAssignedDate: new Date(),
            },
            { transaction },
          );

          // Update source: reduce qty
          const newSourceQty = currentReceived - quantity;
          await sourceItem.update(
            { actualQuantityReceived: newSourceQty },
            { transaction },
          );

          await transaction.commit();

          const updatedNewItem =
            await inspectionAcceptanceReportResolver.findByPk(newItem.id, {
              include: [PurchaseOrder],
            });
          const updatedSourceItem =
            await inspectionAcceptanceReportResolver.findByPk(sourceItemId, {
              include: [PurchaseOrder],
            });

          return {
            newItem: updatedNewItem,
            sourceItem: updatedSourceItem,
            parId: existingParId,
          };
        } catch (innerError) {
          await transaction.rollback();
          throw innerError;
        }
      } catch (error) {
        console.error("Error in addItemToExistingPAR:", error);
        throw new Error(error.message || "Failed to add item to existing PAR");
      }
    },

    // Update an existing PAR assignment
    updatePARAssignment: async (_, { input }, context) => {
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

        const item = await inspectionAcceptanceReportResolver.findByPk(itemId);
        if (!item) {
          throw new Error(`Item with ID ${itemId} not found`);
        }

        // Build update object with only provided fields
        const updateData = {};
        if (quantity !== undefined && quantity !== null) {
          updateData.actualQuantityReceived = quantity;
          updateData.amount = quantity * parseFloat(item.unitCost || 0);
        }
        if (department !== undefined) updateData.parDepartment = department;
        if (receivedFrom !== undefined)
          updateData.parReceivedFrom = receivedFrom;
        if (receivedFromPosition !== undefined)
          updateData.parReceivedFromPosition = receivedFromPosition;
        if (receivedBy !== undefined) updateData.parReceivedBy = receivedBy;
        if (receivedByPosition !== undefined)
          updateData.parReceivedByPosition = receivedByPosition;

        await item.update(updateData);

        // Return updated item with associations
        const updatedItem = await inspectionAcceptanceReportResolver.findByPk(
          itemId,
          {
            include: [PurchaseOrder],
          },
        );

        return updatedItem;
      } catch (error) {
        console.error("Error in updatePARAssignment:", error);
        throw new Error(error.message || "Failed to update PAR assignment");
      }
    },
  },
};

export default propertyAcknowledgmentReportResolver;
