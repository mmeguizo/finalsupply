import { gql } from "@apollo/client";
const GET_AUTHENTICATED_USER = gql`
  query GetAuthenticatedUser {
    authUser {
      _id
      email
      name
      profilePic
      role
    }
  }
`;

export { GET_AUTHENTICATED_USER };
// Compare this snippet from backend/routes/user.routes.js:
