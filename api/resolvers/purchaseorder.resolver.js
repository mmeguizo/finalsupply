import Purchaseorder from "../models/purchaseorder.js";
import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Add this import

const purchaseorderResolver = {
  Query: {
    purchaseorders: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        // Simply return the purchase orders without any item filtering
        const purchaseorders = await Purchaseorder.find({
          isDeleted: false,
        }).sort({ date: -1 });

        return purchaseorders; // No need for filteredPurchaseorders
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
        // if (purchaseorder.items && Array.isArray(purchaseorder.items)) {
        //   const purchaseorderObj = purchaseorder.toObject();
        //   purchaseorderObj.items = purchaseorderObj.items.filter(
        //     (item) => !item.isDeleted
        //   );
        //   return purchaseorderObj;
        // }

        return purchaseorder;
      } catch (error) {
        console.error("Error fetching purchaseorder, error: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
    // redundant query since we can use field resolvers
    // purchaseorderItems: async (_, { purchaseorderId }, context) => {
    //   try {
    //     if (!context.isAuthenticated()) {
    //       throw new Error("Unauthorized");
    //     }
    //     // Query the separate collection instead of embedded documents
    //     return await PurchaseOrderItems.find({
    //       ponumber: purchaseorderId,
    //       isDeleted: false,
    //     });
    //   } catch (error) {
    //     console.error("Error fetching purchaseorder items:", error);
    //     throw new Error(error.message || "Internal server error");
    //   }
    // },
  },
  // Add this field resolver to connect purchase orders with their items
  Purchaseorder: {
    items: async (parent) => {
      console.log(`items  for PO: ${parent._id}`);
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
    amount: async (parent) => {
      console.log(`Calculating amount for PO: ${parent._id}`);
      try {
        const items = await PurchaseOrderItems.find({
          ponumber: parent._id,
          isDeleted: false,
        });

        console.log(`Found ${items.length} items for PO: ${parent._id}`);

        const total = items.reduce((sum, item) => {
          console.log(`Adding item amount: ${item.amount}`);
          return sum + (Number(item.amount) || 0);
        }, 0);

        console.log(`Total calculated: ${total}`);
        return total;
      } catch (error) {
        console.error(`ERROR calculating amount for PO: ${parent._id}`, error);
        return parent.amount || 0;
      }
    },
  },
  Mutation: {
    addPurchaseorder: async (_, { input }, context) => {
      try {
        const { items, ...poRestData } = input;

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
          ...poRestData,
          // userId: context.getUser()._id,
        });

        const savedPurchaseorder = await newPurchaseorder.save();

        // Handle items if provided
        if (items && Array.isArray(items)) {
          for (const item of items) {
            const newItem = new PurchaseOrderItems({
              ...item,
              ponumber: savedPurchaseorder._id,
            });
            await newItem.save();
          }
        }
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

        // Extract fields
        const { purchaseorderId, items, ...poUpdates } = input;

        // 1. Update the purchase order document
        const updatedPurchaseorder = await Purchaseorder.findByIdAndUpdate(
          purchaseorderId,
          poUpdates,
          { new: true }
        );

        // 2. Handle items if provided
        if (items && Array.isArray(items)) {
          // Get existing items
          const existingItems = await PurchaseOrderItems.find({
            ponumber: purchaseorderId,
            isDeleted: false,
          });

          // Process each incoming item
          for (const item of items) {
            if (item._id) {
              // Update existing item
              await PurchaseOrderItems.findByIdAndUpdate(
                item._id,
                { ...item, ponumber: purchaseorderId },
                { new: true }
              );
            } else {
              // Create new item
              const newItem = new PurchaseOrderItems({
                ...item,
                ponumber: purchaseorderId,
              });
              await newItem.save();
            }
          }

          // Optional: Remove items not in the updated list (soft delete)
          if (items.length > 0) {
            const updatedItemIds = items
              .filter((item) => item._id)
              .map((item) => item._id);

            await PurchaseOrderItems.updateMany(
              {
                ponumber: purchaseorderId,
                _id: { $nin: updatedItemIds },
                isDeleted: false,
              },
              { isDeleted: true }
            );
          }
        }

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

        // No need to update the purchase order if using field resolvers
        // Simply return the purchase order
        return await Purchaseorder.findById(purchaseorderId);
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
