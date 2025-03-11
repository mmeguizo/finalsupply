const userTypeDef = `#graphql

type User {
    _id: ID!
    email: String!
    name: String!
    password: String!
    profilePic: String
    gender: String!
    role: String!
}

type Query {
    users: [User!]
    authUser: User
    user(userId: ID!): User
}


type Mutation {
    signUp(input: SignUpInput!) : User
    updateUser(input: UpdateUserInput!): User
    login(input:LoginInput!): User
    logout: LogoutResponse
}

input UpdateUserInput {
    userId: ID!
    name: String
    profilePic: String
    password: String
    gender: String
    email: String
    role: String

}

input SignUpInput {
    email: String!
    name: String!
    password: String!
    gender: String!
}

input LoginInput {
    # email: String!
    email: String!
    password: String!
}

type LogoutResponse {
    message: String!
}


`;

export default userTypeDef;
