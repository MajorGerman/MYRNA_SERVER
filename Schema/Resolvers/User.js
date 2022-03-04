const {pool} = require("../../connector");
let sql = require ("mysql2/promise");
const crypto = require('crypto');
const { Buffer } = require('buffer');
const passwordGenerator = require('../../tools/PasswordGeneratorTool')
const queryTool = require('../../tools/QueryTool')
const responseGenerator = require('../../tools/ResponseGenerator')
const UserResolvers = { 
    Query: { 
        getAllUsers: async () => {

            let result = await queryTool.getMany(pool,`SELECT * FROM users `)
            
            //console.log(rows)
            for (i of result){
                i.hashedPassword = i.hashedPassword.toString();
                i.salt = i.salt.toString();  
            }

            for (let i = 0; i < result.length; i++){
                let tags = await queryTool.getMany (pool, 
                `SELECT tags.id, tags.name FROM subscriptions 
                INNER JOIN tags ON tags.id = subscriptions.tag_id
                WHERE user_id = ${result[i].id}`)
                result[i].tags = tags
            }
            return result;
        },
        getUserById: async (_, { id }) => { 
            let data = await queryTool.getOne (pool, `SELECT * FROM users WHERE id = ${id}` )

            data.hashedPassword = data.hashedPassword.toString();
            data.salt = data.salt.toString();  

            let tags = await queryTool.getMany(pool,`
            SELECT tags.id, tags.name FROM subscriptions 
            INNER JOIN tags ON tags.id = subscriptions.tag_id
            WHERE user_id = ${id}
            `)
            data.tags = tags
            return data;
        },
        loginUser: async (_, { email, pass }) => { 
            let data = await queryTool.getOne (pool,`SELECT id FROM users WHERE email = '${email}'`)

            if (!data) throw Error('wrong email or password');
            if (data.length == 0) throw Error('wrong email');
            let user_id = data.id;

            data = await queryTool.getOne (pool,`SELECT id, salt, hashedPassword FROM users WHERE email = '${email}'`)

            if ( !passwordGenerator.validatePassword(pass, data.salt, data.hashedPassword) ) throw Error('wrong email or password');

            let [hashedPassword, salt, passwordString] = passwordGenerator.generateHashedPasswordAndSaltWithoutString();

            await queryTool.insert(pool, `INSERT INTO sessions (user_id, hash, hashedToken) VALUES (${user_id}, 0x${salt}, 0x${hashedPassword})`);

            data = await queryTool.getOne(pool, `SELECT id, dateTaken, lastLogin FROM sessions WHERE id = LAST_INSERT_ID()`)

            return {
                'id': data.id,
                'password': passwordString,
                'dateTaken': data.dateTaken,
                'lastLogin': data.lastLogin
            }
        },
        validateToken: async (_, {id, password}) => {

            data = await queryTool.getOne (pool,`SELECT id, hash, hashedToken FROM sessions WHERE id = '${id}'`);

            if (!data || data.length == 0) return false

            if (passwordGenerator.validatePassword(password, data.hash, data.hashedToken) ) {
                await queryTool.insert (pool, `UPDATE sessions SET lastLogin = NOW() WHERE id = ${id}`)
                return true
            } else {
                return false
            }
            
        }
            
    },
    Mutation: {
        addNewUser: async (_,{email, firstName, lastName,pass, birthday}) => {

            let res = await queryTool.getMany(pool, `SELECT * FROM users WHERE email = '${email}'` );
            if (res.length > 0){
                throw Error("This email already exists");
            } 

            let [stringKey, salt] = await passwordGenerator.generateHashedPasswordAndSalt(pass);
            await queryTool.insert(pool,
                `INSERT INTO users 
                (email, hashedPassword, salt, firstName, lastName, birthday, location) VALUES
                ('${email}',0x${stringKey},0x${salt},'${firstName}','${lastName}','${birthday}','lol')`)

            res = await queryTool.getOne(pool, `SELECT * FROM users WHERE id= LAST_INSERT_ID()` );
            delete res.salt;
            delete res.hashedPassword;
            return res;
        },
        deleteToken: async (_,{id}) => {
            await queryTool.insert(pool, `DELETE FROM sessions WHERE id = ${id}`)
            return true
        },
        deleteExpiredTokens: async () => {
            await queryTool.insert(pool, `DELETE FROM sessions WHERE DATEDIFF(lastLogin, NOW()) > 14`)
            return 0
        },
    }
}


module.exports = { 
    UserResolvers
}