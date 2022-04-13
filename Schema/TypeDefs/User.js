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
        hashedPassword: String
        salt: String
        birthday: String!
        location: String
        subscriptions: [User]
        posts: [Post]
        comments: [Comment]
    }
    type Post {
        id: Int!
        author: User!
        content: String!
        comments: [Comment]
    }
    type Comment {
        id: Int!
        post: Post!
        author: User
        content: String!
    }
    
    type Query { 
        getAllUsers: [User]
        getUserById(id: ID): User

        loginUser(email: String! , pass: String!): Token!
        validateToken(id: Int!, password: String!): Boolean!

        getAllPosts: [Post]
        getPostById(id: Int): Post

    }
    type Mutation {
        addNewUser(email: String!, firstName: String!, lastName: String!,pass: String!, birthday:String!):User
        deleteToken(tokenId: Int!): Boolean!
        deleteExpiredTokens: Int!

        addNewPost(user_id: Int!, header: String!, content: String!): Post
        addNewComment(user_id: Int!, post_id: Int!, content: String!): Comment
        
        addNewSubscription(user_id: Int!, subscribed_id: Int!) : Boolean
    }
    type Token {
        id: Int!
        password: String!
        dateTaken: String!
        lastLogin: String!
    }
`

module.exports = { 
    UserTypes
}