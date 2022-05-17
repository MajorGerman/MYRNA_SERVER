const queryTool = require('../../tools/QueryTool')
const {pool} = require("../../connector");
const PostResolvers = { 
    Query: {
        getAllPosts: async () => {
            let result = await queryTool.getMany(pool,`SELECT * FROM posts `)
            for (i of result){
                i.user = {"id" : i.author };
            }
            console.log(result);
            return result;
        },
        getPostById: async (_,{id}) => {
            return await queryTool.getOne(pool, `SELECT * FROM posts WHERE id = ${id}`)
        },
        getAllUserPostById: async (_,{id}) => {
            return await queryTool.getMany(pool,`SELECT * FROM posts WHERE author = ${id}`)
        },
        getAllSubscribedPosts: async (_,{id}) =>{
            return await queryTool.getMany(pool,`
            SELECT * FROM posts 
            WHERE author IN (
                SELECT subscribed_id
                FROM subscriptions
                WHERE user_id = ${id}
            )`)
        },
    },
    Mutation: {
        addNewPost: async (_,{user_id, header, content}) => {
            await queryTool.insert(pool,
                `INSERT INTO posts
                (author, header, content) VALUES
                (${user_id}, '${header.replaceAll("'", "''")}','${content.replaceAll("'", "''")}')`)

            return  await queryTool.getOne(pool, `SELECT * FROM posts WHERE id= LAST_INSERT_ID()` );
            

        },
        addNewComment: async (_,{user_id, post_id, content}) => {
            await queryTool.insert(pool,
                `INSERT INTO comments
                (post_id ,author, content) VALUES
                (${post_id}, ${user_id},'${content.replaceAll("'", "''")}')`)
            return await queryTool.getOne(pool, `SELECT * FROM comments WHERE id= LAST_INSERT_ID()` );
        },
        addNewSubscription: async (_,{user_id, subscribed_id}) => {
            await queryTool.insert(pool,
                `INSERT INTO subscriptions
                (user_id ,subscribed_id) VALUES
                (${user_id},${subscribed_id})`)
            return true
        },
    },
    Post: {
            comments: async  (post) => {
                return await queryTool.getMany(pool, `SELECT * FROM comments WHERE post_id = ${post.id}`)
            },
            author: async (post) =>{
                data = await queryTool.getOne(pool, `SELECT * FROM users WHERE id = (SELECT author FROM posts WHERE id = ${post.id})`)
    
                return data
            }
        },
    Comment: {
            author: async  (comment) => {
                return await queryTool.getOne(pool, `SELECT * FROM users WHERE id = ${comment.user_id}`)
            },
            post: async (comment) => {
                return await queryTool.getOne(pool, `SELECT * FROM posts WHERE id = ${comment.post_id}`)
            }
        }
    }

module.exports = {
    PostResolvers
}