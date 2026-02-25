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

// Create a multi-item RIS assignment (multiple items share one RIS ID)
export const CREATE_MULTI_ITEM_RIS_ASSIGNMENT = gql`
  mutation CreateMultiItemRISAssignment($input: CreateMultiItemRISInput!) {
    createMultiItemRISAssignment(input: $input) {
      newItems {
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
          supplier
          dateOfDelivery
        }
      }
      sourceItems {
        id
        actualQuantityReceived
        risId
      }
      generatedRisId
    }
  }
`;

// Add an item to an existing RIS ID
export const ADD_ITEM_TO_EXISTING_RIS = gql`
  mutation AddItemToExistingRIS($input: AddItemToExistingRISInput!) {
    addItemToExistingRIS(input: $input) {
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
          supplier
          dateOfDelivery
        }
      }
      sourceItem {
        id
        actualQuantityReceived
        risId
      }
      risId
    }
  }
`;

// Split items by received quantity and assign RIS IDs with per-split signatories
export const SPLIT_AND_ASSIGN_RIS = gql`
  mutation SplitAndAssignRIS($input: SplitAndAssignRISInput!) {
    splitAndAssignRIS(input: $input) {
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
      risReceivedFrom
      risReceivedFromPosition
      risReceivedBy
      risReceivedByPosition
      risDepartment
      risAssignedDate
      splitGroupId
      splitFromItemId
      splitIndex
      PurchaseOrder {
        id
        poNumber
        supplier
        dateOfDelivery
      }
    }
  }
`;
