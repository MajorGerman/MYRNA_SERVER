const queryTool = require('../tools/QueryTool')
const {pool} = require("../connector");

const getAllUserPosts = (user_id) =>{
    return queryTool.getMany(pool, `SELECT * FROM posts WHERE author = ${user_id}`)
}
const getAllUserComments = (user_id) => {
    return queryTool.getMany(pool, `SELECT * FROM comments WHERE author = ${user_id}`)
}

module.exports = {
    getAllUserPosts,
    getAllUserComments
}