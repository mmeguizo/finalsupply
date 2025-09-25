

const roleTypeDef = `#graphql
  type Role {
    id: ID!
    name: String!
    description: String
    isDeleted: Boolean
    createdAt: String
    updatedAt: String
  }

  input AddRoleInput {
    name: String!
    description: String
  }

  input UpdateRoleInput {
    id: ID!
    name: String
    description: String
    isDeleted: Boolean
  }

  extend type Query {
    roles: [Role!]!
    role(id: ID!): Role
    countAllRoles: Int!   # add this to match resolver
  }

  extend type Mutation {
    addRole(input: AddRoleInput!): Role!
    updateRole(input: UpdateRoleInput!): Role!
    deleteRole(id: ID!): Boolean!
  }
`;

export default roleTypeDef;
