const { gql } = require("apollo-server-express");
const UserTypes = gql`
    type User { 
        name: String
    }

    type Query { 
        getAllUsers: User
    }
`

module.exports = { 
    UserTypes
}