const departmentTypeDef = `#graphql

type Department {
  id: ID!
  name: String!
  description: String
  is_active: Boolean!
  created_at: String
  updated_at: String
}

extend type Query {
  departments: [Department!]
  department(id: ID!): Department
}

extend type Mutation {
  createDepartment(input: DepartmentInput!): Department
  updateDepartment(input: UpdateDepartmentInput!): Department
  deleteDepartment(id: ID!): Department
}

input DepartmentInput {
  name: String!
  description: String
}

input UpdateDepartmentInput {
  id: ID!
  name: String
  description: String
}
`;

export default departmentTypeDef;