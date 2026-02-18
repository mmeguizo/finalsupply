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
      }
    }
  }
`;

export const UPDATE_RISID = gql`
  mutation updateRISInventoryIDs($input: RISUpdateInput!) {
    updateRISInventoryIDs(input: $input) {
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
      iarId
      icsId
      risId
      parId
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

// Create a single RIS assignment (saves immediately)
export const CREATE_SINGLE_RIS_ASSIGNMENT = gql`
  mutation CreateSingleRISAssignment($input: CreateSingleRISInput!) {
    createSingleRISAssignment(input: $input) {
      newItem {
        id
        itemName
        description
        unit
        quantity
        unitCost
        amount
        actualQuantityReceived
        risId
        risReceivedFrom
        risReceivedFromPosition
        risReceivedBy
        risReceivedByPosition
        risDepartment
        risAssignedDate
        PurchaseOrder {
          id
          poNumber
        }
      }
      sourceItem {
        id
        actualQuantityReceived
        risId
      }
      generatedRisId
    }
  }
`;

// Update an existing RIS assignment
export const UPDATE_RIS_ASSIGNMENT = gql`
  mutation UpdateRISAssignment($input: UpdateRISAssignmentInput!) {
    updateRISAssignment(input: $input) {
      id
      itemName
      description
      unit
      quantity
      unitCost
      amount
      actualQuantityReceived
      risId
      risReceivedFrom
      risReceivedFromPosition
      risReceivedBy
      risReceivedByPosition
      risDepartment
      risAssignedDate
    }
  }
`;

