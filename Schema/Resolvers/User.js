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

            return result;
        },
        getUserById: async (_, { id }) => { 
            let data = await queryTool.getOne (pool, `SELECT * FROM users WHERE id = ${id}` )

            if (!data){
                throw Error("No such user")
            }
            data.hashedPassword = data.hashedPassword.toString();
            data.salt = data.salt.toString();  

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
            if (email.length > 50){
                throw Error('Email is too long')
            }
            if (! /^[a-zA-Z0-9.!#$%&’*+\=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)){
                throw Error('Invalid Email')
            }
            if (pass.length <= 8){
                throw Error('Password too short')
            }
            if (! /(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})/.test(birthday)){
                throw Error('Invalid date')
            }
            if (firstName.length > 40){
                throw Error('First name is too long')
            }
            if (lastName.length > 40){
                throw Error('Last name is too long')
            }           
            if (!/([A-Za-z-])/.test(firstName)){
                throw Error("Invalid first name")
            } 
            if (!/([A-Za-z-])/.test(lastName)){
                throw Error("Invalid last name")
            } 
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
            res.salt = res.salt.toString('hex');
            res.hashedPassword = res.hashedPassword.toString('hex');
            return res;
        },
        deleteToken: async (_,{tokenId}) => {
            await queryTool.insert(pool, `DELETE FROM sessions WHERE id = ${tokenId}`)
            return true
        },
        deleteExpiredTokens: async () => {
            await queryTool.insert(pool, `DELETE FROM sessions WHERE DATEDIFF(lastLogin, NOW()) > 14`)
            return 0
        },
        addNewPost: async (_,{user_id, header, content}) => {
            await queryTool.insert(pool,
                `INSERT INTO posts
                (user_id, header, content) VALUES
                (${user_id}, '${header.replaceAll("'", "''")}','${content.replaceAll("'", "''")}')`)

            return  await queryTool.getOne(pool, `SELECT * FROM posts WHERE id= LAST_INSERT_ID()` );
            

        },
        addNewComment: async (_,{user_id, post_id, content}) => {
            await queryTool.insert(pool,
                `INSERT INTO comments
                (post_id ,user_id, content) VALUES
                (${post_id}, ${user_id},'${content.replaceAll("'", "''")}')`)
            return await queryTool.getOne(pool, `SELECT * FROM comments WHERE id= LAST_INSERT_ID()` );
        },
        addNewSubscription: async (_,{user_id, subscribed_id}) => {
            await queryTool.insert(pool,
                `INSERT INTO subscriptions
                (user_id ,subscribed_id) VALUES
                (${user_id},${subscribed_id})`)
            return true
        },
    },
    User: {
        subscriptions: async  (user) =>{
            res = await queryTool.getMany(pool, `SELECT * FROM users WHERE users.id IN (SELECT subscribed_id FROM subscriptions WHERE user_id = ${user.id})`)
            for (i of res){
                i.hashedPassword = i.hashedPassword.toString();
                i.salt = i.salt.toString();  
            }
            return res
        },
        posts:async  (user) => {
            res = await queryTool.getMany(pool, `SELECT * FROM posts WHERE user_id = ${user.id}`)
            for (i of res){
                i.hashedPassword = i.hashedPassword.toString();
                i.salt = i.salt.toString();  
            }
            return res
        },
        comments:async  (user) => {
            res = await queryTool.getMany(pool, `SELECT * FROM comments WHERE user_id = ${user.id}`)
            for (i of res){
                i.hashedPassword = i.hashedPassword.toString();
                i.salt = i.salt.toString();  
            }
            return res
        }
    },
    Post: {
        comments: async  (post) => {
            return await queryTool.getMany(pool, `SELECT * FROM comments WHERE post_id = ${post.id}`)
        },
        author: async (post) =>{
            data = await queryTool.getOne(pool, `SELECT * FROM users WHERE id = ${post.user_id}`)

            data.hashedPassword = data.hashedPassword.toString();
            data.salt = data.salt.toString();  
            return data
        }
    },
    Comment: {
        author: async  (comment) => {
            return await queryTool.getOne(pool, `SELECT * FROM users WHERE id = ${comment.user_id}`)
        },
        post: async (comment) => {
            return await queryTool.getOne(pool, `SELECT * FROM posts WHERE id = ${comment.post_id}`)
        }
    }
}



module.exports = { 
    UserResolvers
}