const queryTool = require('../tools/QueryTool')
const {pool} = require("../connector");


const getAllUsers = () =>{
    return queryTool.getMany(pool,`SELECT * FROM users `)
}
const getUserById = (id) =>{
    return queryTool.getOne (pool, `SELECT * FROM users WHERE id = ${id}` )
}
const getUsersByEmail = (email) => {
    return queryTool.getMany(pool, `SELECT * FROM users WHERE email = '${email}'` );
}
const insertUser = async (email, stringKey, salt, first_name, last_name ,location_id, birthday) => {
    console.log(`
    INSERT INTO users 
    (email, hashed_password, salt, first_name, last_name ${location_id ? ',location ': ''} ${birthday ? ',birthday ': ''}) VALUES
    ('${email}',0x${stringKey},0x${salt},'${first_name}','${last_name}' ${location_id ? `, ${location_id} ` : '' } ${birthday ? `, '${birthday}' ` : '' })`)
    await queryTool.insert(pool,`
        INSERT INTO users 
        (email, hashed_password, salt, first_name, last_name ${location_id ? ',location ': ''} ${birthday ? ',birthday ': ''}) VALUES
        ('${email}',0x${stringKey},0x${salt},'${first_name}','${last_name}' ${location_id ? `, ${location_id} ` : '' } ${birthday ? `, '${birthday}' ` : '' })`)
    
}
const getLastInsertedUser = () => {
    return queryTool.getOne(pool, `SELECT * FROM users WHERE id= (SELECT MAX(id) FROM users)` );
}
const insertUserRole = (user_id, role_id) => {
    console.log(user_id, role_id)
    queryTool.insert(pool, `INSERT INTO user_roles (user_id, role_id) VALUES (${user_id}, ${role_id})` )
}
const getAllRoles = () => {
    return queryTool.getMany(pool, `SELECT * FROM roles`);
}
const getAllUserRoles = (user_id) => {
    return queryTool.getMany(pool, `SELECT * FROM roles WHERE id IN (SELECT role_id FROM user_roles WHERE user_id = ${user_id})`);
}
const deleteUserRole = (user_id, role_id) => {
    queryTool.insert(pool, `DELETE FROM user_roles WHERE user_id = ${user_id} AND role_id = ${role_id}`)
}
const insertSubcription = (user_id, subscribed_id) => {
    queryTool.insert(pool, `INSERT INTO subscriptions (user_id, subscribed_id) VALUES (${user_id},${subscribed_id})`)
}
const getAllSubsciptions = (user_id) => {
    return queryTool.getMany(pool, `SELECT * FROM users WHERE users.id IN (SELECT subscribed_id FROM subscriptions WHERE user_id = ${user_id})`)
}
const getAllSubscribed = (user_id) => {
    return queryTool.getMany(pool, `SELECT * FROM users WHERE users.id IN (SELECT user_id FROM subscriptions WHERE subscribed_id = ${user_id})`)
}


module.exports = {
    getAllUsers,
    getUserById,
    getUsersByEmail, 
    insertUser, 
    getLastInsertedUser, 
    insertUserRole, 
    getAllRoles,
    getAllUserRoles,
    deleteUserRole,
    insertSubcription,
    getAllSubsciptions,
    getAllSubscribed,
}