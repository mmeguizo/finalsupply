import { gql } from "@apollo/client";

const GET_PURCHASEORDERS = gql`
  query GetPurchaseorders {
    purchaseorders {
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
      items {
        _id
        item
        description
        unit
        quantity
        unitcost
        amount
        isDeleted
      }
      amount
    }
  }
`;

const GET_PURCHASEORDER = gql`
  query GetPurchaseorder($purchaseorderId: ID!) {
    purchaseorder(purchaseorderId: $purchaseorderId) {
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
      items {
        _id
        item
        description
        unit
        quantity
        unitcost
        amount
        isDeleted
      }
      amount
    }
  }
`;

const GET_PURCHASEORDER_ITEMS = gql`
  query GetPurchaseorderItems($purchaseorderId: ID!) {
    purchaseorderItems(purchaseorderId: $purchaseorderId) {
      _id
      item
      description
      unit
      quantity
      unitcost
      amount
      isDeleted
    }
  }
`;

export { GET_PURCHASEORDERS, GET_PURCHASEORDER, GET_PURCHASEORDER_ITEMS };
