const purchaseorderTypeDef = `#graphql
scalar JSON

type PurchaseOrder {
    id: ID!
    supplier: String
    address: String
    poNumber: Int
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
}

type Item {
    id: ID!
    itemName: String
    purchaseOrderId: String
    description: String
    unit: String
    quantity: Int
    unitCost: Float
    amount: Float
    category: String
    isDeleted: Boolean
    date: String
    actualQuantityReceived: Int
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
}

type PurchaseOrderType {
    poNumber: Int
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
    unit: String
    quantity: Int
    unitCost: Float
    amount: Float
    category: String
    isDeleted: Boolean
    actualQuantityReceived: Int
    currentInput: Int
}

input UpdatePurchaseOrderInput {
    id: Int
    supplier: String
    address: String
    poNumber: Int
    modeOfProcurement: String
    email: String
    telephone: String
    placeOfDelivery: String
    dateOfDelivery: String
    dateOfPayment: String
    deliveryTerms: String
    paymentTerms: String
    items: [ItemInput!]
    amount: Float
    status: String
    invoice: String
}

input PurchaseOrderInput {
    supplier: String
    address: String
    poNumber: Int
    modeOfProcurement: String
    email: String
    telephone: String
    placeOfDelivery: String
    dateOfDelivery: String
    dateOfPayment: String
    deliveryTerms: String
    paymentTerms: String
    items: [ItemInput!]
    amount: Float
    status: String
    invoice: String
}



type Query {
    purchaseOrders: [PurchaseOrder!]
    purchaseOrder(purchaseOrderId: ID!): PurchaseOrder
    purchaseOrderItems(purchaseOrderId: ID!): [Item!]
    purchaseOrderItems: [Item!]
    # allPurchaseOrderItems: [Item!]
    allPurchaseOrderItems: [ItemWithPurchaseOrder!]
    getAllTotalPurchaseOrderAmount: Float
    getTotalPurchaseOrderItems: Int
    getTotalPurchaseOrders: Int
    getPurchaseOrderForBarCharts : [PurchaseOrder]
    getAllCategory : [Item]
   
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
