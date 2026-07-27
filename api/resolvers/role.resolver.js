import { Op } from 'sequelize';
import Role from '../models/role.js';
import { requireRole } from '../auth/authorization.js';

const roleResolver = {
  Query: {
    roles: async (_, __, context) => {
      requireRole(context, 'admin', 'user');
      try {
        const roles = await Role.findAll({
          where: {
            [Op.and]: [
              { is_active: true },
              { isDeleted: 0 },
            ],
          },
          order: [['name', 'ASC']],
        });
        return Array.isArray(roles) ? roles : [];
      } catch (err) {
        console.error('[role.resolver] roles query error:', err);
        return [];
      }
    },

    role: async (_, { id }, context) => {
      requireRole(context, 'admin', 'user');
      try {
        return await Role.findByPk(id);
      } catch (err) {
        console.error('role query error:', err);
        return null;
      }
    },

    countAllRoles: async (_, __, context) => {
      requireRole(context, 'admin', 'user');
      try {
        return await Role.count({
          where: {
            [Op.and]: [{ is_active: true }, { isDeleted: 0 }],
          },
        });
      } catch (err) {
        console.error('countAllRoles query error:', err);
        return 0;
      }
    },
  },

  Mutation: {
    addRole: async (_, { input }, context) => {
      requireRole(context, 'admin');
      try {
        const payload = { ...input };
        if (payload.is_active === undefined) payload.is_active = true;
        if (payload.isDeleted === undefined) payload.isDeleted = 0;
        return await Role.create(payload);
      } catch (err) {
        console.error('addRole mutation error:', err);
        throw new Error('Failed to create role');
      }
    },

    updateRole: async (_, { input }, context) => {
      requireRole(context, 'admin');
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

    deleteRole: async (_, { id }, context) => {
      requireRole(context, 'admin');
      try {
        const role = await Role.findByPk(id);
        if (!role) throw new Error('Role not found');

        await role.update({ isDeleted: 1 });

        if (Object.prototype.hasOwnProperty.call(role.dataValues, 'is_active')) {
          await role.update({ is_active: false });
        }

        return true;
      } catch (err) {
        console.error('deleteRole mutation error:', err);
        throw new Error('Failed to delete role');
      }
    },
  },
};

export default roleResolver;
