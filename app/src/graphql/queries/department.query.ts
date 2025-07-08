import { gql } from "@apollo/client";

const GET_ALL_DEPARTMENTS = gql`
  query GetAllDepartments {
    departments {
      id
      name
      description
      is_active
    }
  }
`;

const GET_DEPARTMENT = gql`
  query GetDepartment($id: ID!) {
    department(id: $id) {
      id
      name
      description
      is_active
    }
  }
`;

export { GET_ALL_DEPARTMENTS, GET_DEPARTMENT };