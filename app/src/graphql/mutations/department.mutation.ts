import { gql } from "@apollo/client";

const CREATE_DEPARTMENT = gql`
  mutation CreateDepartment($input: DepartmentInput!) {
    createDepartment(input: $input) {
      id
      name
      description
      is_active
    }
  }
`;

const UPDATE_DEPARTMENT = gql`
  mutation UpdateDepartment($input: UpdateDepartmentInput!) {
    updateDepartment(input: $input) {
      id
      name
      description
      is_active
    }
  }
`;

const DELETE_DEPARTMENT = gql`
  mutation DeleteDepartment($id: ID!) {
    deleteDepartment(id: $id) {
      id
      name
      description
      is_active
    }
  }
`;

export { CREATE_DEPARTMENT, UPDATE_DEPARTMENT, DELETE_DEPARTMENT };