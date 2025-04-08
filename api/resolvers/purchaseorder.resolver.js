import  PurchaseOrder  from "../models/purchaseorder.js"; // Import the Sequelize models
import  PurchaseOrderItems  from "../models/purchaseorderitems.js"; // Import the Sequelize models

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
          order: [['createdAt', 'DESC']], // Sort by date descending
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
          order: [['createdAt', 'DESC']],
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
          order: [['createdAt', 'DESC']],
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
          where: { ponumber: input.ponumber, isDeleted: false },
        });

        if (existingPO) {
          throw new Error(`Purchase order with number ${input.ponumber} already exists`);
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

        const { purchaseorderId, items, ...poUpdates } = input;

        // Update the purchase order details
        const updatedPurchaseorder = await PurchaseOrder.update(poUpdates, {
          where: { id: purchaseorderId },
          returning: true, // Fetch the updated purchase order
        });

        if (!updatedPurchaseorder[0]) {
          throw new Error("Purchase order not found");
        }

        // Handle items if provided
        if (items && Array.isArray(items)) {
          for (const item of items) {
            if (item.id) {
              // Update existing item
              await PurchaseOrderItems.update(item, {
                where: { id: item.id, purchaseOrderId: purchaseorderId },
                returning: true,
              });
            } else {
              // Create new item if the item does not have an id
              await PurchaseOrderItems.create({
                ...item,
                purchaseOrderId: purchaseorderId,
              });
            }
          }
        }

        // Return the updated purchase order
        return updatedPurchaseorder[1][0]; // Get the updated object
      } catch (error) {
        console.error("Error updating purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },
};

export default purchaseorderResolver;


// import Purchaseorder from "../models/purchaseorder.js";
// import PurchaseOrderItems from "../models/purchaseorderitems.js"; // Add this import

// const purchaseorderResolver = {
//   Query: {
//     purchaseorders: async (_, __, context) => {
//       try {
//         if (!context.isAuthenticated()) {
//           throw new Error("Unauthorized");
//         }
//         // Simply return the purchase orders without any item filtering
//         const purchaseorders = await Purchaseorder.find({
//           isDeleted: false,
//         }).sort({ date: -1 });

//         return purchaseorders; // No need for filteredPurchaseorders
//       } catch (error) {
//         console.error("Error fetching purchaseorders, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     purchaseordersItems: async (_, __, context) => {
//       try {
//         if (!context.isAuthenticated()) {
//           throw new Error("Unauthorized");
//         }
//         const purchaseordersItems = await PurchaseOrderItems.find({
//           isDeleted: false,
//         }).sort({ date: -1 });

//         return purchaseordersItems;
//       } catch (error) {
//         console.error("Error fetching purchaseorders, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     purchaseorder: async (_, { purchaseorderId }, context) => {
//       try {
//         if (!context.isAuthenticated()) {
//           throw new Error("Unauthorized");
//         }
//         const purchaseorder = await Purchaseorder.findOne({
//           _id: purchaseorderId,
//         });

//         if (!purchaseorder) {
//           throw new Error("Purchase order not found");
//         }
//         return purchaseorder;
//       } catch (error) {
//         console.error("Error fetching purchaseorder, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//   },
//   // Add this field resolver to connect purchase orders with their items
//   Purchaseorder: {
//     items: async (parent) => {
//       console.log(`items  for PO: ${parent._id}`);
//       try {
//         return await PurchaseOrderItems.find({
//           ponumber: parent._id,
//           isDeleted: false,
//         });
//       } catch (error) {
//         console.error("Error fetching purchase order items:", error);
//         throw new Error("Failed to load purchase order items");
//       }
//     },
//     amount: async (parent) => {
//       console.log(`Calculating amount for PO: ${parent._id}`);
//       try {
//         const items = await PurchaseOrderItems.find({
//           ponumber: parent._id,
//           isDeleted: false,
//         });

//         console.log(`Found ${items.length} items for PO: ${parent._id}`);

//         const total = items.reduce((sum, item) => {
//           console.log(`Adding item amount: ${item.amount}`);
//           return sum + (Number(item.amount) || 0);
//         }, 0);

//         console.log(`Total calculated: ${total}`);
//         return total;
//       } catch (error) {
//         console.error(`ERROR calculating amount for PO: ${parent._id}`, error);
//         return parent.amount || 0;
//       }
//     },
//   },
//   Mutation: {
//     addPurchaseorder: async (_, { input }, context) => {
//       try {
//         const { items, ...poRestData } = input;

//         if (!context.isAuthenticated()) {
//           throw new Error("Unauthorized");
//         }

//         // Check if a purchase order with the same ponumber already exists
//         if (input.ponumber) {
//           const existingPO = await Purchaseorder.findOne({
//             ponumber: input.ponumber,
//             isDeleted: false, // Only check against active POs
//           });

//           if (existingPO) {
//             throw new Error(
//               `Purchase order with number ${input.ponumber} already exists`
//             );
//           }
//         }

//         // If no duplicate, create new purchase order
//         const newPurchaseorder = new Purchaseorder({
//           ...poRestData,
//           // userId: context.getUser()._id,
//         });

//         const savedPurchaseorder = await newPurchaseorder.save();

//         // Handle items if provided
//         if (items && Array.isArray(items)) {
//           for (const item of items) {
//             const newItem = new PurchaseOrderItems({
//               ...item,
//               ponumber: savedPurchaseorder._id,
//             });
//             await newItem.save();
//           }
//         }
//         return savedPurchaseorder;
//       } catch (error) {
//         console.error("Error adding purchase order:", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     updatePurchaseorder: async (_, { input }, context) => {
//       try {
//         if (!context.isAuthenticated()) {
//           throw new Error("Unauthorized");
//         }
//         // Extract fields
//         const { purchaseorderId, items, ...poUpdates } = input;

//         //get current items length for specific po
//         const currentItemsLength = await PurchaseOrderItems.find({
//           ponumber: purchaseorderId,
//           isDeleted: false,
//         });

//         // 1. Update the purchase order document
//         const updatedPurchaseorder = await Purchaseorder.findByIdAndUpdate(
//           purchaseorderId,
//           poUpdates,
//           { new: true }
//         );

//         // 2. Handle items if provided
//         if (items && Array.isArray(items)) {
//           // Process each incoming item
//           //remove the actualquantityrecieved

//           for (const item of items) {
//             if (item._id) {
//               // const increment = item.actualquantityrecieved;
//               //delete the actualquantityrecieved in the items array since we do not need to update it
//               // delete item.actualquantityrecieved;
//               // console.log(item);
//               // Update existing item
//               // console.log({ updatedFields });
//               // console.log({ actualquantityrecieved });
//               // console.log({ oldupdateitem: item });
//               //so we can increment it if not removed apollo will have error
//               // Update existing item
//               const { currentInput, ...updatedFields } = item;
//               // console.log("=============================");
//               // console.log({ updatedFields });
//               // console.log({ itemsList: item });
//               // console.log("=============================");
//               console.log(updatedFields);

//               // console.log({ actualquantityrecieved });
//               // console.log("=============================");
//               // console.log({ oldupdateitem: item });
//               // const updateCurrentItem =
//               await PurchaseOrderItems.findByIdAndUpdate(
//                 item._id,
//                 {
//                   ...updatedFields,
//                   ponumber: purchaseorderId,
//                   $inc: { actualquantityrecieved: currentInput },
//                 },
//                 { new: true }
//               );
//               // console.log(updateCurrentItem);
//             } else {
//               // console.log("=============================");

//               // console.log({ newItem: item });
//               // Create new item
//               const newItem = new PurchaseOrderItems({
//                 ...item,
//                 ponumber: purchaseorderId,
//               });
//               await newItem.save();
//               // console.log(newItem);
//             }
//           }

//           // Optional: Remove items not in the updated list (soft delete)
//           // if (
//           //   items.length !== currentItemsLength.length &&
//           //   items.length < currentItemsLength.length
//           // ) {
//           //   const updatedItemIds = items
//           //     .filter((item) => item._id)
//           //     .map((item) => item._id);
//           //  const results  = await PurchaseOrderItems.updateMany(
//           //     {
//           //       ponumber: purchaseorderId,
//           //       _id: { $nin: updatedItemIds },
//           //       isDeleted: false,
//           //     },
//           //     { isDeleted: true }
//           //   );
//           // }
//         }

//         return updatedPurchaseorder;
//       } catch (error) {
//         console.error("Error updating purchaseorder, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     deletePurchaseorder: async (_, { purchaseorderId }, context) => {
//       try {
//         if (!context.isAuthenticated()) {
//           throw new Error("Unauthorized");
//         }

//         // First update the purchase order
//         const deletedPurchaseorder = await Purchaseorder.findOneAndUpdate(
//           { _id: purchaseorderId },
//           { isDeleted: true },
//           { new: true }
//         );

//         // Also update all related items to be soft-deleted
//         await PurchaseOrderItems.updateMany(
//           { ponumber: purchaseorderId },
//           { isDeleted: true }
//         );

//         return deletedPurchaseorder;
//       } catch (error) {
//         console.error("Error deleting purchaseorder, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     reactivatePurchaseorder: async (_, { purchaseorderId }, context) => {
//       try {
//         if (!context.isAuthenticated()) {
//           throw new Error("Unauthorized");
//         }

//         // First update the purchase order
//         const reactivatedPurchaseorder = await Purchaseorder.findOneAndUpdate(
//           { _id: purchaseorderId },
//           { isDeleted: false },
//           { new: true }
//         );

//         // Also update all related items to be restored
//         await PurchaseOrderItems.updateMany(
//           { ponumber: purchaseorderId },
//           { isDeleted: false }
//         );

//         return reactivatedPurchaseorder;
//       } catch (error) {
//         console.error("Error reactivating purchaseorder, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     addPurchaseorderItem: async (_, { purchaseorderId, item }, context) => {
//       try {
//         if (!context.isAuthenticated()) {
//           throw new Error("Unauthorized");
//         }

//         // Create new item in the separate collection
//         const newItem = new PurchaseOrderItems({
//           ...item,
//           ponumber: purchaseorderId,
//         });

//         await newItem.save();

//         // No need to update the purchase order if using field resolvers
//         // Simply return the purchase order
//         return await Purchaseorder.findById(purchaseorderId);
//       } catch (error) {
//         console.error("Error adding purchaseorder item:", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     updatePurchaseorderItem: async (_, { purchaseorderId, item }, context) => {
//       try {
//         if (!context.isAuthenticated()) {
//           throw new Error("Unauthorized");
//         }

//         // Update the item in its collection
//         await PurchaseOrderItems.findByIdAndUpdate(item._id, item);

//         // Return the updated purchase order
//         const purchaseorder = await Purchaseorder.findById(purchaseorderId);
//         return purchaseorder;
//       } catch (error) {
//         console.error("Error updating purchaseorder item, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//     deletePurchaseorderItem: async (_, { purchaseorderId, item }, context) => {
//       try {
//         if (!context.isAuthenticated()) {
//           throw new Error("Unauthorized");
//         }

//         // Soft delete the item in its collection
//         await PurchaseOrderItems.findByIdAndUpdate(
//           item._id,
//           { isDeleted: true },
//           { new: true }
//         );

//         // Return the updated purchase order
//         const purchaseorder = await Purchaseorder.findById(purchaseorderId);
//         return purchaseorder;
//       } catch (error) {
//         console.error("Error soft-deleting purchaseorder item, error: ", error);
//         throw new Error(error.message || "Internal server error");
//       }
//     },
//   },
// };

// export default purchaseorderResolver;
