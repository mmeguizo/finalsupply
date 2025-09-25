import { Op } from 'sequelize';
import Role from '../models/role.js';

const roleResolver = {
  Query: {
    roles: async () => {
      console.log('[role.resolver] roles resolver called');
      try {
        if (!Role || typeof Role.findAll !== 'function') {
          console.warn('[role.resolver] Role model missing or invalid, returning empty array');
          return [];
        }

        const roles = await Role.findAll({
          where: {
            [Op.and]: [
              { is_active: true }, // boolean column we just added via migration/model
              { isDeleted: 0 } // model field name (maps to is_deleted due to underscored: true)
            ]
          },
          order: [["name", "ASC"]]
        });

        console.log('[role.resolver] roles fetched:', Array.isArray(roles) ? roles.length : 'no-array');
        return Array.isArray(roles) ? roles : [];
      } catch (err) {
        console.error('[role.resolver] roles query error:', err);
        return []; // never return null for non-nullable field
      }
    },

    role: async (_, { id }) => {
      try {
        const r = await Role.findByPk(id);
        return r || null;
      } catch (err) {
        console.error('role query error:', err);
        // return null for single item queries
        return null;
      }
    },

    countAllRoles: async () => {
      try {
        return await Role.count({
          where: {
            [Op.and]: [
              { is_active: true },
              { isDeleted: 0 }
            ]
          }
        });
      } catch (err) {
        console.error('countAllRoles query error:', err);
        return 0;
      }
    }
  },

  Mutation: {
    addRole: async (_, { input }) => {
      try {
        const payload = { ...input };
        if (payload.is_active === undefined) payload.is_active = true;
        if (payload.isDeleted === undefined) payload.isDeleted = 0;
        const role = await Role.create(payload);
        return role;
      } catch (err) {
        console.error('addRole mutation error:', err);
        throw new Error('Failed to create role');
      }
    },

    updateRole: async (_, { input }) => {
      try {
        const { id, ...updateData } = input;
        const role = await Role.findByPk(id);
        if (!role) throw new Error('Role not found');
        await role.update(updateData);
        return role;
      } catch (err) {
        console.error('updateRole mutation error:', err);
        throw new Error('Failed to update role');
      }
    },

    deleteRole: async (_, { id }) => {
      try {
        const role = await Role.findByPk(id);
        if (!role) throw new Error('Role not found');

        // Always use soft delete: set isDeleted = 1
        await role.update({ isDeleted: 1 });

        // Optionally also set is_active = false if the column exists
        if (Object.prototype.hasOwnProperty.call(role.dataValues, 'is_active')) {
          await role.update({ is_active: false });
        }

        return true;
      } catch (err) {
        console.error('deleteRole mutation error:', err);
        throw new Error('Failed to delete role');
      }
    }
  }
};

export default roleResolver;