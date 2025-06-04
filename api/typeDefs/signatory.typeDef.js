const signatoryTypeDef = `#graphql
  type Signatory {
    id: ID!
    name: String!
    role: String!
    purchaseOrderId: Int
    isDeleted: Boolean
    createdAt: String
    updatedAt: String
    purchaseOrder: PurchaseOrder
  }

  input SignatoryInput {
    name: String!
    role: String!
    purchaseOrderId: Int
  }

  input UpdateSignatoryInput {
    id: Int!
    name: String
    role: String
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
