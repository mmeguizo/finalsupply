const purchaseorderTypeDef = `#graphql
scalar JSON

type PurchaseOrder {
    id: ID!
    supplier: String
    address: String
    poNumber: String
    modeOfProcurement: String
    email: String
    telephone: String
    campus: String
    placeOfDelivery: String
    dateOfDelivery: String
    dateOfPayment: String
    dateOfConformity : String
    deliveryTerms: String
    paymentTerms: String
    items: [Item!]
    amount: Float
    category: String
    status: String
    invoice: String
    isDeleted: Boolean
    createdAt: String
    completed_status_date : String
    fundsource : String
}
type InspectionAcceptanceReport {
    id: ID!
    supplier: String
    address: String
    poNumber: String
    modeOfProcurement: String
    email: String
    telephone: String
    placeOfDelivery: String
    dateOfDelivery: String
    dateOfPayment: String
    deliveryTerms: String
    paymentTerms: String
    items: [Item!]
    amount: Float
    category: String
    status: String
    invoice: String
    isDeleted: Boolean
    createdAt: String
    completed_status_date : String
}

type Item {
    id: ID!
    itemName: String
    purchaseOrderId: String
    description: String
    generalDescription : String
    specification: String
    unit: String
    quantity: Int
    unitCost: Float
    amount: Float
    category: String
    isDeleted: Boolean
    date: String
    actualQuantityReceived: Int
    tag : String
    inventoryNumber : String
    iarId : String
}



type PurchaseOrderBarChartDataType {
    data : JSON
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
    tag : String
     inventoryNumber : String
    iarId : String
}

type PurchaseOrderType {
    poNumber: String
    supplier: String
    address: String
    modeOfProcurement: String
    email: String
    telephone: String
    campus: String
    placeOfDelivery: String
    dateOfDelivery: String
    dateOfPayment: String
    deliveryTerms: String
    paymentTerms: String
    amount: Float
    category: String
    status: String
    invoice: String
    fundsource : String
}

type InspectionAcceptanceReportType {
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

type PurchaseOrderItemHistory {
  id: ID!
    purchaseOrderId: Int
  purchaseOrderItemId: Int!
    itemName: String
    description: String
  previousQuantity: Int!
  newQuantity: Int!
  previousActualQuantityReceived: Int!
  newActualQuantityReceived: Int!
  previousAmount: Float!
  newAmount: Float!
    iarId: String
    parId: String
    risId: String
    icsId: String
  changeType: String!
  changedBy: String!
  changeReason: String!
  createdAt: String!
  updatedAt: String!
}


#INPUTS

# input later
input PurchaseOrderBarChartData {
    date: String
    totalAmount: Float
}

input ItemInput {
    id: ID
    itemName: String
    purchaseOrderId: String
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
    tag : String
    inventoryNumber : String
}

input UpdatePurchaseOrderInput {
    id: Int
    supplier: String
    address: String
    poNumber: String
    modeOfProcurement: String
    email: String
    telephone: String
    campus: String
    placeOfDelivery: String
    dateOfDelivery: String
    dateOfPayment: String
    dateOfConformity : String
    deliveryTerms: String
    paymentTerms: String
    items: [ItemInput!]
    amount: Float
    status: String
    invoice: String
    fundsource: String
    completed_status_date : String
    markingComplete : Boolean
}

input PurchaseOrderInput {
    supplier: String
    address: String
    poNumber: String
    modeOfProcurement: String
    email: String
    telephone: String
    campus: String
    placeOfDelivery: String
    dateOfDelivery: String
    dateOfPayment: String
    deliveryTerms: String
    paymentTerms: String
    items: [ItemInput!]
    amount: Float
    status: String
    invoice: String
    fundsource: String
    dateOfConformity : String
    completed_status_date : String
}



type Query {
    purchaseOrders: [PurchaseOrder!]
    purchaseOrder(purchaseOrderId: ID!): PurchaseOrder
    purchaseOrderItems(purchaseOrderId: ID!): [Item!]
    purchaseOrderItems: [Item!]
    # allPurchaseOrderItems: [Item!]
    allPurchaseOrderItems: [ItemWithPurchaseOrder!]
    allICSPurchaseOrderItems: [ItemWithPurchaseOrder!]
    getAllTotalPurchaseOrderAmount: Float
    getTotalPurchaseOrderItems: Int
    getTotalPurchaseOrders: Int
    getPurchaseOrderForBarCharts : [PurchaseOrder]
    getAllCategory : [Item]
    purchaseOrderHistory(purchaseOrderId: ID!): [PurchaseOrderItemHistory!]
    purchaseOrderItemsHistoryAll: [PurchaseOrderItemHistory!]
   
}

type Mutation {
    addPurchaseOrder(input: PurchaseOrderInput!): PurchaseOrder
    updatePurchaseOrder(input: UpdatePurchaseOrderInput!): PurchaseOrder
    deletePurchaseOrder(purchaseOrderId: ID!): PurchaseOrder
    reactivatePurchaseOrder(purchaseOrderId: ID!): PurchaseOrder
    addPurchaseOrderItem(purchaseOrderId: ID!, item: ItemInput!): PurchaseOrder
    updatePurchaseOrderItem(purchaseOrderId: ID!, item: ItemInput!): PurchaseOrder
    deletePurchaseOrderItem(purchaseOrderId: ID!, item: ItemInput!): PurchaseOrder
}


`;

export default purchaseorderTypeDef;
