const queryTool = require('../tools/QueryTool')
const {pool} = require("../connector");

const getAllUserPosts = (user_id) =>{
    return queryTool.getMany(pool, `SELECT * FROM posts WHERE author = ${user_id}`)
}
const getAllUserComments = (user_id) => {
    return queryTool.getMany(pool, `SELECT * FROM comments WHERE author = ${user_id}`)
}
const deletePost = (post_id) => {
    queryTool.insert(pool, `UPDATE posts SET deleted = true WHERE id = ${post_id}`)
}

module.exports = {
    getAllUserPosts,
    getAllUserComments,
    deletePost
}