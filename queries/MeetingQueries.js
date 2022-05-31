const {getOne, getMany} = require('../tools/QueryTool')
const {pool} = require("../connector");

const getAllMeetings = () =>{
    return getMany(pool, `SELECT * FROM meetings`)
}

module.exports = {
    getAllMeetings,
};