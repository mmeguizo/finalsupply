import { gql } from "@apollo/client";

const GET_SIGNATORIES = gql`
  query GetSignatories {
    signatories {
      id
      name
      role
      roleId
      purchaseOrderId
      isDeleted
      createdAt
      updatedAt
      purchaseOrder {
        id
        poNumber
        supplier
      }
      roleDetail {
        id
        name
        description
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
      roleId
      purchaseOrderId
      isDeleted
      createdAt
      updatedAt
      purchaseOrder {
        id
        poNumber
        supplier
      }
      roleDetail {
        id
        name
        description
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
      roleId
      purchaseOrderId
      isDeleted
      createdAt
      updatedAt
      roleDetail {
        id
        name
      }
    }
  }
`;

export {
  GET_SIGNATORIES,
  GET_SIGNATORY,
  GET_SIGNATORIES_BY_PURCHASE_ORDER
};
