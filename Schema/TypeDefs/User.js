const { gql } = require("apollo-server-express");
const UserTypes = gql`
    type Tag { 
        id: Int!
        name: String!
    }
    type User {
        id: Int!
        email: String!
        first_name: String!
        last_name: String!
        hashedPassword: String!
        salt: Int!
        birthday: String!
        location: String! 
        tags: [Tag!]!
    }
    
    type Query { 
        getAllUsers: User!
        getUserById(id: ID): [User!]!
    }
`

module.exports = { 
    UserTypes
}