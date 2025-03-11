import Purchaseorder from "../models/purchaseorder.js";
import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Add this import

const purchaseorderResolver = {
  Query: {
    purchaseorders: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // const userId = context.getUser()._id;
        const purchaseorders = await Purchaseorder.find({
          // userId,
          isDeleted: false,
        }).sort({ date: -1 });

        // Filter out deleted items from each purchase order
        const filteredPurchaseorders = purchaseorders.map((po) => {
          if (po.items && Array.isArray(po.items)) {
            return {
              ...po.toObject(),
              items: po.items.filter((item) => !item.isDeleted),
            };
          }
          return po;
        });

        return filteredPurchaseorders;
      } catch (error) {
        console.error("Error fetching purchaseorders, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    purchaseorder: async (_, { purchaseorderId }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const purchaseorder = await Purchaseorder.findOne({
          _id: purchaseorderId,
        });

        if (!purchaseorder) {
          throw new Error("Purchase order not found");
        }

        // Filter out deleted items
        if (purchaseorder.items && Array.isArray(purchaseorder.items)) {
          const purchaseorderObj = purchaseorder.toObject();
          purchaseorderObj.items = purchaseorderObj.items.filter(
            (item) => !item.isDeleted
          );
          return purchaseorderObj;
        }

        return purchaseorder;
      } catch (error) {
        console.error("Error fetching purchaseorder, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    purchaseorderItems: async (_, { purchaseorderId }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // Query the separate collection instead of embedded documents
        return await PurchaseOrderItems.find({
          ponumber: purchaseorderId,
          isDeleted: false,
        });
      } catch (error) {
        console.error("Error fetching purchaseorder items:", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },
  // Add this field resolver to connect purchase orders with their items
  Purchaseorder: {
    items: async (parent) => {
      try {
        return await PurchaseOrderItems.find({
          ponumber: parent._id,
          isDeleted: false,
        });
      } catch (error) {
        console.error("Error fetching purchase order items:", error);
        throw new Error("Failed to load purchase order items");
      }
    },
  },
  Mutation: {
    addPurchaseorder: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // Check if a purchase order with the same ponumber already exists
        if (input.ponumber) {
          const existingPO = await Purchaseorder.findOne({
            ponumber: input.ponumber,
            isDeleted: false, // Only check against active POs
          });

          if (existingPO) {
            throw new Error(
              `Purchase order with number ${input.ponumber} already exists`
            );
          }
        }

        // If no duplicate, create new purchase order
        const newPurchaseorder = new Purchaseorder({
          ...input,
          // userId: context.getUser()._id,
        });

        const savedPurchaseorder = await newPurchaseorder.save();
        return savedPurchaseorder;
      } catch (error) {
        console.error("Error adding purchase order:", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    updatePurchaseorder: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        const { purchaseorderId, ...update } = input;
        const updatedPurchaseorder = await Purchaseorder.findByIdAndUpdate(
          purchaseorderId,
          update,
          { new: true }
        );
        return updatedPurchaseorder;
      } catch (error) {
        console.error("Error updating purchaseorder, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    deletePurchaseorder: async (_, { purchaseorderId }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // First update the purchase order
        const deletedPurchaseorder = await Purchaseorder.findOneAndUpdate(
          { _id: purchaseorderId },
          { isDeleted: true },
          { new: true }
        );

        // Also update all related items to be soft-deleted
        await PurchaseOrderItems.updateMany(
          { ponumber: purchaseorderId },
          { isDeleted: true }
        );

        return deletedPurchaseorder;
      } catch (error) {
        console.error("Error deleting purchaseorder, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    reactivatePurchaseorder: async (_, { purchaseorderId }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // First update the purchase order
        const reactivatedPurchaseorder = await Purchaseorder.findOneAndUpdate(
          { _id: purchaseorderId },
          { isDeleted: false },
          { new: true }
        );

        // Also update all related items to be restored
        await PurchaseOrderItems.updateMany(
          { ponumber: purchaseorderId },
          { isDeleted: false }
        );

        return reactivatedPurchaseorder;
      } catch (error) {
        console.error("Error reactivating purchaseorder, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    addPurchaseorderItem: async (_, { purchaseorderId, item }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // Create new item in the separate collection
        const newItem = new PurchaseOrderItems({
          ...item,
          ponumber: purchaseorderId,
        });

        await newItem.save();

        // Add the item reference to the purchase order
        const purchaseorder = await Purchaseorder.findByIdAndUpdate(
          purchaseorderId,
          { $push: { items: newItem._id } },
          { new: true }
        );

        return purchaseorder;
      } catch (error) {
        console.error("Error adding purchaseorder item:", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    updatePurchaseorderItem: async (_, { purchaseorderId, item }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // Update the item in its collection
        await PurchaseOrderItems.findByIdAndUpdate(item._id, item);

        // Return the updated purchase order
        const purchaseorder = await Purchaseorder.findById(purchaseorderId);
        return purchaseorder;
      } catch (error) {
        console.error("Error updating purchaseorder item, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    deletePurchaseorderItem: async (_, { purchaseorderId, item }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }

        // Soft delete the item in its collection
        await PurchaseOrderItems.findByIdAndUpdate(
          item._id,
          { isDeleted: true },
          { new: true }
        );

        // Return the updated purchase order
        const purchaseorder = await Purchaseorder.findById(purchaseorderId);
        return purchaseorder;
      } catch (error) {
        console.error("Error soft-deleting purchaseorder item, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },
};

export default purchaseorderResolver;
