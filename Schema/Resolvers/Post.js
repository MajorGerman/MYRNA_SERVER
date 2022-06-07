const queryTool = require('../../tools/QueryTool')
const {pool} = require("../../connector");
const {verify, sign} = require ('jsonwebtoken');
const {isRolesInUser} = require('../../tools/FindUserRolesTool');

const UserQueries = require('../../queries/UserQueries')
const PostQueries = require('../../queries/PostQueries')

const getUserRoles = async (user_id) =>{
    const resp = await UserQueries.getAllUserRoles(user_id)
    console.log(resp)
    const roles = [];
    for (i of resp){
        roles.push (i.name)
    }
    return roles
}
const PostResolvers = { 
    Query: {
        getAllPosts: async () => {
            return PostQueries.getAllPosts();
        },
        getPostById: async (_,{id}) => {
            return PostQueries.getPostById(id)
        },
        getAllUserPostById: async (_,{id}) => {
            return PostQueries.getPostsByUserId(id)
        },
        getAllSubscribedPosts: async (_,{id}) =>{
            return PostQueries.getSubscribedPosts(id);
        },
        isPostLikedByUser: (_, {post_id, user_id})=>{
            return PostQueries.isPostLikedByUser(post_id, user_id)
        }
    },
    Mutation: {
        addNewPost: async (_,{user_id, header, content}) => {
            PostQueries.insertPost(user_id, header, content)
            
            return PostQueries.getLastPost()
            
        },
        addNewComment: async (_,{user_id, post_id, content}) => {
            PostQueries.insertComment(user_id, post_id, content)
            return PostQueries.getLastComment()
        },
        addNewSubscription: async (_,{user_id, subscribed_id}) => {
            await queryTool.insert(pool,
                `INSERT INTO subscriptions
                (user_id ,subscribed_id) VALUES
                (${user_id},${subscribed_id})`)
            return true
        },
        likePost: async (_, {user_id, post_id})=> {
            try {
                await queryTool.insert(pool, `INSERT INTO user_likes (user_id, post_id) VALUES (${user_id},${post_id})`);
                await queryTool.insert(pool, 
                `UPDATE posts 
                SET likes = likes + 1
                WHERE id = ${post_id}`)
                return true
            } catch (err){
                await queryTool.insert(pool, 
                    `DELETE FROM user_likes WHERE user_id = ${user_id} AND post_id = ${post_id}`);
                await queryTool.insert(pool, 
                    `UPDATE posts 
                    SET likes = likes - 1
                    WHERE id = ${post_id}`)
                return false
            }
            
        },
        deletePost: async (_, {post_id}, ctx)=> {
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            const user_id = (await PostQueries.getPostById(post_id)).author
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id != user_id) throw Error("You do not have rights (basically woman)")

            PostQueries.deletePost(post_id)
            return true;
        },
        deleteComment: async (_, {comment_id}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            const user_id = (await PostQueries.getCommentById(post_id)).author
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id != user_id) throw Error("You do not have rights (basically woman)")

            PostQueries.deleteComment(comment_id)
            return true;
        }
    },
    Post: {
            comments: async  (post) => {
                return await queryTool.getMany(pool, `SELECT * FROM comments WHERE post_id = ${post.id}`)
            },
            author: async (post) =>{
                data = await queryTool.getOne(pool, `SELECT * FROM users WHERE id = (SELECT author FROM posts WHERE id = ${post.id})`)
    
                return data
            },
            likes: async (post) =>{
                return post.likes || 0
            }
        },
    Comment: {
            author: async  (comment) => {
                return await queryTool.getOne(pool, `SELECT * FROM users WHERE id = (SELECT author FROM comments WHERE id = ${comment.id})`)
            },
            post: async (comment) => {
                return await queryTool.getOne(pool, `SELECT * FROM posts WHERE id = ${comment.post_id}`)
            }
        }
    }

module.exports = {
    PostResolvers
}