const inspectionAcceptanceReportTypeDef = `#graphql
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
    iarStatus : String
}

type PurchaseOrderType {
    id: ID
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
    dateOfConformity : String
    amount: Float
    category: String
    status: String
    invoice: String
    campus: String
    createdAt: String
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
    itemGroupId: String
    isReceiptLine: Int
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
    inventoryNumber: String
    generalDescription: String
    specification: String
    PurchaseOrder: PurchaseOrderType
    PurchaseOrderItem: PurchaseOrderItemType
    tag : String
    iarId : String
    icsId : String
    risId : String
    parId : String
    createdAt : String
    iarStatus : String
    income: String
    mds: String
    details: String
    invoice: String
    invoiceDate: String
    icsReceivedFrom: String
    icsReceivedFromPosition: String
    icsReceivedBy: String
    icsReceivedByPosition: String
    icsDepartment: String
    icsAssignedDate: String
    purpose: String
    remarks: String
    splitGroupId: String
    splitFromItemId: Int
    splitIndex: Int
}
type IARonly{
    id: ID
    createdAt : String
    iarId : String
    category : String
    poNumber : String
}

type updateIARStatusPayload{
    id: ID
    iarStatus: String
    message : String
    success: Boolean
    updatedCount: Int
    ids: [ID!]
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
input ICSUpdateInput {
  ids: [ID!]!
}

type Query {
    inspectionAcceptanceReport: [ItemWithPurchaseOrder!]
    inspectionAcceptanceReportForICS: [ItemWithPurchaseOrder!]
    iarForReports: [IARonly]
    getIARItemsByIarId(iarId: String!): [ItemWithPurchaseOrder!]
}

type Mutation {
  # Updated mutation that accepts the simplified input
  updateICSInventoryIDs(input: ICSUpdateInput!): [ItemWithPurchaseOrder]
  updateIARStatus(airId: String!, iarStatus: String!): updateIARStatusPayload
  revertIARBatch(iarId: String!, reason: String): RevertIARBatchPayload
  appendToExistingIAR(iarId: String!, items: [AppendIARItemInput!]!): AppendIARResult!
  createLineItemFromExisting(sourceItemId: Int!, newItem: CreateLineItemInput!): CreateLineItemResult!
  updateIARInvoice(iarId: String!, invoice: String, invoiceDate: String, income: String, mds: String, details: String): UpdateIARInvoicePayload!
  splitAndAssignICS(input: SplitAndAssignICSInput!): [ItemWithPurchaseOrder]
  createSingleICSAssignment(input: CreateSingleICSInput!): CreateICSResponse!
  createMultiItemICSAssignment(input: CreateMultiItemICSInput!): CreateMultiICSResponse!
  addItemToExistingICS(input: AddItemToExistingICSInput!): AddItemToExistingICSResponse!
  updateICSAssignment(input: UpdateICSAssignmentInput!): ItemWithPurchaseOrder!
  updateItemPurpose(ids: [ID!]!, purpose: String!): UpdatePurposeRemarksPayload!
  updateItemRemarks(ids: [ID!]!, remarks: String!): UpdatePurposeRemarksPayload!
}

type UpdatePurposeRemarksPayload {
    success: Boolean!
    message: String!
    updatedCount: Int!
}

type UpdateIARInvoicePayload {
    success: Boolean!
    message: String!
    iarId: String!
    invoice: String
    invoiceDate: String
    income: String
    mds: String
    details: String
    updatedCount: Int!
}

type RevertIARBatchPayload {
    success: Boolean!
    message: String!
    iarId: String!
    affectedCount: Int!
}

# New inputs and payloads for appending lines to an existing IAR
input AppendIARItemInput {
    purchaseOrderItemId: Int!
    received: Int!
    description: String
    generalDescription: String
    specification: String
}

type AppendIARResult {
    success: Boolean!
    iarId: String!
    updatedCount: Int!
    message: String!
}

# New inputs and payloads for creating a new line item from an existing one
input CreateLineItemInput {
    iarId: String!
    quantity: Int!
    received: Int!
    description: String
    generalDescription: String
    specification: String
}

type CreateLineItemResult {
    success: Boolean!
    newItemId: Int!
    iarId: String!
    message: String!
}

# ICS Split & Assign types
input ICSSplitEntry {
  quantity: Int!
  department: String
  receivedFrom: String!
  receivedFromPosition: String
  receivedBy: String!
  receivedByPosition: String
}

input ICSItemSplit {
  itemId: ID!
  splits: [ICSSplitEntry!]!
}

input SplitAndAssignICSInput {
  itemSplits: [ICSItemSplit!]!
}

# ICS Assignment types
input CreateSingleICSInput {
    sourceItemId: Int!
    quantity: Int!
    department: String
    receivedFrom: String
    receivedFromPosition: String
    receivedBy: String
    receivedByPosition: String
}

input UpdateICSAssignmentInput {
    itemId: Int!
    quantity: Int
    department: String
    receivedFrom: String
    receivedFromPosition: String
    receivedBy: String
    receivedByPosition: String
}

type CreateICSResponse {
    newItem: ItemWithPurchaseOrder!
    sourceItem: ItemWithPurchaseOrder!
    generatedIcsId: String!
}

# Multi-item ICS assignment types
input MultiICSItemEntry {
    sourceItemId: Int!
    quantity: Int!
}

input CreateMultiItemICSInput {
    items: [MultiICSItemEntry!]!
    department: String
    receivedFrom: String!
    receivedFromPosition: String
    receivedBy: String!
    receivedByPosition: String
}

input AddItemToExistingICSInput {
    sourceItemId: Int!
    quantity: Int!
    existingIcsId: String!
}

type CreateMultiICSResponse {
    newItems: [ItemWithPurchaseOrder!]!
    sourceItems: [ItemWithPurchaseOrder!]!
    generatedIcsId: String!
}

type AddItemToExistingICSResponse {
    newItem: ItemWithPurchaseOrder!
    sourceItem: ItemWithPurchaseOrder!
    icsId: String!
}


`;

export default inspectionAcceptanceReportTypeDef;
