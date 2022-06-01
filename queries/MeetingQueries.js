const {getOne, getMany, insert} = require('../tools/QueryTool')
const {pool} = require("../connector");

const getAllMeetings = () =>{
    return getMany(pool, `SELECT * FROM meetings`)
}
const getAllUserMeetings = (user_id) =>{
    return getMany(pool, `SELECT * FROM meetings WHERE id IN (SELECT id FROM user_meetings WHERE user_id = ${user_id})`)
}
const createNewMeeting =async (name, date, type,status) =>{
    await insert(pool, `INSERT INTO meetings (name ${date ? ',date ': ''} ${type ? ',type_id ': ''} ${status ? ',status ': ''}) 
    VALUES ('${name}' ${date ? `, '${date}' ` : '' } ${type ? `, ${type} ` : '' } ${status ? `, ${status} ` : '' })`)
}
const addMeetingUser = (meeting_id, user_id) => {
    insert(pool, `INSERT INTO user_meetings (meeting_id, user_id ) 
    VALUES (${meeting_id}, ${user_id} )`)
}
const getLastMeeting = () => {
    return getOne (pool, `SELECT * FROM meetings WHERE id = (SELECT MAX(id) FROM meetings)`)
}
const getMeetingType = (meeting_id) =>{
    return getOne (pool, `SELECT * FROM meeting_types WHERE id = (SELECT type_id FROM meetings WHERE id = ${meeting_id})`)
}
const getAllMeetingMembers = (meeting_id) =>{
    return getMany (pool, `SELECT * FROM users WHERE id IN (SELECT user_id FROM user_meetings WHERE meeting_id = ${meeting_id})`)
}
const addMeetingMessage = (meeting_id, author,content, referenceMessageId) =>{
    insert(pool, `INSERT INTO meeting_msg (meeting_id, author, content) VALUES (${meeting_id},${author},'${content}')`)
}

module.exports = {
    getAllMeetings,
    getAllUserMeetings,
    createNewMeeting,
    getLastMeeting,
    addMeetingUser,
    getMeetingType,
    getAllMeetingMembers
};