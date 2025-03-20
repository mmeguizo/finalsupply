import { gql } from "@apollo/client";

export const ADD_PURCHASEORDER = gql`
  mutation AddPurchaseOrder($input: PurchaseorderInput!) {
    addPurchaseorder(input: $input) {
      _id
      ponumber
      supplier
      address
      dateofdelivery
      dateofpayment
      category
      invoice
    }
  }
`;

export const UPDATE_PURCHASEORDER = gql`
  mutation UpdatePurchaseOrder($input: UpdatePurchaseorderInput!) {
    updatePurchaseorder(input: $input) {
      _id
      supplier
      address
      ponumber
      telephone
      placeofdelivery
      dateofdelivery
      dateofpayment
      deliveryterms
      paymentterms
      category
      status
      items {
        _id
        item
        description
        unit
        quantity
        unitcost
        amount
        category
        isDeleted
        actualquantityrecieved
      }
      amount
      invoice
    }
  }
`;

export const DELETE_PURCHASEORDER = gql`
  mutation DeletePurchaseOrder($id: ID!) {
    deletePurchaseorder(purchaseorderId: $id) {
      _id
      ponumber
      supplier
    }
  }
`;
