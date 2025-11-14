import { gql } from "@apollo/client";

const GET_PURCHASEORDERS = gql`
  query GetPurchaseOrders {
    purchaseOrders {
      id
      supplier
      address
      poNumber
      telephone
      campus
      placeOfDelivery
      dateOfDelivery
      dateOfPayment
      deliveryTerms
      dateOfConformity
      paymentTerms
      category
      status
      modeOfProcurement
  income
  mds
  details
      items {
        id
        itemName
        purchaseOrderId
        description
        generalDescription
        specification
        unit
        quantity
        unitCost
        amount
        category
        isDeleted
        actualQuantityReceived
        tag
        iarId
        inventoryNumber
      }
      amount
      invoice
      fundsource
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
      campus
      placeOfDelivery
      dateOfDelivery
      dateOfPayment
      deliveryTerms
      paymentTerms
      category
      status
  income
  mds
  details
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
        tag
        inventoryNumber
      }
      amount
      invoice
      fundsource
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
      tag
      inventoryNumber
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
      tag
      inventoryNumber
      iarId
      PurchaseOrder {
        poNumber
        supplier
        address
        poNumber
        telephone
        campus
        placeOfDelivery
        dateOfDelivery
        dateOfPayment
        deliveryTerms
        paymentTerms
        category
        status
        income
        mds
        details
        amount
        invoice
        fundsource
      }
    }
  }
`;
const GET_ALL_ICS_PURCHASEORDER_ITEMS = gql`
  query GetAllICSPurchaseOrderItems {
    allICSPurchaseOrderItems {
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
      tag
      inventoryNumber
      PurchaseOrder {
        poNumber
        supplier
        address
        poNumber
        telephone
        campus
        placeOfDelivery
        dateOfDelivery
        dateOfPayment
        deliveryTerms
        paymentTerms
        category
        status
        income
        mds
        details
        amount
        invoice
        fundsource
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
    getPurchaseOrderForBarCharts {
      id
      supplier
      address
      poNumber
      telephone
      campus
      placeOfDelivery
      dateOfDelivery
      dateOfPayment
      deliveryTerms
      paymentTerms
      category
      status
      completed_status_date
  income
  mds
  details
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
        inventoryNumber
      }
      amount
      invoice
      createdAt
      fundsource
    }
    getAllCategory {
      category
    }
  }
`;

const GET_ITEM_HISTORY = gql`
  query GetPurchaseOrderHistory($purchaseOrderId: ID!) {
    purchaseOrderHistory(purchaseOrderId: $purchaseOrderId) {
      id
      purchaseOrderItemId
      previousQuantity
      newQuantity
      previousActualQuantityReceived
      newActualQuantityReceived
      previousAmount
      newAmount
      changeType
      changedBy
      changeReason
      createdAt
      updatedAt
    }
  }
`;

export {
  GET_PURCHASEORDERS,
  GET_PURCHASEORDER,
  GET_PURCHASEORDER_ITEMS,
  GET_ALL_PURCHASEORDER_ITEMS,
  GET_ALL_DASHBOARD_DATA,
  GET_ITEM_HISTORY,
  GET_ALL_ICS_PURCHASEORDER_ITEMS
};
