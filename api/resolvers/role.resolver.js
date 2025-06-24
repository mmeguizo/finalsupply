import { where } from 'sequelize';

const  Role  = require('../models/role.model');

const roleResolver = {

    Query: {
        roles: async () => {
            const roles = await Role.findAll({
                where :{
                    is_active: true // Fetch only active roles
                }
            });
            return roles;
        },
        role: async (_, { id }) => {
            const role = await Role.findByPk(id);
            return role;
        },
        countAllRoles: async () => {
            const count = await Role.count({
                where :{
                    is_active: true // Fetch only active roles
                }
            });
            return count;
        }
    },
    Mutation: {
        createRole: async (_, { input }) => {
            const role = await Role.create(input);
            return role;
        },
        updateRole: async (_, { input }) => {
            const { id, ...updateData } = input;
            const role = await Role.findByPk(id);
            if (!role) {
                throw new Error('Role not found');
            }
            await role.update(updateData);
            return role;
        },
        deleteRole: async (_, { id }) => {
            const role = await Role.findByPk(id);
            if (!role) {
                throw new Error('Role not found');
            }
            await role.destroy();
            return role;
        }
    }

};

export default roleResolver;