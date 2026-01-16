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

export const UPDATE_ICSID = gql`
  mutation updateICSInventoryIDs($input: ICSUpdateInput!) {
    updateICSInventoryIDs(input: $input) {
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
      iarStatus
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

export const UPDATE_IAR_STATUS = gql`
  mutation UpdateIARStatus($airId: String!, $iarStatus: String!) {
    updateIARStatus(airId: $airId, iarStatus: $iarStatus) {
      success
      message
    }
  }
`;

export const REVERT_IAR_BATCH = gql`
  mutation RevertIARBatch($iarId: String!, $reason: String) {
    revertIARBatch(iarId: $iarId, reason: $reason) {
      success
      message
      iarId
      affectedCount
    }
  }
`;

export const APPEND_TO_EXISTING_IAR = gql`
  mutation AppendToExistingIAR($iarId: String!, $items: [AppendIARItemInput!]!) {
    appendToExistingIAR(iarId: $iarId, items: $items) {
      success
      iarId
      updatedCount
      message
    }
  }
`;

export const CREATE_LINE_ITEM_FROM_EXISTING = gql`
  mutation CreateLineItemFromExisting($sourceItemId: Int!, $newItem: CreateLineItemInput!) {
    createLineItemFromExisting(sourceItemId: $sourceItemId, newItem: $newItem) {
      success
      newItemId
      iarId
      message
    }
  }
`;

