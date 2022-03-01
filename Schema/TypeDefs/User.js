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
        location: String!
        tags: [Tag]
    }
    
    type Query { 
        getAllUsers: [User!]!
        getUserById(id: ID): User!
    }
`

module.exports = { 
    UserTypes
}