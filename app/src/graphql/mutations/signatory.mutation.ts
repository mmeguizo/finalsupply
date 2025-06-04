import { gql } from "@apollo/client";

export const ADD_SIGNATORY = gql`
  mutation AddSignatory($input: SignatoryInput!) {
    addSignatory(input: $input) {
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

export const UPDATE_SIGNATORY = gql`
  mutation UpdateSignatory($input: UpdateSignatoryInput!) {
    updateSignatory(input: $input) {
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

export const DELETE_SIGNATORY = gql`
  mutation DeleteSignatory($id: ID!) {
    deleteSignatory(id: $id) {
      id
      name
      role
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
      purchaseOrderId
      isDeleted
    }
  }
`;
