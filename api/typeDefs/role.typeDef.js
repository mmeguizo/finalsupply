const roleTypeDef = `#graphql

type Role {
    id: ID!  # Changed _id to id for Sequelize
    name: String!
    description: String
    is_active: Boolean!
}

input CreateRoleInput {
    name: String!
    description: String
}   

input UpdateRoleInput {
    id: ID!
    name: String
    description: String
    is_active: Boolean
}

type Query {
    roles: [Role!]
    role(id: ID!): Role
    countAllRoles : Int
}

type Mutation {
    createRole(input: CreateRoleInput!): Role
    updateRole(input: UpdateRoleInput!): Role
    deleteRole(id: ID!): Role
}


`;

export default roleTypeDef;