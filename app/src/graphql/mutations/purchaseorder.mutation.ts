import { gql } from "@apollo/client";

export const ADD_PURCHASEORDER = gql`
  mutation AddPurchaseOrder($input: PurchaseOrderInput!) {
    addPurchaseOrder(input: $input) {
      id
      poNumber
      supplier
      address
      dateOfDelivery
      dateOfPayment
      category
      invoice
      completed_status_date
      items {
        id
        description
        purchaseOrderId
        unit
        quantity
        unitCost
        amount
        category
        isDeleted
        actualQuantityReceived
        inventoryNumber
      }
    }
  }
`;

export const UPDATE_PURCHASEORDER = gql`
  mutation UpdatePurchaseOrder($input: UpdatePurchaseOrderInput!) {
    updatePurchaseOrder(input: $input) {
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
      completed_status_date
      items {
        id
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
    }
  }
`;

export const DELETE_PURCHASEORDER = gql`
  mutation DeletePurchaseOrder($id: ID!) {
    deletePurchaseOrder(purchaseOrderId: $id) {
      id
      poNumber
      supplier
    }
  }
`;
