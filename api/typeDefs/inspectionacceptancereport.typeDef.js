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
}


`;




export default inspectionAcceptanceReportTypeDef;
