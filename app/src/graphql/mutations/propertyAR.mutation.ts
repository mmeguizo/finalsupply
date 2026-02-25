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

export const UPDATE_PARID = gql`
  mutation updatePARInventoryIDs($input: PARUpdateInput!) {
    updatePARInventoryIDs(input: $input) {
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

// New mutation for manual PAR assignment with per-item signatories
export const ASSIGN_PAR_WITH_SIGNATORIES = gql`
  mutation AssignPARWithSignatories($input: PARAssignmentInput!) {
    assignPARWithSignatories(input: $input) {
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
      parReceivedFrom
      parReceivedFromPosition
      parReceivedBy
      parReceivedByPosition
      parDepartment
      parAssignedDate
      PurchaseOrder {
        id
        poNumber
        supplier
        dateOfDelivery
      }
    }
  }
`;

// Split items by received quantity and assign PAR IDs with per-split signatories
export const SPLIT_AND_ASSIGN_PAR = gql`
  mutation SplitAndAssignPAR($input: SplitAndAssignPARInput!) {
    splitAndAssignPAR(input: $input) {
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
      parReceivedFrom
      parReceivedFromPosition
      parReceivedBy
      parReceivedByPosition
      parDepartment
      parAssignedDate
      PurchaseOrder {
        id
        poNumber
        supplier
        dateOfDelivery
      }
    }
  }
`;

// Create a single PAR assignment (saves immediately)
export const CREATE_SINGLE_PAR_ASSIGNMENT = gql`
  mutation CreateSinglePARAssignment($input: CreateSinglePARInput!) {
    createSinglePARAssignment(input: $input) {
      newItem {
        id
        itemName
        description
        unit
        quantity
        unitCost
        amount
        actualQuantityReceived
        parId
        parReceivedFrom
        parReceivedFromPosition
        parReceivedBy
        parReceivedByPosition
        parDepartment
        parAssignedDate
        PurchaseOrder {
          id
          poNumber
        }
      }
      sourceItem {
        id
        actualQuantityReceived
        parId
      }
      generatedParId
    }
  }
`;

// Update an existing PAR assignment
export const UPDATE_PAR_ASSIGNMENT = gql`
  mutation UpdatePARAssignment($input: UpdatePARAssignmentInput!) {
    updatePARAssignment(input: $input) {
      id
      itemName
      description
      unit
      quantity
      unitCost
      amount
      actualQuantityReceived
      parId
      parReceivedFrom
      parReceivedFromPosition
      parReceivedBy
      parReceivedByPosition
      parDepartment
      parAssignedDate
    }
  }
`;

// Create a multi-item PAR assignment (multiple items share one PAR ID)
export const CREATE_MULTI_ITEM_PAR_ASSIGNMENT = gql`
  mutation CreateMultiItemPARAssignment($input: CreateMultiItemPARInput!) {
    createMultiItemPARAssignment(input: $input) {
      newItems {
        id
        itemName
        description
        unit
        quantity
        unitCost
        amount
        actualQuantityReceived
        parId
        parReceivedFrom
        parReceivedFromPosition
        parReceivedBy
        parReceivedByPosition
        parDepartment
        parAssignedDate
        PurchaseOrder {
          id
          poNumber
        }
      }
      sourceItems {
        id
        actualQuantityReceived
        parId
      }
      generatedParId
    }
  }
`;

// Add an item to an existing PAR ID
export const ADD_ITEM_TO_EXISTING_PAR = gql`
  mutation AddItemToExistingPAR($input: AddItemToExistingPARInput!) {
    addItemToExistingPAR(input: $input) {
      newItem {
        id
        itemName
        description
        unit
        quantity
        unitCost
        amount
        actualQuantityReceived
        parId
        parReceivedFrom
        parReceivedFromPosition
        parReceivedBy
        parReceivedByPosition
        parDepartment
        parAssignedDate
        PurchaseOrder {
          id
          poNumber
        }
      }
      sourceItem {
        id
        actualQuantityReceived
        parId
      }
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
