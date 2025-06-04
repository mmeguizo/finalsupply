import { gql } from "@apollo/client";

const GET_SIGNATORIES = gql`
  query GetSignatories {
    signatories {
      id
      name
      role
      purchaseOrderId
      isDeleted
      createdAt
      updatedAt
      purchaseOrder {
        id
        poNumber
        supplier
      }
    }
  }
`;

const GET_SIGNATORY = gql`
  query GetSignatory($id: ID!) {
    signatory(id: $id) {
      id
      name
      role
      purchaseOrderId
      isDeleted
      createdAt
      updatedAt
      purchaseOrder {
        id
        poNumber
        supplier
      }
    }
  }
`;

const GET_SIGNATORIES_BY_PURCHASE_ORDER = gql`
  query GetSignatoriesByPurchaseOrder($purchaseOrderId: ID!) {
    signatoryByPurchaseOrder(purchaseOrderId: $purchaseOrderId) {
      id
      name
      role
      purchaseOrderId
      isDeleted
      createdAt
      updatedAt
    }
  }
`;

export {
  GET_SIGNATORIES,
  GET_SIGNATORY,
  GET_SIGNATORIES_BY_PURCHASE_ORDER
};
