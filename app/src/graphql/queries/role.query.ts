import { gql } from "@apollo/client";

export const GET_ROLES = gql`
  query GetRoles {
    roles {
      id
      name
      description
      isDeleted
      createdAt
      updatedAt
    }
  }
`;

export const GET_ROLE = gql`
  query GetRole($id: ID!) {
    role(id: $id) {
      id
      name
      description
      isDeleted
      createdAt
      updatedAt
    }
  }
`;