const propertyAcknowledgementReportTypeDef = `#graphql
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
    inventoryNumber : String
    tag : String
    iarId : String
    icsId : String
    risId : String
    parId : String
    income: String
    details: String
    mds: String
    # PAR signatory fields
    parReceivedFrom: String
    parReceivedFromPosition: String
    parReceivedBy: String
    parReceivedByPosition: String
    parDepartment: String
    parAssignedDate: String
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
}


# New input type focused on the specific update need
input PARUpdateInput {
  ids: [ID!]!
}

# Input for assigning PAR with signatories (new manual workflow)
input PARAssignmentInput {
  itemIds: [ID!]!
  parId: String  # Optional - if not provided, will generate new ID
  receivedFrom: String!
  receivedFromPosition: String
  receivedBy: String!
  receivedByPosition: String
  department: String
}

# Input for a single split entry when splitting an item's received qty
input PARSplitEntry {
  quantity: Int!
  department: String
  receivedFrom: String!
  receivedFromPosition: String
  receivedBy: String!
  receivedByPosition: String
}

# Input for splitting a single item across multiple PAR groups
input PARItemSplit {
  itemId: ID!
  splits: [PARSplitEntry!]!
}

# Top-level input for the split-and-assign mutation
input SplitAndAssignPARInput {
  itemSplits: [PARItemSplit!]!
}

# Input for creating a single PAR assignment (saves immediately)
input CreateSinglePARInput {
  sourceItemId: ID!
  quantity: Int!
  department: String
  receivedFrom: String!
  receivedFromPosition: String
  receivedBy: String!
  receivedByPosition: String
}

# Input for updating an existing PAR assignment
input UpdatePARAssignmentInput {
  itemId: ID!
  quantity: Int
  department: String
  receivedFrom: String
  receivedFromPosition: String
  receivedBy: String
  receivedByPosition: String
}

# Response type for single PAR creation
type CreatePARResponse {
  newItem: ItemWithPurchaseOrder!
  sourceItem: ItemWithPurchaseOrder!
  generatedParId: String!
}

# Response type for next PAR ID query
type NextParIdResponse {
  nextId: String!
  currentYear: Int!
  nextSequence: Int!
}

type Query {
    propertyAcknowledgmentReport: [ItemWithPurchaseOrder!]
    propertyAcknowledgmentReportForView: [ItemWithPurchaseOrder!]
    # Get the next available PAR ID without assigning it
    getNextParId: NextParIdResponse!
    # Get all existing PAR IDs for the current year (for grouping with existing)
    getExistingParIds: [String!]!
}

type Mutation {
  # Updated mutation that accepts the simplified input
  updatePARInventoryIDs(input: PARUpdateInput!): [ItemWithPurchaseOrder]
  # New mutation for manual PAR assignment with signatories
  assignPARWithSignatories(input: PARAssignmentInput!): [ItemWithPurchaseOrder]
  # Split items by quantity and assign separate PAR IDs with signatories
  splitAndAssignPAR(input: SplitAndAssignPARInput!): [ItemWithPurchaseOrder]
  # Create a single PAR assignment (saves immediately, clones from source)
  createSinglePARAssignment(input: CreateSinglePARInput!): CreatePARResponse!
  # Update an existing PAR assignment
  updatePARAssignment(input: UpdatePARAssignmentInput!): ItemWithPurchaseOrder!
}


`;




export default propertyAcknowledgementReportTypeDef;
