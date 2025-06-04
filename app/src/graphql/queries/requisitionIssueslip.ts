import { gql } from "@apollo/client";

const GET_ALL_REQUISITION_ISSUE_SLIP = gql`
  query GetAllRequisitionIssueSlip{
    requisitionIssueSlip {
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

const GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY = gql`
  query GetAllRequisitionIssueSlipView {
    requisitionIssueSlipForView {
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
  GET_ALL_REQUISITION_ISSUE_SLIP,
  GET_ALL_REQUISITION_ISSUE_SLIP_FOR_PROPERTY
};
