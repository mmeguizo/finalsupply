import { gql } from "@apollo/client";
const GET_AUTHENTICATED_USER = gql`
  query GetAuthenticatedUser {
    authUser {
      _id
      email
      name
      profile_pic
      role
      location
    }
  }
`;

const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      id
      email
      name
      last_name
      employee_id
      department
      position
      profile_pic
      gender
      role
      is_active
      location
    }
  }
`;


const GET_USERS_COUNT = gql`
  query CountAllUsers {
    countAllUsers
  }

`

export { GET_AUTHENTICATED_USER , GET_USERS_COUNT, GET_ALL_USERS };
// Compare this snippet from backend/routes/user.routes.js:
