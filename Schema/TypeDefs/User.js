const { gql } = require("apollo-server-express");
const UserTypes = gql`
    type Tag { 
        id: Int
        name: String
    }
    type User {
        id: Int!
        email: String!
        firstName: String!
        lastName: String!
        hashedPassword: String!
        salt: String!
        birthday: String!
        location: String
        tags: [Tag]
    }
    type User_client {
        id: Int!
        email: String!
        firstName: String!
        lastName: String!
        birthday: String!
        location: String
        tags: [Tag]
    }
    
    type Query { 
        getAllUsers: [User_client!]!
        getUserById(id: ID): User!
        loginUser(email: String! , pass: String!): Boolean
    }
    type Mutation {
        addNewUser(email: String!, firstName: String!, lastName: String!,pass: String!, birthday:String!):User
    }
    type Error {
        err: Boolean!
        code: Int!
        description: String!
    }
`

module.exports = { 
    UserTypes
}