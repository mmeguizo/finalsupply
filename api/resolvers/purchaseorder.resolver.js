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
    addPurchaseOrder: async (_, { input }, context) => {
      const batchIarId = nanoid();
      try {
        const user = context.req.user;
        const { items, ...poRestData } = input;

        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // Check if a purchase order with the same ponumber already exists
        const existingPO = await PurchaseOrder.findOne({
          where: { poNumber: input.poNumber, isDeleted: false },
        });

        if (existingPO) {
          throw new Error(
            `Purchase order with number ${input.poNumber} already exists`
          );
        }

        // Create new purchase order
        const newPurchaseorder = await PurchaseOrder.create({
          ...poRestData,
        });

        // If items exist, create purchase order items
        if (items && Array.isArray(items)) {
          // Generate a single IAR ID for all items in this batch
          for (const item of items) {
            const { id: poId, ...cleanedItems } = item;
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
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const { id: ID, items, markingComplete, ...poUpdates } = input;

        const findIfExists = await PurchaseOrder.findOne({ where: { id: ID } });
        if (!findIfExists) {
          throw new Error("Purchase order not found");
        }
        // Update the purchase order details
        // Update the purchase order
        const [_, affectedRows] = await PurchaseOrder.update(poUpdates, {
          where: { id: ID },
        });

        if (markingComplete) {
          const currentPurchaseOrder = await PurchaseOrder.findByPk(ID, {
            include: [PurchaseOrderItems],
          });
          const dataHistory = currentPurchaseOrder.PurchaseOrderItems.find(
            (item) => item.purchaseOrderId === ID
          );
          await PurchaseOrderItemsHistory.create({
            purchaseOrderItemId: dataHistory.id,
            previousQuantity: dataHistory.quantity,
            newQuantity: dataHistory.quantity,
            previousActualQuantityReceived: dataHistory.actualQuantityReceived,
            newActualQuantityReceived: dataHistory.actualQuantityReceived,
            previousAmount: dataHistory.amount,
            newAmount: dataHistory.amount,
            changeType: "received_update",
            changedBy: user.name,
            changeReason: "Marking Complete",
          });
          return currentPurchaseOrder;
        }

        // Handle items if provided
        if (items && Array.isArray(items) && items.length > 0) {
          // Generate a single IAR ID for all items in this batch
          for (const item of items) {
            if (item.id !== "temp") {
              // Increment actualQuantityReceived by currentInput
              if (item.currentInput && item.currentInput > 0) {
                // Get the current item state before update
                const currentItem = await PurchaseOrderItems.findOne({
                  where: { id: item.id, purchaseOrderId: ID },
                });

                // Increment the actualQuantityReceived
                await PurchaseOrderItems.increment(
                  { actualQuantityReceived: item.currentInput }, // Increment field
                  { where: { id: item.id, purchaseOrderId: ID } } // Condition to match the item
                );
                // Update existing item
                const poitems = await PurchaseOrderItems.update(item, {
                  where: { id: item.id, purchaseOrderId: ID },
                  returning: true,
                });
                //add entry to inspection acceptance report
                //remove first the existing id of the poitems
                const cleanedItem = omitId(item);
                await inspectionAcceptanceReport.create({
                  ...cleanedItem,
                  iarId: batchIarId, // Use the same IAR ID for all items in this batch
                  actualQuantityReceived: item.currentInput,
                  purchaseOrderId: ID, // Link items to the new purchase order
                  purchaseOrderItemId: currentItem.id, // Link items to the new purchase order
                });

                // Create history record for the quantity update
                const updateHistory = await PurchaseOrderItemsHistory.create({
                  purchaseOrderItemId: item.id,
                  previousQuantity: currentItem.quantity,
                  newQuantity: currentItem.quantity,
                  previousActualQuantityReceived:
                    currentItem.actualQuantityReceived,
                  newActualQuantityReceived:
                    currentItem.actualQuantityReceived + item.currentInput,
                  previousAmount: currentItem.amount,
                  newAmount: currentItem.amount,
                  changeType: "received_update",
                  changedBy: user.name,
                  changeReason: "Quantity received update",
                });
              }
            } else {
              // Create new item if the item does not have an id
              const { id: poId, ...cleanedItems } = item;
              const newPOI = await PurchaseOrderItems.create({
                itemName: item.itemName,
                description: item.description,
                unit: item.unit,
                quantity: item.quantity,
                unitCost: item.unitCost,
                amount: item.amount,
                category: item.category,
                tag: item.tag,
                actualQuantityReceived: item.currentInput,
                purchaseOrderId: ID,
              });

              //add entry to inspection acceptance report
              await inspectionAcceptanceReport.create({
                ...cleanedItems,
                iarId: batchIarId, //=> "4f90d13a42"
                actualQuantityReceived: item.currentInput,
                purchaseOrderId: ID, // Link items to the new purchase order
                purchaseOrderItemId: newPOI.id,
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
                changedBy: user.name,
                changeReason: "Initial item creation",
              });
            }
          }
        }
        const returnData = await PurchaseOrder.findOne({ where: { id: ID } });
        // Return the updated purchase order
        return returnData; // Get the updated object
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
