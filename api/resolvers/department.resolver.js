import Department from '../models/department.js';
import { requireAuthenticated, requireRole } from '../auth/authorization.js';

const departmentResolver = {
  Query: {
    departments: async (_, __, context) => {
      requireAuthenticated(context);
      return await Department.findAll({
        where: { is_active: true },
      });
    },

    department: async (_, { id }, context) => {
      requireAuthenticated(context);
      return await Department.findByPk(id);
    },
  },

  Mutation: {
    createDepartment: async (_, { input }, context) => {
      requireRole(context, 'admin');
      try {
        const { name, description } = input;

        if (!name) {
          throw new Error('Department name is required');
        }

        const existingDepartment = await Department.findOne({ where: { name } });
        if (existingDepartment) {
          throw new Error('Department with this name already exists');
        }

        return await Department.create({ name, description, is_active: true });
      } catch (error) {
        console.error('Error creating department:', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    updateDepartment: async (_, { input }, context) => {
      requireRole(context, 'admin');
      try {
        const { id, name, description } = input;

        const departmentToUpdate = await Department.findByPk(id);
        if (!departmentToUpdate) {
          throw new Error('Department not found');
        }

        if (name && name !== departmentToUpdate.name) {
          const existingDepartment = await Department.findOne({ where: { name } });
          if (existingDepartment) {
            throw new Error('Department name already exists');
          }
        }

        await Department.update({ name, description }, { where: { id } });
        return await Department.findByPk(id);
      } catch (error) {
        console.error('Error updating department:', error);
        throw new Error(error.message || 'Internal server error');
      }
    },

    deleteDepartment: async (_, { id }, context) => {
      requireRole(context, 'admin');
      try {
        const department = await Department.findByPk(id);
        if (!department) {
          throw new Error('Department not found');
        }

        department.is_active = false;
        await department.save();

        return department;
      } catch (error) {
        console.error('Error deleting department:', error);
        throw new Error(error.message || 'Internal server error');
      }
    },
  },
};

export default departmentResolver;
