import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Import the Sequelize models
import PurchaseOrderItemsHistory from "../models/purchaseorderitemshistory.js"; // Import history model
import inspectionAcceptanceReport from "../models/inspectionacceptancereport.js";
import { customAlphabet } from "nanoid";
import { omitId } from "../utils/helper.js";

const nanoid = customAlphabet("1234567890meguizomarkoliver", 10);
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
    // addPurchaseOrder: async (_, { input }, context) => {
    //   const batchIarId = nanoid();
    //   try {
    //     const user = context.req.user;
    //     const { items, ...poRestData } = input;

    //     if (!context.isAuthenticated()) {
    //       throw new Error("Unauthorized");
    //     }

    //     // Check if a purchase order with the same ponumber already exists
    //     const existingPO = await PurchaseOrder.findOne({
    //       where: { poNumber: input.poNumber, isDeleted: false },
    //     });

    //     if (existingPO) {
    //       throw new Error(
    //         `Purchase order with number ${input.poNumber} already exists`
    //       );
    //     }

    //     // Create new purchase order
    //     const newPurchaseorder = await PurchaseOrder.create({
    //       ...poRestData,
    //     });

    //     // If items exist, create purchase order items
    //     if (items && items.length > 0 && Array.isArray(items)) {
    //       // Generate a single IAR ID for all items in this batch
    //       for (const item of items) {
    //         const { id: poId, ...cleanedItems } = item;
    //         const newPOI = await PurchaseOrderItems.create({
    //           ...cleanedItems,
    //           actualQuantityReceived: item.currentInput,
    //           purchaseOrderId: newPurchaseorder.id, // Link items to the new purchase order
    //         });

    //         await inspectionAcceptanceReport.create({
    //           ...cleanedItems,
    //           iarId: batchIarId, // Use the same IAR ID for all items in this batch
    //           actualQuantityReceived: item.currentInput,
    //           purchaseOrderId: newPurchaseorder.id, // Link items to the new purchase order
    //           purchaseOrderItemId: newPOI.id, // Link items to the new purchase order
    //         });

    //         await PurchaseOrderItemsHistory.create({
    //           purchaseOrderItemId: newPOI.id,
    //           previousQuantity: 0,
    //           newQuantity: item.quantity,
    //           previousActualQuantityReceived: 0,
    //           newActualQuantityReceived: item.currentInput || 0,
    //           previousAmount: 0,
    //           newAmount: item.amount,
    //           changeType: "quantity_update",
    //           changedBy: user.name || user.id,
    //           changeReason: "Initial item creation",
    //         });
    //       }
    //     }
    //     // Fetch the newly created purchase order with its items
    //     const purchaseOrderWithItems = await PurchaseOrder.findOne({
    //       where: { id: newPurchaseorder.id },
    //       include: [PurchaseOrderItems],
    //     });
    //     return purchaseOrderWithItems;
    //   } catch (error) {
    //     console.error("Error adding purchase order: ", error);
    //     throw new Error(error.message || "Internal server error");
    //   }
    // },

    addPurchaseOrder: async (_, { input }, context) => {
  const batchIarId = nanoid();
  // Define valid categories at a higher scope if used for both PO and POItems
  const validCategories = [
    "property acknowledgement reciept",
    "inventory custodian slip",
    "requisition issue slip"
  ];

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
    if (!poRestData.category || !validCategories.includes(poRestData.category)) {
      poRestData.category = "requisition issue slip"; // Default for PurchaseOrder category
    }

    // Create new purchase order
    const newPurchaseorder = await PurchaseOrder.create({
      ...poRestData,
    });

    // If items exist, create purchase order items
    if (items && Array.isArray(items) && items.length > 0) {
      // Generate a single IAR ID for all items in this batch
      for (const item of items) {
        const { id: poId, ...cleanedItems } = item;

        // Validate and set default for item category if necessary
        if (!validCategories.includes(cleanedItems.category)) {
          cleanedItems.category = "requisition issue slip";
        }

        const newPOI = await PurchaseOrderItems.create({
          ...cleanedItems,
          actualQuantityReceived: item.currentInput,
          purchaseOrderId: newPurchaseorder.id, // Link items to the new purchase order
        });

        await inspectionAcceptanceReport.create({
          ...cleanedItems,
          iarId: batchIarId, // Use the same IAR ID for all items in this batch
          actualQuantityReceived: item.currentInput,
          purchaseOrderId: newPurchaseorder.id, // Link items to the new purchase order
          purchaseOrderItemId: newPOI.id, // Link items to the new purchase order
        });

        await PurchaseOrderItemsHistory.create({
          purchaseOrderItemId: newPOI.id,
          previousQuantity: 0,
          newQuantity: item.quantity,
          previousActualQuantityReceived: 0,
          newActualQuantityReceived: item.currentInput || 0,
          previousAmount: 0,
          newAmount: item.amount,
          changeType: "quantity_update",
          changedBy: user.name || user.id,
          changeReason: "Initial item creation",
        });
      }
    }

    // Fetch the newly created purchase order with its items
    const purchaseOrderWithItems = await PurchaseOrder.findOne({
      where: { id: newPurchaseorder.id },
      include: [PurchaseOrderItems],
    });
    
    return purchaseOrderWithItems;
  } catch (error) {
    console.error("Error adding purchase order: ", error);
    throw new Error(error.message || "Internal server error");
  }
},

    updatePurchaseOrder: async (_, { input }, context) => {
      const user = context.req.user;
      const batchIarId = nanoid();
      // Define valid categories, similar to addPurchaseOrder
      const validCategories = [
        "property acknowledgement reciept",
        "inventory custodian slip",
        "requisition issue slip"
      ];

      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const { id: poId, items, markingComplete, ...poUpdates } = input; // Use poId for clarity

        const findIfExists = await PurchaseOrder.findOne({ where: { id: poId } });
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
          if (poForHistory && poForHistory.PurchaseOrderItems && poForHistory.PurchaseOrderItems.length > 0) {
            const firstItemForHistory = poForHistory.PurchaseOrderItems[0];
            await PurchaseOrderItemsHistory.create({
              purchaseOrderItemId: firstItemForHistory.id,
              previousQuantity: firstItemForHistory.quantity, // Snapshot
              newQuantity: firstItemForHistory.quantity,     // Snapshot
              previousActualQuantityReceived: firstItemForHistory.actualQuantityReceived, // Snapshot
              newActualQuantityReceived: firstItemForHistory.actualQuantityReceived,     // Snapshot
              previousAmount: firstItemForHistory.amount,   // Snapshot
              newAmount: firstItemForHistory.amount,       // Snapshot
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
          for (const item of items) {
            if (item.id !== "temp") {
              // Existing item
              const currentItem = await PurchaseOrderItems.findOne({
                where: { id: item.id, purchaseOrderId: poId },
              });

              if (!currentItem) {
                console.warn(`Item with id ${item.id} not found for PO ${poId}. Skipping.`);
                continue;
              }

              const itemUpdates = {};
              let hasChanges = false;

              // Check for updates to standard fields
              ['itemName', 'description', 'unit', 'category', 'tag'].forEach(field => {
                if (item[field] !== undefined && item[field] !== currentItem[field]) {
                  itemUpdates[field] = item[field];
                  hasChanges = true;
                }
              });
              if (item.quantity !== undefined && Number(item.quantity) !== currentItem.quantity) {
                itemUpdates.quantity = Number(item.quantity);
                hasChanges = true;
              }
              if (item.unitCost !== undefined && Number(item.unitCost) !== currentItem.unitCost) {
                itemUpdates.unitCost = Number(item.unitCost);
                hasChanges = true;
              }

              // Recalculate amount if quantity or unitCost changed
              const newQuantity = itemUpdates.quantity !== undefined ? itemUpdates.quantity : currentItem.quantity;
              const newUnitCost = itemUpdates.unitCost !== undefined ? itemUpdates.unitCost : currentItem.unitCost;
              const newAmount = newQuantity * newUnitCost;
              if (newAmount !== currentItem.amount) {
                itemUpdates.amount = newAmount;
                hasChanges = true;
              }

              let actualQuantityReceivedIncrement = 0;
              if (item.currentInput && Number(item.currentInput) > 0) {
                actualQuantityReceivedIncrement = Number(item.currentInput);
                itemUpdates.actualQuantityReceived = currentItem.actualQuantityReceived + actualQuantityReceivedIncrement;
                hasChanges = true;
              }

              if (hasChanges) {
                await PurchaseOrderItems.update(itemUpdates, {
                  where: { id: item.id, purchaseOrderId: poId },
                });

                if (actualQuantityReceivedIncrement > 0) {
                  // Create IAR entry only if new quantity was received
                  const iarItemData = { ...currentItem.get(), ...itemUpdates }; // Use currentItem and apply updates for IAR
                  await inspectionAcceptanceReport.create({
                    ...omitId(iarItemData), // omitId on the merged data for IAR
                    iarId: batchIarId,
                    actualQuantityReceived: actualQuantityReceivedIncrement, // Log only the increment
                    purchaseOrderId: poId,
                    purchaseOrderItemId: currentItem.id,
                  });
                }

                // Create history record
                await PurchaseOrderItems.increment(
                  { actualQuantityReceived: item.currentInput }, // Increment field
                  { where: { id: item.id, purchaseOrderId: poId } } // Condition to match the item
                );
                await PurchaseOrderItemsHistory.create({
                  purchaseOrderItemId: item.id,
                  previousQuantity: currentItem.quantity,
                  newQuantity: itemUpdates.quantity !== undefined ? itemUpdates.quantity : currentItem.quantity,
                  previousActualQuantityReceived: currentItem.actualQuantityReceived,
                  newActualQuantityReceived: itemUpdates.actualQuantityReceived !== undefined ? itemUpdates.actualQuantityReceived : currentItem.actualQuantityReceived,
                  previousAmount: currentItem.amount,
                  newAmount: itemUpdates.amount !== undefined ? itemUpdates.amount : currentItem.amount,
                  changeType: actualQuantityReceivedIncrement > 0 ? "received_update" : "item_details_update",
                  changedBy: user.name || user.id,
                  changeReason: actualQuantityReceivedIncrement > 0 ? "Quantity received/Item details updated" : "Item details updated",
                });
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
                unit: item.unit || "",
                quantity: item.quantity || 0,
                unitCost: item.unitCost || 0,
                amount: item.amount || 0,
                category: item.category || "requisition issue slip", // Default category
                tag: item.tag || "none",
                actualQuantityReceived: item.currentInput || 0,
                purchaseOrderId: poId  || id,
              });

              //add entry to inspection acceptance report
              await inspectionAcceptanceReport.create({
                ...cleanedItems,
                iarId: batchIarId, //=> "4f90d13a42"
                actualQuantityReceived: item.currentInput || 0,
                purchaseOrderId: poId, // Link items to the new purchase order
                purchaseOrderItemId: newPOI.id,
              });

              await PurchaseOrderItemsHistory.create({
                purchaseOrderItemId: newPOI.id,
                previousQuantity: 0,
                newQuantity: item.quantity || 0,
                previousActualQuantityReceived: 0,
                newActualQuantityReceived: item.currentInput || 0,
                previousAmount: 0,
                newAmount: item.amount || 0,
                changeType: "item_creation", // More specific
                changedBy: user.name || user.id,
                changeReason: "Initial item creation",
              });
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
