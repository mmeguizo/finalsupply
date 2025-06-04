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
  GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT,
  GET_ALL_PROPERTY_ACKNOWLEDGEMENT_REPORT_FOR_PROPERTY
};
