import { gql } from "@apollo/client";

export const ADD_SIGNATORY = gql`
  mutation AddSignatory($input: SignatoryInput!) {
    addSignatory(input: $input) {
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

export const UPDATE_SIGNATORY = gql`
  mutation UpdateSignatory($input: UpdateSignatoryInput!) {
    updateSignatory(input: $input) {
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

export const DELETE_SIGNATORY = gql`
  mutation DeleteSignatory($id: ID!) {
    deleteSignatory(id: $id) {
      id
      name
      role
      roleId
      purchaseOrderId
    }
  }
`;

export const REACTIVATE_SIGNATORY = gql`
  mutation ReactivateSignatory($id: ID!) {
    reactivateSignatory(id: $id) {
      id
      name
      role
      roleId
      purchaseOrderId
      isDeleted
    }
  }
`;
