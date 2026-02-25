import { gql } from "@apollo/client";

const GET_ALL_INSPECTION_ACCEPTANCE_REPORT = gql`
  query GetAllInspectionAcceptanceReport {
    inspectionAcceptanceReport {
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
      actualQuantityReceived
      category
      isDeleted
      tag
      iarId
      icsId
      risId
      parId
      iarStatus
      createdAt
      invoice
      invoiceDate
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
        dateOfConformity
        paymentTerms
        category
        status
        amount
        invoice
        income
        mds
        details
        campus
        createdAt
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
        itemGroupId
        isReceiptLine
      }
    }
  }
`;

const GET_IAR_ITEMS_BY_IAR_ID = gql`
  query GetIARItemsByIarId($iarId: String!) {
    getIARItemsByIarId(iarId: $iarId) {
      id
      itemName
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
      PurchaseOrder {
        id
        poNumber
        supplier
        address
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

const GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS = gql`
  query GetAllInspectionAcceptanceReportForICS {
    inspectionAcceptanceReportForICS {
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
      inventoryNumber
      icsReceivedFrom
      icsReceivedFromPosition
      icsReceivedBy
      icsReceivedByPosition
      icsDepartment
      icsAssignedDate
      purpose
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
const GET_ALL_IAR_FOR_REPORTS = gql`
  query GetAllIARforReports {
    iarForReports {
      id
      createdAt
      iarId
      category
      poNumber
    }
  }
`;

export {
  GET_ALL_INSPECTION_ACCEPTANCE_REPORT,
  GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS,
  GET_ALL_IAR_FOR_REPORTS,
  GET_IAR_ITEMS_BY_IAR_ID,
};
