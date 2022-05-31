const {getOne, getMany, insert} = require('../tools/QueryTool')
const {pool} = require("../connector");

const getAllMeetings = () =>{
    return getMany(pool, `SELECT * FROM meetings`)
}
const getAllUserMeetings = () =>{
    return getMany(pool, `SELECT * FROM `)
}
const createNewMeeting = (name) =>{
    insert(pool, `INSERT INTO meetings (name) VALUES ('${name}')`)
}
const addMeetingUser = (meeting_id, user_id) => {
    insert(pool, `INSERT INTO user_meetings (meeting_id, user_id) VALUES (${meeting_id}, ${user_id})`)
}
const getLastMeeting = () => {
    return getOne (pool, `SELECT * FROM meetings WHERE id = (SELECT MAX(id) FROM meetings)`)
}
const getMeetingType = (meeting_id) =>{
    return getOne (pool, `SELECT * FROM meeting_types WHERE id = (SELECT type_id FROM meetings WHERE id = ${meeting_id})`)
}

module.exports = {
    getAllMeetings,
    getAllUserMeetings,
    createNewMeeting,
    getLastMeeting,
    addMeetingUser,
    getMeetingType
};