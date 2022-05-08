const queryTool = require('../../tools/QueryTool')
const {pool} = require("../../connector");
const PostResolvers = { 
    Query: {
        getAllPosts: async () => {
            let result = await queryTool.getMany(pool,`SELECT * FROM posts `)
            return result;
        }
    },
}
module.exports = {
    PostResolvers
}