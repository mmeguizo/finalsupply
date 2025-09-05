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
input RISUpdateInput {
  ids: [ID!]!
}

type Query {
    requisitionIssueSlip: [ItemWithPurchaseOrder!]
    requisitionIssueSlipForView: [ItemWithPurchaseOrder!]
}

type Mutation {
  # Updated mutation that accepts the simplified input
  updateRISInventoryIDs(input: RISUpdateInput!): [ItemWithPurchaseOrder]
}


`;




export default requisitionIssueSlipTypeDef;
