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
  mutation AppendToExistingIAR(
    $iarId: String!
    $items: [AppendIARItemInput!]!
  ) {
    appendToExistingIAR(iarId: $iarId, items: $items) {
      success
      iarId
      updatedCount
      message
    }
  }
`;

export const CREATE_LINE_ITEM_FROM_EXISTING = gql`
  mutation CreateLineItemFromExisting(
    $sourceItemId: Int!
    $newItem: CreateLineItemInput!
  ) {
    createLineItemFromExisting(sourceItemId: $sourceItemId, newItem: $newItem) {
      success
      newItemId
      iarId
      message
    }
  }
`;

export const GENERATE_IAR_FROM_PO = gql`
  mutation GenerateIARFromPO(
    $purchaseOrderId: Int!
    $items: [GenerateIARItemInput!]!
    $invoice: String
  ) {
    generateIARFromPO(
      purchaseOrderId: $purchaseOrderId
      items: $items
      invoice: $invoice
    ) {
      success
      iarId
      updatedCount
      message
    }
  }
`;

export const UPDATE_IAR_INVOICE = gql`
  mutation UpdateIARInvoice(
    $iarId: String!
    $invoice: String
    $invoiceDate: String
    $income: String
    $mds: String
    $details: String
  ) {
    updateIARInvoice(
      iarId: $iarId
      invoice: $invoice
      invoiceDate: $invoiceDate
      income: $income
      mds: $mds
      details: $details
    ) {
      success
      message
      iarId
      invoice
      invoiceDate
      income
      mds
      details
      updatedCount
    }
  }
`;

export const CREATE_SINGLE_ICS_ASSIGNMENT = gql`
  mutation CreateSingleICSAssignment($input: CreateSingleICSInput!) {
    createSingleICSAssignment(input: $input) {
      newItem {
        id
        icsId
        description
        unit
        quantity
        unitCost
        amount
        actualQuantityReceived
        category
        tag
        iarId
        risId
        parId
        icsReceivedFrom
        icsReceivedFromPosition
        icsReceivedBy
        icsReceivedByPosition
        icsDepartment
        icsAssignedDate
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
        icsId
      }
      generatedIcsId
    }
  }
`;

export const UPDATE_ICS_ASSIGNMENT = gql`
  mutation UpdateICSAssignment($input: UpdateICSAssignmentInput!) {
    updateICSAssignment(input: $input) {
      id
      icsId
      description
      unit
      quantity
      unitCost
      amount
      actualQuantityReceived
      category
      tag
      icsDepartment
      icsReceivedFrom
      icsReceivedFromPosition
      icsReceivedBy
      icsReceivedByPosition
      icsAssignedDate
      PurchaseOrder {
        id
        poNumber
        supplier
        dateOfDelivery
      }
    }
  }
`;

// Create a multi-item ICS assignment (multiple items share one ICS ID)
export const CREATE_MULTI_ITEM_ICS_ASSIGNMENT = gql`
  mutation CreateMultiItemICSAssignment($input: CreateMultiItemICSInput!) {
    createMultiItemICSAssignment(input: $input) {
      newItems {
        id
        icsId
        description
        unit
        quantity
        unitCost
        amount
        actualQuantityReceived
        category
        tag
        icsReceivedFrom
        icsReceivedFromPosition
        icsReceivedBy
        icsReceivedByPosition
        icsDepartment
        icsAssignedDate
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
        icsId
      }
      generatedIcsId
    }
  }
`;

// Add an item to an existing ICS ID
export const ADD_ITEM_TO_EXISTING_ICS = gql`
  mutation AddItemToExistingICS($input: AddItemToExistingICSInput!) {
    addItemToExistingICS(input: $input) {
      newItem {
        id
        icsId
        description
        unit
        quantity
        unitCost
        amount
        actualQuantityReceived
        category
        tag
        icsReceivedFrom
        icsReceivedFromPosition
        icsReceivedBy
        icsReceivedByPosition
        icsDepartment
        icsAssignedDate
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
        icsId
      }
      icsId
    }
  }
`;

// Split items by received quantity and assign ICS IDs with per-split signatories
export const SPLIT_AND_ASSIGN_ICS = gql`
  mutation SplitAndAssignICS($input: SplitAndAssignICSInput!) {
    splitAndAssignICS(input: $input) {
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
      icsReceivedFrom
      icsReceivedFromPosition
      icsReceivedBy
      icsReceivedByPosition
      icsDepartment
      icsAssignedDate
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

export const UPDATE_ITEM_PURPOSE = gql`
  mutation UpdateItemPurpose($ids: [ID!]!, $purpose: String!) {
    updateItemPurpose(ids: $ids, purpose: $purpose) {
      success
      message
      updatedCount
    }
  }
`;

export const UPDATE_ITEM_REMARKS = gql`
  mutation UpdateItemRemarks($ids: [ID!]!, $remarks: String!) {
    updateItemRemarks(ids: $ids, remarks: $remarks) {
      success
      message
      updatedCount
    }
  }
`;
