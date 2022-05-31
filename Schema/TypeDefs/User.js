const { gql } = require("apollo-server-express");

const UserTypes = gql`
    type Tag { 
        id: Int
        name: String
    }
    type User {
        id: Int!
        email: String! 
        first_name: String!
        last_name: String!
        birthday: String
        location: String
        avatar: Int!
        subscriptions: [User]
        subscribed: [User]
        posts: [Post]
        comments: [Comment]
        roles: [Role]
    }
    type AuthPayload {
        token: String!
        user: User!
    }

    enum Role{
        USER,
        MANAGER,
        ADMIN
    }
    
    type Query { 
        getAllUsers: [User]
        getUserById(id: Int!): User
        me: User! 

    }
    type Mutation {
        signup(email: String!, password: String!, first_name: String!, last_name: String!): AuthPayload
        signin(email: String!, password: String!): AuthPayload

        changeMyself(id: Int!, password: String!, email: String, first_name: String, last_name: String, birthday: String, location: String): User

        changeUserRoles(id: Int!, roles: [Int]): User
        addNewSubscription(user_id: Int!, subscribed_id: Int!) : Boolean
    }
    
`

module.exports = { 
    UserTypes
}