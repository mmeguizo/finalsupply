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
    }
  }
`;

export const UPDATE_PURCHASEORDER = gql`
  mutation UpdatePurchaseOrder($input: UpdatePurchaseorderInput!) {
    updatePurchaseorder(input: $input) {
      _id
      ponumber
      supplier
      address
      dateofdelivery
      dateofpayment
    }
  }
`;
