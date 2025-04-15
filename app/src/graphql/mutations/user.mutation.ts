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

export { SIGN_UP, LOGIN, LOGOUT };
