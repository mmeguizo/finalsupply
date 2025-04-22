const userTypeDef = `#graphql

type User {
    id: ID!  # Changed _id to id for Sequelize
    email: String!
    name: String!
    # firstname: String
    # lastname: String
    profile_pic: String
    gender: String!
    role: String!
    is_active: Boolean!
}

type Query {
    users: [User!]
    authUser: User
    user(userId: ID!): User
    countAllUsers : Int
}

type Mutation {
    signUp(input: SignUpInput!): User
    updateUser(input: UpdateUserInput!): User
    login(input: LoginInput!): User
    logout: LogoutResponse
}

input UpdateUserInput {
    userId: ID!
    name: String
    profile_pic: String
    password: String
    gender: String
    email: String
    role: String
    # firstname: String
    # lastname: String
    is_active: Boolean
}

input SignUpInput {
    email: String!
    name: String!
    password: String!
    gender: String!
}

input LoginInput {
    email: String!
    password: String!
}

type LogoutResponse {
    message: String!
}
`;

export default userTypeDef;

// const userTypeDef = `#graphql

// type User {
//     _id: ID!
//     email: String!
//     name: String!
//     password: String!
//     profile_pic: String
//     gender: String!
//     role: String!
// }

// type Query {
//     users: [User!]
//     authUser: User
//     user(userId: ID!): User
// }

// type Mutation {
//     signUp(input: SignUpInput!) : User
//     updateUser(input: UpdateUserInput!): User
//     login(input:LoginInput!): User
//     logout: LogoutResponse
// }

// input UpdateUserInput {
//     userId: ID!
//     name: String
//     profile_pic: String
//     password: String
//     gender: String
//     email: String
//     role: String

// }

// input SignUpInput {
//     email: String!
//     name: String!
//     password: String!
//     gender: String!
// }

// input LoginInput {
//     # email: String!
//     email: String!
//     password: String!
// }

// type LogoutResponse {
//     message: String!
// }

// `;

// export default userTypeDef;
