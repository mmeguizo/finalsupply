const signatoryTypeDef = `#graphql
  type Signatory {
    id: ID!
    name: String!
    role: String        # keep role string for backward compatibility
    roleId: Int        # foreign key reference to Role table
    purchaseOrderId: Int
    isDeleted: Boolean
    createdAt: String
    updatedAt: String
    purchaseOrder: PurchaseOrder
    roleDetail: Role   # optional populated Role object (requires resolver to include)
  }

  input SignatoryInput {
    name: String!
    role: String      # optional; can be set from selected Role
    roleId: Int       # prefer sending roleId from client
    purchaseOrderId: Int
  }

  input UpdateSignatoryInput {
    id: Int!
    name: String
    role: String
    roleId: Int
    purchaseOrderId: Int
  }

  type Query {
    signatories: [Signatory!]
    signatory(id: ID!): Signatory
    signatoryByPurchaseOrder(purchaseOrderId: ID!): [Signatory!]
  }

  type Mutation {
    addSignatory(input: SignatoryInput!): Signatory
    updateSignatory(input: UpdateSignatoryInput!): Signatory
    deleteSignatory(id: ID!): Signatory
    reactivateSignatory(id: ID!): Signatory
  }
`;

export default signatoryTypeDef;
