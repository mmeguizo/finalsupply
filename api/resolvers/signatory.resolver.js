import Signatory from '../models/signatory.js';
import PurchaseOrder from '../models/purchaseorder.js';
import { requireAuthenticated, requireRole } from '../auth/authorization.js';

const signatoryResolver = {
  Query: {
    signatories: async (_, __, context) => {
      requireAuthenticated(context);
      try {
        return await Signatory.findAll({
          where: { isDeleted: false },
          order: [['createdAt', 'DESC']],
        });
      } catch (error) {
        console.error('Error fetching signatories: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    signatory: async (_, { id }, context) => {
      requireAuthenticated(context);
      try {
        const signatory = await Signatory.findOne({
          where: { id, isDeleted: false },
        });

        if (!signatory) {
          throw new Error('Signatory not found');
        }

        return signatory;
      } catch (error) {
        console.error('Error fetching signatory: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    signatoryByPurchaseOrder: async (_, { purchaseOrderId }, context) => {
      requireAuthenticated(context);
      try {
        return await Signatory.findAll({
          where: { purchaseOrderId, isDeleted: false },
          order: [['createdAt', 'DESC']],
        });
      } catch (error) {
        console.error('Error fetching signatories by purchase order: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },
  },

  Mutation: {
    addSignatory: async (_, { input }, context) => {
      requireRole(context, 'admin');
      try {
        return await Signatory.create({ ...input });
      } catch (error) {
        console.error('Error adding signatory: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    updateSignatory: async (_, { input }, context) => {
      requireRole(context, 'admin');
      try {
        const { id, ...updates } = input;

        const signatory = await Signatory.findOne({
          where: { id, isDeleted: false },
        });

        if (!signatory) {
          throw new Error('Signatory not found');
        }

        await Signatory.update(updates, { where: { id } });
        return await Signatory.findOne({ where: { id } });
      } catch (error) {
        console.error('Error updating signatory: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    deleteSignatory: async (_, { id }, context) => {
      requireRole(context, 'admin');
      try {
        const signatory = await Signatory.findOne({
          where: { id, isDeleted: false },
        });

        if (!signatory) {
          throw new Error('Signatory not found');
        }

        await Signatory.update({ isDeleted: true }, { where: { id } });
        return signatory;
      } catch (error) {
        console.error('Error deleting signatory: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    reactivateSignatory: async (_, { id }, context) => {
      requireRole(context, 'admin');
      try {
        const signatory = await Signatory.findOne({
          where: { id, isDeleted: true },
        });

        if (!signatory) {
          throw new Error('Deleted signatory not found');
        }

        await Signatory.update({ isDeleted: false }, { where: { id } });
        return await Signatory.findOne({ where: { id } });
      } catch (error) {
        console.error('Error reactivating signatory: ', error);
        throw new Error(error.message || 'Internal server error');
      }
    },
  },

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
        console.error('Error fetching purchase order for signatory:', error);
        throw new Error('Failed to load purchase order');
      }
    },
  },
};

export default signatoryResolver;
