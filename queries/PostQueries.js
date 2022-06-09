const queryTool = require('../tools/QueryTool')
const {pool} = require("../connector");

const getAllUserPosts = (user_id) =>{
    return queryTool.getMany(pool, `SELECT * FROM posts WHERE deleted = 0 AND author = ${user_id}`)
}
const getAllUserComments = (user_id) => {
    return queryTool.getMany(pool, `SELECT * FROM comments WHERE deleted = 0 AND author = ${user_id}`)
}
const deletePost = (post_id) => {
    queryTool.insert(pool, `UPDATE posts SET deleted = true WHERE id = ${post_id}`)
}
const deleteComment = (comment_id) => {
    queryTool.insert(pool, `UPDATE comments SET deleted = true WHERE id = ${comment_id}`)
}
const getPostById = (post_id) => {
    return queryTool.getOne(pool, `SELECT * FROM posts WHERE deleted = 0 AND id = ${post_id}`)
}
const getCommentById =(comment_id) =>{
    return queryTool.getOne(pool, `SELECT * FROM comments WHERE deleted = 0 AND id = ${comment_id}`)
}
const getAllPosts = () =>{
    return queryTool.getMany(pool,`SELECT * FROM posts WHERE deleted = 0 ORDER BY id DESC`)
}
const getPostsByUserId = (user_id) => {
    return queryTool.getMany(pool,`SELECT * FROM posts WHERE deleted = 0 AND author = ${user_id}`)
}
const getSubscribedPosts = (user_id) => {
    return queryTool.getMany(pool,`
            SELECT * FROM posts 
            WHERE author IN (
                SELECT subscribed_id
                FROM subscriptions
                WHERE user_id = ${user_id}
            )`)
}
const getLikedPostByUserId = (user_id) =>{
    return queryTool.getMany(pool, `
        SELECT * FROM posts
        WHERE id IN (
            SELECT post_id FROM user_likes
            WHERE user_id = ${user_id}
        )
    `)
}
const isPostLikedByUser = async (post_id, user_id) =>{
    try{
        if ((await queryTool.getMany(pool,`
            SELECT * FROM user_likes
            WHERE user_id = ${user_id} AND post_id = ${post_id}
            `)).length > 0){
                return true
        }
    } catch (err){
        return false
    }
    return false
}
const insertPost = (user_id, header, content) => {
    queryTool.insert(pool, `INSERT INTO posts
            (author, header, content) VALUES
            (${user_id}, "${header.replace(`"`, `""`)}","${content.replace(`"`, `""`)}")`)
}
const getLastPost = () =>{
    return queryTool.getOne(pool, `SELECT * FROM posts WHERE id= (SELECT MAX(id) FROM posts)` );
}
const insertComment = (user_id, post_id, content) =>{
    queryTool.insert(pool,
        `INSERT INTO comments
        (post_id ,author, content) VALUES
        (${post_id}, ${user_id},'${content}')`)
}
const getLastComment = () =>{
    return queryTool.getOne(pool, `SELECT * FROM comments WHERE id= (SELECT MAX(id) FROM comments)` );
}
module.exports = {
    getAllUserPosts,
    getAllUserComments,
    deletePost,
    deleteComment,
    getPostById,
    getCommentById,
    getAllPosts,
    getPostsByUserId,
    getSubscribedPosts,
    getLikedPostByUserId,
    isPostLikedByUser,
    insertPost,
    getLastPost,
    insertComment,
    getLastComment
}