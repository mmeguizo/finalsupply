import Signatory from "../models/signatory.js";
import PurchaseOrder from "../models/purchaseorder.js";

const signatoryResolver = {
  Query: {
    signatories: async (_, __, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        
        // Fetch all signatories using Sequelize
        const signatories = await Signatory.findAll({
          where: { isDeleted: false }, // Only get active signatories
          order: [["createdAt", "DESC"]], // Sort by date descending
        });
        return signatories;
      } catch (error) {
        console.error("Error fetching signatories: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    signatory: async (_, { id }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        
        // Fetch a single signatory by ID
        const signatory = await Signatory.findOne({
          where: { id, isDeleted: false },
        });
        
        if (!signatory) {
          throw new Error("Signatory not found");
        }
        
        return signatory;
      } catch (error) {
        console.error("Error fetching signatory: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    signatoryByPurchaseOrder: async (_, { purchaseOrderId }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        
        // Fetch signatories by purchase order ID
        const signatories = await Signatory.findAll({
          where: { purchaseOrderId, isDeleted: false },
          order: [["createdAt", "DESC"]],
        });
        
        return signatories;
      } catch (error) {
        console.error("Error fetching signatories by purchase order: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },

  Mutation: {
    addSignatory: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        
        // Create new signatory
        const newSignatory = await Signatory.create({
          ...input,
        });
        
        return newSignatory;
      } catch (error) {
        console.error("Error adding signatory: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    updateSignatory: async (_, { input }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        
        const { id, ...updates } = input;
        
        // Check if the signatory exists
        const signatory = await Signatory.findOne({ 
          where: { id, isDeleted: false } 
        });
        
        if (!signatory) {
          throw new Error("Signatory not found");
        }
        
        // Update the signatory
        await Signatory.update(updates, {
          where: { id },
        });
        
        // Return the updated signatory
        return await Signatory.findOne({ where: { id } });
      } catch (error) {
        console.error("Error updating signatory: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    deleteSignatory: async (_, { id }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        
        // Check if the signatory exists
        const signatory = await Signatory.findOne({ 
          where: { id, isDeleted: false } 
        });
        
        if (!signatory) {
          throw new Error("Signatory not found");
        }
        
        // Soft delete the signatory
        await Signatory.update(
          { isDeleted: true },
          { where: { id } }
        );
        
        // Return the deleted signatory
        return signatory;
      } catch (error) {
        console.error("Error deleting signatory: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },

    reactivateSignatory: async (_, { id }, context) => {
      try {
        if (!context.isAuthenticated()) {
          throw new Error("Unauthorized");
        }
        
        // Check if the signatory exists and is deleted
        const signatory = await Signatory.findOne({ 
          where: { id, isDeleted: true } 
        });
        
        if (!signatory) {
          throw new Error("Deleted signatory not found");
        }
        
        // Reactivate the signatory
        await Signatory.update(
          { isDeleted: false },
          { where: { id } }
        );
        
        // Return the reactivated signatory
        return await Signatory.findOne({ where: { id } });
      } catch (error) {
        console.error("Error reactivating signatory: ", error);
        throw new Error(error.message || "Internal server error");
      }
    },
  },

  // Field resolvers
  Signatory: {
    purchaseOrder: async (parent) => {
      try {
        if (parent.purchaseOrderId) {
          return await PurchaseOrder.findOne({
            where: { id: parent.purchaseOrderId },
          });
        }
        return null;
      } catch (error) {
        console.error("Error fetching purchase order for signatory:", error);
        throw new Error("Failed to load purchase order");
      }
    },
  },
};

export default signatoryResolver;
