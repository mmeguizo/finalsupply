import PurchaseOrder from "../models/purchaseorder.js"; // Import the Sequelize models
import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Import the Sequelize models

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
        });

        return purchaseordersItems;
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

  // Field resolvers to connect purchase orders with their items
  PurchaseOrder: {
    items: async (parent) => {
      console.log(`Fetching items for PO: ${parent.id}`);
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
      console.log(`Calculating amount for PO: ${parent.id}`);
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
            await PurchaseOrderItems.create({
              ...item,
              purchaseOrderId: newPurchaseorder.id, // Link items to the new purchase order
            });
          }
        }
        return newPurchaseorder;
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
        console.log("Updating purchase order with ID:", input, id);
        // Update the purchase order details
        const updatedPurchaseorder = await PurchaseOrder.update(poUpdates, {
          where: { id: id },
          // where: { id: id },
          // returning: true, // Fetch the updated purchase order
        });
        console.log({ updatedPurchaseorder });

        // if (!updatedPurchaseorder[0]) {
        //   throw new Error("Purchase order not found");
        // }

        // Handle items if provided
        // if (items && Array.isArray(items) && items.length > 0) {
        //   for (const item of items) {
        //     if (item.id) {
        //       // Update existing item
        //       await PurchaseOrderItems.update(item, {
        //         where: { id: item.id, purchaseOrderId: id },
        //         returning: true,
        //       });
        //     } else {
        //       // Create new item if the item does not have an id
        //       await PurchaseOrderItems.create({
        //         ...item,
        //         purchaseOrderId: purchaseorderId,
        //       });
        //     }
        //   }
        // }

        const returnData = await PurchaseOrder.findOne({ id: id });

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
  //  updatePurchaseOrder: async (_, { input }, context) => {
};

export default purchaseorderResolver;
