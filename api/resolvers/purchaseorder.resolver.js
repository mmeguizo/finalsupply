import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Import the Sequelize models
import PurchaseOrderItemsHistory from "../models/purchaseorderitemshistory.js"; // Import history model

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
    // purchaseOrders: async (_, { purchaseorderId }, context) => {
    //   try {
    //     if (!context.isAuthenticated()) {
    //       throw new Error("Unauthorized");
    //     }
    //     // Fetch a single purchase order by ID
    //     const purchaseorder = await PurchaseOrder.findOne({
    //       where: { id: purchaseorderId },
    //     });

    //     if (!purchaseorder) {
    //       throw new Error("Purchase order not found");
    //     }
    //     return purchaseorder;
    //   } catch (error) {
    //     console.error("Error fetching purchase order: ", error);
    //     throw new Error(error.message || "Internal server error");
    //   }
    // },
  },

  Mutation: {
    addPurchaseOrder: async (_, { input }, context) => {
      try {
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
          for (const item of items) {

            const newPOI = await PurchaseOrderItems.create({
              ...item,
              actualQuantityReceived : item.currentInput, 
              purchaseOrderId: newPurchaseorder.id, // Link items to the new purchase order
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
              changedBy: context.user?.email || "system",
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
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        const { id, items, ...poUpdates } = input;
        const findIfExists = await PurchaseOrder.findOne({ where: { id: id } });

        if (!findIfExists) {
          throw new Error("Purchase order not found");
        }

        // // Update the purchase order details
        // const updatedPurchaseorder = await PurchaseOrder.update(poUpdates, {
        //   where: { id: id },
        //   // returning: true, // Fetch the updated purchase order
        // });

        // Handle items if provided
        if (items && Array.isArray(items) && items.length > 0) {
          for (const item of items) {
            if (item.id) {
              // Increment actualQuantityReceived by currentInput
              if (item.currentInput && item.currentInput > 0) {
                // Get the current item state before update
                const currentItem = await PurchaseOrderItems.findOne({
                  where: { id: item.id, purchaseOrderId: id },
                });

                // Increment the actualQuantityReceived
                await PurchaseOrderItems.increment(
                  { actualQuantityReceived: item.currentInput }, // Increment field
                  { where: { id: item.id, purchaseOrderId: id } } // Condition to match the item
                );

                // Create history record for the quantity update
                await PurchaseOrderItemsHistory.create({
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
                  changedBy: context.user?.email || "system",
                  changeReason: "Quantity received update",
                });
              }

              // Update existing item
              await PurchaseOrderItems.update(item, {
                where: { id: item.id, purchaseOrderId: id },
                returning: true,
              });
            } else {
              // Create new item if the item does not have an id
              const newPOI = await PurchaseOrderItems.create({
                ...item,
                actualQuantityReceived : item.currentInput,
                purchaseOrderId: id,
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
                changedBy: context.user?.email || "system",
                changeReason: "Initial item creation",
              });
            }
          }
        }

        const returnData = await PurchaseOrder.findOne({ where: { id: id } });

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
