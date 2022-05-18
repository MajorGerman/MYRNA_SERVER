const { gql } = require("apollo-server-express");
const PostTypes = gql`
    type Post {
        id: Int!
        author: User!
        header: String!
        content: String!
        likes: Int
        comments: [Comment]
    }
    type Comment {
        id: Int!
        post: Post!
        author: User
        content: String!
    }
    type Query{
        getPostById(id: Int!): Post

        getAllPosts: [Post]
        getAllUserPostById(id: Int!): [Post]
        getAllSubscribedPosts (id: Int!): [Post] 
    }
    type Mutation{
        addNewPost(user_id: Int!, header: String!, content: String!): Post
        addNewComment(user_id: Int!, post_id: Int!, content: String!): Comment
        likePost(user_id: Int!,post_id: Int! ): boolean
    }
`
module.exports = { 
    PostTypes
}