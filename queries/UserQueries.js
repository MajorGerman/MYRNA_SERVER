const queryTool = require('../tools/QueryTool')
const {pool} = require("../connector");
const {getOne, getMany, insert} = require('../tools/QueryTool')


const getAllUsers = () =>{
    return getMany(pool,`SELECT * FROM users `)
}
const getUserById = (id) =>{
    return getOne (pool, `SELECT * FROM users WHERE id = ${id}` )
}
const getUsersByEmail = (email) => {
    return getMany(pool, `SELECT * FROM users WHERE email = '${email}'` );
}
const insertUser = async (email, stringKey, salt, first_name, last_name ,location_id, birthday) => {
    await insert(pool,`
        INSERT INTO users 
        (email, hashed_password, salt, first_name, last_name ${location_id ? ',location ': ''} ${birthday ? ',birthday ': ''}) VALUES
        ('${email}',0x${stringKey},0x${salt},'${first_name}','${last_name}' ${location_id ? `, ${location_id} ` : '' } ${birthday ? `, '${birthday}' ` : '' })`)
    
}
const getLastInsertedUser = () => {
    return getOne(pool, `SELECT * FROM users WHERE id= (SELECT MAX(id) FROM users)` );
}
const insertUserRole = (user_id, role_id) => {
    console.log(user_id, role_id)
    insert(pool, `INSERT INTO user_roles (user_id, role_id) VALUES (${user_id}, ${role_id})` )
}
const getAllRoles = () => {
    return getMany(pool, `SELECT * FROM roles`);
}
const getAllUserRoles = (user_id) => {
    return getMany(pool, `SELECT * FROM roles WHERE id IN (SELECT role_id FROM user_roles WHERE user_id = ${user_id})`);
}
const deleteUserRole = (user_id, role_id) => {
    insert(pool, `DELETE FROM user_roles WHERE user_id = ${user_id} AND role_id = ${role_id}`)
}
const insertSubcription = (user_id, subscribed_id) => {
    insert(pool, `INSERT INTO subscriptions (user_id, subscribed_id) VALUES (${user_id},${subscribed_id})`)
}
const getAllSubsciptions = (user_id) => {
    return getMany(pool, `SELECT * FROM users WHERE users.id IN (SELECT subscribed_id FROM subscriptions WHERE user_id = ${user_id})`)
}
const getAllSubscribed = (user_id) => {
    return getMany(pool, `SELECT * FROM users WHERE users.id IN (SELECT user_id FROM subscriptions WHERE subscribed_id = ${user_id})`)
}
const updateUser = async (user_id, user) => {
    const generateSetters = (user) => {
        let setters = ""
        for (i of Object.keys(user)){
            if (user[i]){
                if (setters == ""){
                    setters += ` ${i} = '${user[i]}' `
                } 
                else if (setters != "" ){
                    setters += ','
                    setters += ` ${i} = '${user[i]}' `
                }
            }
            
        }
        return setters
    }
    await insert(pool, `
        UPDATE users SET ${generateSetters(user)} WHERE id = ${user_id}
    `)
    
}
const getUsersWithSimilarName = async (search, levenshtein) =>{
    return await getMany(pool, `
        SELECT * FROM users 
        WHERE CONCAT(first_name, last_name, email) LIKE '%${search}%' 
        `)
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
    updateUser,
    getUsersWithSimilarName
}