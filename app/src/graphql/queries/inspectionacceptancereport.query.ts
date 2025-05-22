import { gql } from "@apollo/client";

const GET_ALL_INSPECTION_ACCEPTANCE_REPORT = gql`
  query GetAllInspectionAcceptanceReport {
    inspectionAcceptanceReport {
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
      PurchaseOrder {
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
      }
    }
  }
`;


export {
  GET_ALL_INSPECTION_ACCEPTANCE_REPORT,
  GET_ALL_INSPECTION_ACCEPTANCE_REPORT_FOR_ICS
};
