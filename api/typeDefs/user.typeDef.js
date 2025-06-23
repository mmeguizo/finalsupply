const userTypeDef = `#graphql

type User {
    id: ID!  # Changed _id to id for Sequelize
    email: String!
    name: String!
    last_name: String
    employee_id: String
    department: String
    position: String
    profile_pic: String
    gender: String!
    role: String!
    is_active: Boolean!
    location: String
}

type Query {
    users: [User!]
    authUser: User
    user(userId: ID!): User
    countAllUsers : Int
}

type Mutation {
    signUp(input: SignUpInput!): User
    # updateUser(input: UpdateUserInput!): User
    login(input: LoginInput!): User
    logout: LogoutResponse
    editUser(input: EditUserInput!): User
    createUser(input: CreateUserInput!): User
    deleteUser(userId: ID!): User
}

type LogoutResponse {
    message: String!
}

input EditUserInput {
    id: ID!
    name: String
    last_name: String
    employee_id: String
    department: String
    position: String
    gender: String
    email: String
    role: String
    password: String
    confirm_password: String
    location: String
}

input CreateUserInput {
    name: String!
    last_name: String!
    employee_id: String!
    department: String!
    position: String!
    gender: String!
    email: String!
    role: String!
    password: String!
    confirm_password: String!
    location: String
}
input UpdateUserInput {
    userId: ID!
    name: String
    last_name: String
    employee_id: String
    department: String
    position: String
    profile_pic: String
    password: String
    gender: String
    email: String
    role: String
    is_active: Boolean
    location: String
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


`;

export default userTypeDef;
