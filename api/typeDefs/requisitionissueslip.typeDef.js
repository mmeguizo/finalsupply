const requisitionIssueSlipTypeDef = `#graphql
scalar JSON



type Item {
    id: ID!
    itemName: String
    inspectionAcceptanceReportId: String
    description: String
    unit: String
    quantity: Int
    unitCost: Float
    amount: Float
    category: String
    isDeleted: Boolean
    date: String
    actualQuantityReceived: Int
    tag : String
    iarId : String
}

type PurchaseOrderType {
    poNumber: String
    supplier: String
    address: String
    modeOfProcurement: String
    email: String
    telephone: String
    placeOfDelivery: String
    dateOfDelivery: String
    dateOfPayment: String
    deliveryTerms: String
    paymentTerms: String
    amount: Float
    category: String
    status: String
    invoice: String
    campus: String
}

type PurchaseOrderItemType {
    id: ID!
    purchaseOrderId: String!
    itemName: String!
    description: String
    generalDescription : String
    specification: String
    unit: String
    quantity: Int
    unitCost: Float
    amount: Float
    category: String
    isDeleted: Boolean
    actualQuantityReceived: Int
    currentInput: Int
}


type ItemWithPurchaseOrder {
    id: ID
    itemName: String
    purchaseOrderId: String
    description: String
    unit: String
    quantity: Int
    unitCost: Float
    amount: Float
    category: String
    isDeleted: Boolean
    actualQuantityReceived: Int
    currentInput: Int
    PurchaseOrder: PurchaseOrderType
    PurchaseOrderItem: PurchaseOrderItemType
    tag : String
    iarId : String
    icsId : String
    risId : String
    parId : String
    income: String
    mds: String
    details: String
    inventoryNumber: String
    # RIS signatory fields
    risReceivedFrom: String
    risReceivedFromPosition: String
    risReceivedBy: String
    risReceivedByPosition: String
    risDepartment: String
    risAssignedDate: String
    splitGroupId: String
    splitFromItemId: Int
    splitIndex: Int
}


#INPUTS

# input later
input ItemInput {
    id: ID!
    itemName: String
    inspectionAcceptanceReportId: String
    description: String
    unit: String
    quantity: Int
    unitCost: Float
    amount: Float
    category: String
    isDeleted: Boolean
    date: String
    actualQuantityReceived: Int
    tag : String
    iarId : String
    inventoryNumber: String
}


# New input type focused on the specific update need
input RISUpdateInput {
  ids: [ID!]!
}

# RIS Split & Assign types
input RISSplitEntry {
  quantity: Int!
  department: String
  receivedFrom: String!
  receivedFromPosition: String
  receivedBy: String!
  receivedByPosition: String
}

input RISItemSplit {
  itemId: ID!
  splits: [RISSplitEntry!]!
}

input SplitAndAssignRISInput {
  itemSplits: [RISItemSplit!]!
}

# Input for creating a single RIS assignment (saves immediately)
input CreateSingleRISInput {
  sourceItemId: ID!
  quantity: Int!
  department: String
  receivedFrom: String!
  receivedFromPosition: String
  receivedBy: String!
  receivedByPosition: String
}

# Input for updating an existing RIS assignment
input UpdateRISAssignmentInput {
  itemId: ID!
  quantity: Int
  department: String
  receivedFrom: String
  receivedFromPosition: String
  receivedBy: String
  receivedByPosition: String
}

# Response type for single RIS creation
type CreateRISResponse {
  newItem: ItemWithPurchaseOrder!
  sourceItem: ItemWithPurchaseOrder!
  generatedRisId: String!
}

# Multi-item RIS assignment types
input MultiRISItemEntry {
  sourceItemId: ID!
  quantity: Int!
}

input CreateMultiItemRISInput {
  items: [MultiRISItemEntry!]!
  department: String
  receivedFrom: String!
  receivedFromPosition: String
  receivedBy: String!
  receivedByPosition: String
}

input AddItemToExistingRISInput {
  sourceItemId: ID!
  quantity: Int!
  existingRisId: String!
}

type CreateMultiRISResponse {
  newItems: [ItemWithPurchaseOrder!]!
  sourceItems: [ItemWithPurchaseOrder!]!
  generatedRisId: String!
}

type AddItemToExistingRISResponse {
  newItem: ItemWithPurchaseOrder!
  sourceItem: ItemWithPurchaseOrder!
  risId: String!
}

type Query {
    requisitionIssueSlip: [ItemWithPurchaseOrder!]
    requisitionIssueSlipForView: [ItemWithPurchaseOrder!]
}

type Mutation {
  # Updated mutation that accepts the simplified input
  updateRISInventoryIDs(input: RISUpdateInput!): [ItemWithPurchaseOrder]
  # Split items by quantity and assign separate RIS IDs with signatories
  splitAndAssignRIS(input: SplitAndAssignRISInput!): [ItemWithPurchaseOrder]
  # Create a single RIS assignment (saves immediately, clones from source)
  createSingleRISAssignment(input: CreateSingleRISInput!): CreateRISResponse!
  # Create a multi-item RIS assignment (multiple items share one RIS ID)
  createMultiItemRISAssignment(input: CreateMultiItemRISInput!): CreateMultiRISResponse!
  # Add an item to an existing RIS ID
  addItemToExistingRIS(input: AddItemToExistingRISInput!): AddItemToExistingRISResponse!
  # Update an existing RIS assignment
  updateRISAssignment(input: UpdateRISAssignmentInput!): ItemWithPurchaseOrder!
}


`;

export default requisitionIssueSlipTypeDef;
