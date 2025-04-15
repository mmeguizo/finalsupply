import { gql } from "@apollo/client";

const GET_PURCHASEORDERS = gql`
  query GetPurchaseOrders {
    purchaseOrders {
      id
      supplier
      address
      poNumber
      telephone
      placeOfDelivery
      dateOfDelivery
      dateOfPayment
      deliveryTerms
      paymentTerms
      category
      status
      items {
        id
        itemName
        purchaseOrderId
        description
        unit
        quantity
        unitCost
        amount
        category
        isDeleted
        actualQuantityReceived
      }
      amount
      invoice
    }
  }
`;

const GET_PURCHASEORDER = gql`
  query GetPurchaseOrder($purchaseOrderId: ID!) {
    purchaseOrder(purchaseOrderId: $purchaseOrderId) {
      id
      supplier
      address
      poNumber
      telephone
      placeOfDelivery
      dateOfDelivery
      dateOfPayment
      deliveryTerms
      paymentTerms
      category
      status
      items {
        id
        itemName
        purchaseOrderId
        description
        unit
        quantity
        unitCost
        amount
        category
        isDeleted
        actualQuantityReceived
      }
      amount
      invoice
    }
  }
`;

const GET_PURCHASEORDER_ITEMS = gql`
  query GetPurchaseOrderItems($purchaseOrderId: ID!) {
    purchaseOrderItems(purchaseOrderId: $purchaseOrderId) {
      id
      poNumber
      description
      unit
      quantity
      unitCost
      amount
      isDeleted
      actualQuantityReceived
    }
  }
`;

const GET_ALL_PURCHASEORDER_ITEMS = gql`
  query GetAllPurchaseOrderItems {
    allPurchaseOrderItems {
      id
      itemName
      purchaseOrderId
      description
      unit
      quantity
      unitCost
      amount
      actualQuantityReceived
      category
      isDeleted
      PurchaseOrder  {
        poNumber
      }
    }
  }
`;

// dashboard tables

const GET_ALL_DASHBOARD_DATA = gql`
  query GetAllTotalPurchaseOrderItems {
    getAllTotalPurchaseOrderAmount
    getTotalPurchaseOrderItems
    getTotalPurchaseOrders
    getPurchaseOrderForBarCharts  {
      id
      supplier
      address
      poNumber
      telephone
      placeOfDelivery
      dateOfDelivery
      dateOfPayment
      deliveryTerms
      paymentTerms
      category
      status
      items {
        id
        itemName
        purchaseOrderId
        description
        unit
        quantity
        unitCost
        amount
        category
        isDeleted
        actualQuantityReceived
      }
      amount
      invoice
      createdAt
    }
  }
`;

export {
  GET_PURCHASEORDERS,
  GET_PURCHASEORDER,
  GET_PURCHASEORDER_ITEMS,
  GET_ALL_PURCHASEORDER_ITEMS,
  GET_ALL_DASHBOARD_DATA
};
