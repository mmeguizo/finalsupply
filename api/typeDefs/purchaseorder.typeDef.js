const purchaseorderTypeDef = `#graphql

type Purchaseorder {
    _id: ID!
    supplier: String
    address: String
    ponumber: Int
    modeofprocurement: String
    email: String
    telephone: Int
    placeofdelivery: String
    dateofdelivery: String
    dateofpayment: String
    deliveryterms: String
    paymentterms: String
    items: [Item!]
    amount: Float
    category : String
    status : String
    invoice : String

}

type Item {
    _id: ID!
    item: String
    description: String
    unit: String
    quantity: Int
    unitcost: Float
    amount: Float
    category: String
    isDeleted: Boolean
    actualquantityrecieved : Int
}

type Query {
    purchaseorders: [Purchaseorder!]
    purchaseorder(purchaseorderId: ID!): Purchaseorder
    purchaseorderItems(purchaseorderId: ID!): [Item!]
}

input ItemInput {
    _id: ID
    item: String
    description: String
    unit: String
    quantity: Int
    unitcost: Float
    amount: Float
    category: String
    isDeleted: Boolean
    actualquantityrecieved : Int
}

type Mutation {
   addPurchaseorder(input: PurchaseorderInput!): Purchaseorder
   updatePurchaseorder(input: UpdatePurchaseorderInput!): Purchaseorder
   deletePurchaseorder(purchaseorderId: ID!): Purchaseorder
   reactivatePurchaseorder(purchaseorderId: ID!): Purchaseorder
   addPurchaseorderItem(purchaseorderId: ID!, item: ItemInput!): Purchaseorder
   updatePurchaseorderItem(purchaseorderId: ID!, item: ItemInput!): Purchaseorder
   deletePurchaseorderItem(purchaseorderId: ID!, item: ItemInput!): Purchaseorder
}

input UpdatePurchaseorderInput {
    purchaseorderId: ID!
    supplier: String
    address: String
    ponumber: Int
    modeofprocurement: String
    email: String
    telephone: Int
    placeofdelivery: String
    dateofdelivery: String
    dateofpayment: String
    deliveryterms: String
    paymentterms: String
    items: [ItemInput!]
    amount: Float
    status : String
    invoice: String
}

input PurchaseorderInput {
    supplier: String
    address: String
    ponumber: Int
    modeofprocurement: String
    email: String
    telephone: Int
    placeofdelivery: String
    dateofdelivery: String
    dateofpayment: String
    deliveryterms: String
    paymentterms: String
    items: [ItemInput!]
    amount: Float
    status : String
    invoice: String
}

`;

export default purchaseorderTypeDef;
