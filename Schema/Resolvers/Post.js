const queryTool = require('../../tools/QueryTool')
const {pool} = require("../../connector");
const PostResolvers = { 
    Query: {
        getAllPosts: async () => {
            let result = await queryTool.getMany(pool,`SELECT * FROM posts ORDER BY id DESC`)
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
            const q = `INSERT INTO posts
            (author, header, content) VALUES
            (${user_id}, '${header}','${content}')`
            console.log(q)
            await queryTool.insert(pool, q)
            

            return  await queryTool.getOne(pool, `SELECT * FROM posts WHERE id= (SELECT MAX(id) FROM posts)` );
            

        },
        addNewComment: async (_,{user_id, post_id, content}) => {
            await queryTool.insert(pool,
                `INSERT INTO comments
                (post_id ,author, content) VALUES
                (${post_id}, ${user_id},'${content}')`)
            return await queryTool.getOne(pool, `SELECT * FROM comments WHERE id= (SELECT MAX(id) FROM comments)` );
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