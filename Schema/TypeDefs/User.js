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
        location: Location
        avatar: Int!
        subscriptions: [User]
        subscribed: [User]
        posts: [Post]
        comments: [Comment]
        roles: [Role],
        meetings: [Meeting],
        likedPosts: [Post]
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
        signup(email: String!, password: String!, first_name: String!, last_name: String!, location_id: Int, birthday: String): AuthPayload
        signin(email: String!, password: String!): AuthPayload

        changeUser(user_id: Int!,email: String, password: String, , first_name: String, last_name: String, birthday: String, location: Int): User

        changeUserRoles(id: Int!, roles: [Int]): User
        addNewSubscription(user_id: Int!, subscribed_id: Int!) : Boolean

        getUsersByName(search:String): [User]
    }
    
`

module.exports = { 
    UserTypes
}