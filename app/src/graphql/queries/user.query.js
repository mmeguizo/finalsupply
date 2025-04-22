import { gql } from "@apollo/client";
const GET_AUTHENTICATED_USER = gql`
  query GetAuthenticatedUser {
    authUser {
      _id
      email
      name
      profile_pic
      role
    }
  }
`;

const GET_USERS_COUNT = gql`
  query CountAllUsers {
    countAllUsers
  }

`

export { GET_AUTHENTICATED_USER , GET_USERS_COUNT };
// Compare this snippet from backend/routes/user.routes.js:
