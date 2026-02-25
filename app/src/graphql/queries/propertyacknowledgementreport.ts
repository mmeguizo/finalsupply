import { gql } from "@apollo/client";

const GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT = gql`
  query GetAllPropertyAcknowledgementReport {
    propertyAcknowledgementReport {
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
      PurchaseOrder {
        id
        poNumber
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
        amount
        invoice
        income
        mds
        details
      }
    }
  }
`;

const GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY = gql`
  query GetAllPropertyAcknowledgementReportForView {
    propertyAcknowledgmentReportForView {
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
      inventoryNumber
      parReceivedFrom
      parReceivedFromPosition
      parReceivedBy
      parReceivedByPosition
      parDepartment
      parAssignedDate
      remarks
      income
      mds
      details
      splitGroupId
      splitFromItemId
      splitIndex
      PurchaseOrder {
        id
        poNumber
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
        amount
        invoice
        income
        mds
        details
      }
      PurchaseOrderItem {
        id
        purchaseOrderId
        itemName
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
        currentInput
        generalDescription
        specification
      }
    }
  }
`;

// Get the next available PAR ID preview
const GET_NEXT_PAR_ID = gql`
  query GetNextParId {
    getNextParId {
      nextId
      currentYear
      nextSequence
    }
  }
`;

// Get all existing PAR IDs for the current year
const GET_EXISTING_PAR_IDS = gql`
  query GetExistingParIds {
    getExistingParIds
  }
`;

export {
  GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT,
  GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY,
  GET_NEXT_PAR_ID,
  GET_EXISTING_PAR_IDS,
};
