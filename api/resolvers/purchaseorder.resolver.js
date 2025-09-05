import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Import the Sequelize models
import PurchaseOrderItemsHistory from "../models/purchaseorderitemshistory.js"; // Import history model
import inspectionAcceptanceReport from "../models/inspectionacceptancereport.js";
import { customAlphabet } from "nanoid";
import { omitId } from "../utils/helper.js";
import { sequelize } from "../db/connectDB.js"; // Import sequelize connection
const nanoid = customAlphabet("1234567890meguizomarkoliver", 10);
import { generateNewIarId } from "../utils/iarIdGenerator.js";
import { generateNewRisId } from "../utils/risIdGenerator.js";
import { generateNewParId } from "../utils/parIdGenerator.js";
import { generateNewIcsId } from "../utils/icsIdGenerator.js";
const purchaseorderResolver = {
  Query: {
    purchaseOrders: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch all purchase orders using Sequelize
        const purchaseorders = await PurchaseOrder.findAll({
          where: { isDeleted: false }, // Only get active purchase orders
          order: [["createdAt", "DESC"]], // Sort by date descending
        });

        return purchaseorders;
      } catch (error) {
        console.error("Error fetching purchase orders: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    purchaseOrderItems: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch all purchase order items using Sequelize
        const purchaseordersItems = await PurchaseOrderItems.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
        });

        return purchaseordersItems;
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    allPurchaseOrderItems: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch all purchase order items using Sequelize
        const purchaseordersItems = await PurchaseOrderItems.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrder],
        });
        return purchaseordersItems;
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    allICSPurchaseOrderItems: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch all purchase order items using Sequelize
        const purchaseordersItems = await PurchaseOrderItems.findAll({
          where: { isDeleted: false, category: "inventory custodian slip" },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrder],
        });
        return purchaseordersItems;
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    getAllTotalPurchaseOrderAmount: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        let totalItemAmount = await PurchaseOrderItems.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
        });
        let totalAmount = totalItemAmount.reduce((sum, item) => {
          return sum + (Number(item.amount) || 0);
        }, 0);
        return totalAmount; // Return the total amoun
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    getTotalPurchaseOrderItems: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        let totalItemAmount = await PurchaseOrderItems.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
        });
        let totalAmount = totalItemAmount.length;
        return totalAmount; // Return the total amoun
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    getTotalPurchaseOrders: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        let totalItemAmount = await PurchaseOrder.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
        });
        let totalAmount = totalItemAmount.length;
        return totalAmount; // Return the total amoun
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    getPurchaseOrderForBarCharts: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        let totalItemAmount = await PurchaseOrder.findAll({
          where: { isDeleted: false },
          order: [["createdAt", "DESC"]],
          include: [PurchaseOrderItems],
        });

        return totalItemAmount; // Return the total amoun
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    getAllCategory: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        let allCategory = await PurchaseOrderItems.findAll({
          where: { isDeleted: false },
        });
        return allCategory;
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    purchaseOrderHistory: async (_, { purchaseOrderId }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const purchaseOrder = await PurchaseOrder.findByPk(purchaseOrderId, {
          include: [PurchaseOrderItems],
        });

        const itemsID = purchaseOrder.PurchaseOrderItems.map((item) => item.id);
        const history = await PurchaseOrderItemsHistory.findAll({
          where: { purchaseOrderItemId: itemsID },
          order: [["createdAt", "DESC"]],
        });

        return history;
      } catch (error) {
        console.error("Error fetching purchase order items: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    inspectionAcceptanceReport: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Fetch a single purchase order by ID
        const inspectionAcceptanceReportdata =
          await inspectionAcceptanceReport.findAll({
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
  },

  Mutation: {
    addPurchaseOrder: async (_, { input }, context) => {
      const batchIarId = nanoid();
      const autoIiarIds = await generateNewIarId(context.req.user.location);
      // Define valid categories at a higher scope if used for both PO and POItems
      const validCategories = [
        "property acknowledgement reciept",
        "inventory custodian slip",
        "requisition issue slip",
      ];

      const t = await sequelize.transaction(); // Start a transaction

      try {
        const user = context.req.user;
        const { items, ...poRestData } = input;

        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // Items are optional - purchase order can be created without items

        // Check if a purchase order with the same ponumber already exists
        const existingPO = await PurchaseOrder.findOne({
          where: { poNumber: input.poNumber, isDeleted: false },
        });

        if (existingPO) {
          throw new Error(
            `Purchase order with number ${input.poNumber} already exists`
          );
        }

        // Ensure poRestData.category has a valid default if it's not set or invalid
        if (
          !poRestData.category ||
          !validCategories.includes(poRestData.category)
        ) {
          poRestData.category = "requisition issue slip"; // Default for PurchaseOrder category
        }

        // Create new purchase order
        const newPurchaseorder = await PurchaseOrder.create(
          {
            ...poRestData,
          },
          { transaction: t }
        ); // Use transaction

        // If items exist, create purchase order items
        if (items && Array.isArray(items) && items.length > 0) {
          // Validate that if items are provided, at least one item has meaningful data
          const hasAtLeastOneValidItem = items.some((item) => {
            const itemNameIsValid =
              item.itemName && item.itemName.trim() !== "";
            const quantityIsValid =
              typeof item.quantity === "number" && item.quantity > 0;
            // You could add more checks here if needed, e.g., for unitCost
            return itemNameIsValid || quantityIsValid;
          });

          if (!hasAtLeastOneValidItem) {
            throw new Error(
              "Cannot process purchase order: provided items are empty or invalid. Please ensure at least one item has a name or quantity."
            );
          }
          //generate ids right away

          for (const item of items) {
            const { id: poId, ...cleanedItems } = item;

            // Validate and set default for item category if necessary
            if (!validCategories.includes(cleanedItems.category)) {
              cleanedItems.category = "requisition issue slip";
            }

            const newPOI = await PurchaseOrderItems.create(
              {
                ...cleanedItems,
                actualQuantityReceived: item.currentInput,
                purchaseOrderId: newPurchaseorder.id, // Link items to the new purchase order
              },
              { transaction: t }
            ); // Use transaction

            // Only create IAR and History if currentInput is provided and greater than 0
            if (item.currentInput && Number(item.currentInput) > 0) {
              let icsId = "";
              let parId = "";
              let risId = "";
              if (cleanedItems.tag === "high" || cleanedItems.tag === "low") {
                icsId = await generateNewIcsId(cleanedItems.tag);
              }
              if (
                cleanedItems.category === "property acknowledgement reciept"
              ) {
                parId = await generateNewParId();
              }
              if (cleanedItems.category === "requisition issue slip") {
                risId = await generateNewRisId();
              }

              await inspectionAcceptanceReport.create(
                {
                  ...cleanedItems,
                  iarId: autoIiarIds || batchIarId, // Use the same IAR ID for all items in this batch
                  actualQuantityReceived: item.currentInput, // Already checked it's > 0
                  purchaseOrderId: newPurchaseorder.id, // Link items to the new purchase order
                  purchaseOrderItemId: newPOI.id, // Link items to the new purchase order
                  createdBy: user.name || user.id, // Track who created the IAR
                  updatedBy: user.name || user.id, // Track who updated the IAR
                  parId: parId || "", // Use the same PAR ID for all items in this batch
                  icsId: icsId || "",
                  risId: risId || "",
                },
                { transaction: t }
              ); // Use transaction

              await PurchaseOrderItemsHistory.create(
                {
                  purchaseOrderItemId: newPOI.id,
                  previousQuantity: 0,
                  newQuantity: item.quantity,
                  previousActualQuantityReceived: 0,
                  newActualQuantityReceived: item.currentInput, // Already checked it's > 0
                  previousAmount: 0,
                  newAmount: item.amount,
                  changeType: "quantity_update", // Or "received_update" if more appropriate for initial
                  changedBy: user.name || user.id,
                  changeReason: "Initial item creation with received quantity",
                },
                { transaction: t }
              );
            }
          }
        }
        await t.commit(); // Commit the transaction if everything was successful
        // Fetch the newly created purchase order with its items
        const purchaseOrderWithItems = await PurchaseOrder.findOne({
          where: { id: newPurchaseorder.id },
          include: [PurchaseOrderItems],
        });

        return purchaseOrderWithItems;
      } catch (error) {
        if (t) {
          await t.rollback(); // Rollback the transaction in case of error
        }
        console.error("Error adding purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    updatePurchaseOrder: async (_, { input }, context) => {
      const user = context.req.user;
      const batchIarId = nanoid();
      const autoIiarIds = await generateNewIarId(context.req.user.location);
      // Define valid categories, similar to addPurchaseOrder
      const validCategories = [
        "property acknowledgement reciept",
        "inventory custodian slip",
        "requisition issue slip",
      ];

      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const { id: poId, items, markingComplete, ...poUpdates } = input; // Use poId for clarity

        const findIfExists = await PurchaseOrder.findOne({
          where: { id: poId },
        });
        if (!findIfExists) {
          throw new Error("Purchase order not found");
        }
        // Update the purchase order details
        // Update the purchase order
        const [_, affectedRows] = await PurchaseOrder.update(poUpdates, {
          where: { id: poId },
        });

        if (markingComplete) {
          // If marking complete, we might update the PO status and log history.
          // The original logic tied history to the first item.
          await PurchaseOrder.update(
            { status: "Completed", completed_status_date: new Date() }, // Assuming 'status' and 'completed_status_date' are fields
            { where: { id: poId } }
          );

          const poForHistory = await PurchaseOrder.findByPk(poId, {
            include: [PurchaseOrderItems],
          });

          // Log history for marking complete, if items exist to associate with
          if (
            poForHistory &&
            poForHistory.PurchaseOrderItems &&
            poForHistory.PurchaseOrderItems.length > 0
          ) {
            const firstItemForHistory = poForHistory.PurchaseOrderItems[0];
            await PurchaseOrderItemsHistory.create({
              purchaseOrderItemId: firstItemForHistory.id,
              previousQuantity: firstItemForHistory.quantity, // Snapshot
              newQuantity: firstItemForHistory.quantity, // Snapshot
              previousActualQuantityReceived:
                firstItemForHistory.actualQuantityReceived, // Snapshot
              newActualQuantityReceived:
                firstItemForHistory.actualQuantityReceived, // Snapshot
              previousAmount: firstItemForHistory.amount, // Snapshot
              newAmount: firstItemForHistory.amount, // Snapshot
              changeType: "po_completed", // More specific type
              changedBy: user.name || user.id,
              changeReason: "Purchase Order Marked Complete",
            });
          }
          // If markingComplete is an exclusive action, an early return might be appropriate here.
          // Current logic allows item processing even if markingComplete is true.
        }

        // Handle items if provided
        if (items && Array.isArray(items) && items.length > 0) {
          // Generate a single IAR ID for all items in this batch

          const hasAtLeastOneValidItem = items.some((item) => {
            const itemNameIsValid =
              item.itemName && item.itemName.trim() !== "";
            const quantityIsValid =
              typeof item.quantity === "number" && item.quantity > 0;
            // You could add more checks here if needed, e.g., for unitCost
            return itemNameIsValid || quantityIsValid;
          });
          if (!hasAtLeastOneValidItem) {
            throw new Error(
              "Cannot process purchase order: provided items are empty or invalid. Please ensure at least one item has a name or quantity."
            );
          }

          for (const item of items) {
            if (item.id !== "temp") {
              // Existing item
              const currentItem = await PurchaseOrderItems.findOne({
                where: { id: item.id, purchaseOrderId: poId },
              });

              if (!currentItem) {
                console.warn(
                  `Item with id ${item.id} not found for PO ${poId}. Skipping.`
                );
                continue;
              }

              const itemUpdates = {};
              let hasChanges = false;

              // Check for updates to standard fields
              [
                "itemName",
                "description",
                "generalDescription",
                "specification",
                "unit",
                "category",
                "tag",
                "inventoryNumber",
              ].forEach((field) => {
                if (
                  item[field] !== undefined &&
                  item[field] !== currentItem[field]
                ) {
                  itemUpdates[field] = item[field];
                  hasChanges = true;
                }
              });
              if (
                item.quantity !== undefined &&
                Number(item.quantity) !== currentItem.quantity
              ) {
                itemUpdates.quantity = Number(item.quantity);
                hasChanges = true;
              }
              if (
                item.unitCost !== undefined &&
                Number(item.unitCost) !== currentItem.unitCost
              ) {
                itemUpdates.unitCost = Number(item.unitCost);
                hasChanges = true;
              }

              // Recalculate amount if quantity or unitCost changed
              const newQuantity =
                itemUpdates.quantity !== undefined
                  ? itemUpdates.quantity
                  : currentItem.quantity;
              const newUnitCost =
                itemUpdates.unitCost !== undefined
                  ? itemUpdates.unitCost
                  : currentItem.unitCost;
              const newAmount = newQuantity * newUnitCost;
              if (newAmount !== currentItem.amount) {
                itemUpdates.amount = newAmount;
                hasChanges = true;
              }

              let actualQuantityReceivedIncrement = 0;
              if (item.currentInput && Number(item.currentInput) > 0) {
                actualQuantityReceivedIncrement = Number(item.currentInput);
                itemUpdates.actualQuantityReceived =
                  currentItem.actualQuantityReceived +
                  actualQuantityReceivedIncrement;
                hasChanges = true;
              }

              if (hasChanges) {
                await PurchaseOrderItems.update(itemUpdates, {
                  where: { id: item.id, purchaseOrderId: poId },
                });
                //lets create and id if there is none if there is an id existing we skip it

                // Create IAR entry only if new quantity was received
                if (actualQuantityReceivedIncrement > 0) {
                  const iarItemData = { ...currentItem.get(), ...itemUpdates }; // Use currentItem and apply updates for IAR
                  console.log({ iarItemData });

                  // Generate IDs only when receiving new quantity (existing item path)
                  const effectiveCategory =
                    itemUpdates.category !== undefined
                      ? itemUpdates.category
                      : currentItem.category;
                  const effectiveTag =
                    itemUpdates.tag !== undefined
                      ? itemUpdates.tag
                      : currentItem.tag;

                  let parIdGen = "";
                  let risIdGen = "";
                  let icsIdGen = "";

                  if (effectiveCategory === "property acknowledgement reciept") {
                    parIdGen = await generateNewParId();
                  }
                  if (effectiveCategory === "requisition issue slip") {
                    risIdGen = await generateNewRisId();
                  }
                  if (effectiveTag === "high" || effectiveTag === "low") {
                    icsIdGen = await generateNewIcsId(effectiveTag);
                  }

                  await inspectionAcceptanceReport.create({
                    ...omitId(iarItemData),
                    iarId: autoIiarIds || batchIarId,
                    actualQuantityReceived: actualQuantityReceivedIncrement,
                    purchaseOrderId: poId,
                    purchaseOrderItemId: currentItem.id,
                    createdBy: user.name || user.id,
                    updatedBy: user.name || user.id,
                    parId: parIdGen,
                    icsId: icsIdGen,
                    risId: risIdGen,
                  });
                } // End of hasChanges check
              }
            } else {
              // Create new item if the item does not have an id
              const { id, ...cleanedItems } = item;
              // Validate and set default for new item category
              if (!validCategories.includes(cleanedItems.category)) {
                cleanedItems.category = "requisition issue slip"; // Default category
              }
              const newPOI = await PurchaseOrderItems.create({
                itemName: item.itemName || "",
                description: item.description || "",
                generalDescription: item.generalDescription || "",
                specification: item.specification || "",
                unit: item.unit || "",
                quantity: item.quantity ? item.quantity : 0,
                unitCost: item.unitCost ? item.unitCost : 0,
                amount: item.amount ? item.amount : 0,
                category: item.category || "requisition issue slip", // Default category
                tag: item.tag || "none",
                inventoryNumber: item.inventoryNumber || "none",
                actualQuantityReceived: item?.currentInput
                  ? item.currentInput
                  : 0,
                purchaseOrderId: poId || id,
              });

              // If item.currentInput is not provided do not create a Iar entry and purchaseOrderItemsHistory entry
              // Only create IAR and History if currentInput is provided and greater than 0
              if (item.currentInput && Number(item.currentInput) > 0) {
                //add entry to inspection acceptance report

                let icsId = "";
                let parId = "";
                let risId = "";
                // Use currentItem or itemUpdates to get the tag and category values

                if (item.tag) {
                  icsId = await generateNewIcsId(cleanedItems.tag);
                }
                if (item.category === "property acknowledgement reciept") {
                  parId = await generateNewParId();
                }
                if (item.category === "requisition issue slip") {
                  risId = await generateNewRisId();
                }
                console.log({item})
                console.log('=====================')
                console.log({cleanedItems})
                console.log('=====================')
                console.log({ icsId, parId, risId });

                await inspectionAcceptanceReport.create({
                  ...cleanedItems,
                  iarId: autoIiarIds || batchIarId, //=> "4f90d13a42"
                  actualQuantityReceived: item?.currentInput
                    ? item.currentInput
                    : 0,
                  purchaseOrderId: poId, // Link items to the new purchase order
                  purchaseOrderItemId: newPOI.id,
                  createdBy: user.name || user.id, // Track who created the IAR
                  updatedBy: user.name || user.id, // Track who updated the IAR
                  parId: parId || "", // Use the same PAR ID for all items in this batch
                  icsId: icsId || "",
                  risId: risId || "",
                });

                await PurchaseOrderItemsHistory.create({
                  purchaseOrderItemId: newPOI.id,
                  previousQuantity: 0,
                  newQuantity: item.quantity ? item.quantity : 0,
                  previousActualQuantityReceived: 0,
                  newActualQuantityReceived: item?.currentInput
                    ? item.currentInput
                    : 0,
                  previousAmount: 0,
                  newAmount: item.amount ? item.amount : 0,
                  changeType: "item_creation", // More specific
                  changedBy: user.name || user.id,
                  changeReason: "Initial item creation",
                });
              }
            }
          }
        }
        // Fetch the newly created purchase order with its items
        const purchaseOrderWithItems = await PurchaseOrder.findOne({
          where: { id: poId },
          include: [PurchaseOrderItems],
        });

        return purchaseOrderWithItems;
      } catch (error) {
        console.error("Error updating purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    addPurchaseOrderItem: async (_, { purchaseOrderId, item }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Check if the purchase order exists
        const purchaseorder = await PurchaseOrder.findOne({
          where: { id: purchaseOrderId, isDeleted: false },
        });
        if (!purchaseorder) {
          throw new Error("Purchase order not found");
        }

        item.amount = item.unitCost * item.quantity; // Calculate the amount
        // Create the purchase order item
        await PurchaseOrderItems.create({
          ...item,
          purchaseOrderId,
        });

        const updatedPurchaseOrder = await PurchaseOrder.findOne({
          where: { id: purchaseOrderId },
          include: [PurchaseOrderItems], // assuming you're using Sequelize or something similar
        });

        return updatedPurchaseOrder;
      } catch (error) {
        console.error("Error adding purchase order item: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },

  // Custom
  // Field resolvers to connect purchase orders with their items
  PurchaseOrder: {
    items: async (parent) => {
      try {
        return await PurchaseOrderItems.findAll({
          where: { purchaseOrderId: parent.id, isDeleted: false },
        });
      } catch (error) {
        console.error("Error fetching purchase order items:", error);
        throw new Error("Failed to load purchase order items");
      }
    },
    amount: async (parent) => {
      try {
        const items = await PurchaseOrderItems.findAll({
          where: { purchaseOrderId: parent.id, isDeleted: false },
        });

        const total = items.reduce((sum, item) => {
          return sum + (Number(item.amount) || 0);
        }, 0);

        return total;
      } catch (error) {
        console.error(`Error calculating amount for PO: ${parent.id}`, error);
        return parent.amount || 0;
      }
    },
  },

  //  updatePurchaseOrder: async (_, { input }, context) => {
};

export default purchaseorderResolver;
