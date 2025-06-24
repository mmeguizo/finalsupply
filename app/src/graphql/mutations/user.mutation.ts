import { gql } from "@apollo/client";

const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      # _id     // Changed _id to id
      id
      email
      name
      profile_pic
    }
  }
`;

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      # _id     // Changed _id to id
      id
      email
      name
      role
      profile_pic
    }
  }
`;

const LOGOUT = gql`
  mutation Logout {
    logout {
      message
    }
  }
`;


const EDIT_USER = gql`
  mutation editUser($input: EditUserInput!) {
    editUser(input: $input) {
      id
      email
      name
      last_name
      employee_id
      department
      position
      gender
      role
      profile_pic
      location
    }
  }
`;
const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      name
      last_name
      employee_id
      department
      position
      gender
      role
      profile_pic
      location
    }
  }
`;

const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(userId: $id) {
      id
      email
      name
      last_name
      employee_id
      department
      position
      gender
      role
      profile_pic
    }
  }
`;

export { SIGN_UP, LOGIN, LOGOUT, EDIT_USER, CREATE_USER, DELETE_USER };
