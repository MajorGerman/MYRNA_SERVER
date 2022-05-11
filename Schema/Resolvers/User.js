const {pool} = require("../../connector");
let sql = require ("mysql2/promise");
const crypto = require('crypto');
const { Buffer } = require('buffer');
const passwordGenerator = require('../../tools/PasswordGeneratorTool')
const queryTool = require('../../tools/QueryTool')
const responseGenerator = require('../../tools/ResponseGenerator')
const {verify, sign} = require ('jsonwebtoken');
const UserResolvers = { 
    Query: { 
        getAllUsers: async () => {

            return result = await queryTool.getMany(pool,`SELECT * FROM users `)

        },
        getUserById: async (_, { id }) => { 
            let data = await queryTool.getOne (pool, `SELECT * FROM users WHERE id = ${id}` )

            if (!data){
                throw Error("No such user")
            }

            return data;
        },
        me: async (_, __, {req}) => {
            if (!req.user_id){
                return null;
            }

            return User.getUserById(req.user_id)
        }
            
    },
    Mutation: {
        signup: async (_,{email, first_name, last_name,password}) => {
            if (email.length > 50){
                throw Error('Email is too long')
            }
            if (! /^[a-zA-Z0-9.!#$%&’*+\=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)){
                throw Error('Invalid Email')
            }
            if (password.length <= 8){
                throw Error('Password too short')
            }
            if (first_name.length > 40){
                throw Error('First name is too long')
            }
            if (last_name.length > 40){
                throw Error('Last name is too long')
            }           
            if (!/([A-Za-z-])/.test(first_name)){
                throw Error("Invalid first name")
            } 
            if (!/([A-Za-z-])/.test(last_name)){
                throw Error("Invalid last name")
            } 
            let res = await queryTool.getMany(pool, `SELECT * FROM users WHERE email = '${email}'` );
            if (res.length > 0){
                throw Error("This email already exists");
            } 

            let [stringKey, salt] = await passwordGenerator.generateHashedPasswordAndSalt(password);
            try{
            await queryTool.insert(pool,
                `INSERT INTO users 
                (email, hashed_password, salt, first_name, last_name) VALUES
                ('${email}',0x${stringKey},0x${salt},'${first_name}','${last_name}')`)

            }catch (err){
                console.log(err)
            }

            try{
                res = await queryTool.getMany(pool, `SELECT id, email, hashed_password, salt, first_name, last_name FROM users WHERE id= LAST_INSERT_ID()` )[0];
                console.log(res)
                await queryTool.insert(pool, `INSERT INTO user_roles (user_id, role_id) VALUES (${res.id}, ${1})` )
            } catch (err){
                console.log(err)
            }
            

            console.log(res)
            const token = sign({"user_id": res.id}, process.env.SECRET_WORD)

            const auth = {token: token, user: res }
            return auth
        },
        signin: async (_, { email, password }) => { 
            let data = await queryTool.getOne (pool,`SELECT id FROM users WHERE email = '${email}'`)

            if (!data) throw Error('wrong email or password');
            if (data.length == 0) throw Error('wrong email');

            data = await queryTool.getOne (pool,`SELECT id, salt, hashed_password FROM users WHERE email = '${email}'`)

            try{
                if ( !passwordGenerator.validatePassword(password, data.salt, data.hashed_password) ) throw Error('wrong email or password');
            } catch {
                throw Error('wrong email or password');
            }


            const token = sign({user_id: data.id}, process.env.SECRET_WORD)

            const auth = {token: token, user: data }
            console.log(auth)
            return auth
        },
        changeMyself: async() =>{

        },
        changeUserRoles: async(_, { id, roles }) => {
            const allRoles = await queryTool.getMany(pool, `SELECT id FROM roles`);
            const userRoles = await queryTool.getMany(pool, `SELECT role_id FROM user_roles WHERE user_id = ${id}`);
            let userRolesArray = []
            for (i of userRoles){
                userRolesArray.push(i.role_id)
            }
            const toChange = {
                'toDelete': [],
                'toAdd': []
            }
            
            for (i of allRoles){
                if (roles.includes(i.id) && !userRolesArray.includes(i.id)){
                    toChange.toAdd.push(i.id)
                } else if (!roles.includes(i.id) && userRolesArray.includes(i.id)){
                    toChange.toDelete.push(i.id)
                }
            }
            
            for (i of toChange.toAdd){
                try{
                    await queryTool.insert(pool, `INSERT INTO user_roles (user_id, role_id) VALUES (${id},${i})`)
                } catch (err) {
                    console.log(err)
                }
            }
            for (i of toChange.toDelete){
                try{
                    await queryTool.insert(pool, `DELETE FROM user_roles WHERE user_id = ${id} AND role_id = ${i}`)
                } catch (err) {
                    console.log(err)
                }
            }
            return user = {id: id}
        },
        addNewSubscription: async (_, {user_id, subscribed_id}) =>{
            await queryTool.insert(pool, `INSERT INTO subscriptions (user_id, subscribed_id) VALUES (${user_id},${subscribed_id})`)
        }

        
    },
    User: {
        email: async  (user) => {
            let data = await queryTool.getOne (pool, `SELECT * FROM users WHERE id = ${user.id}` )

            if (!data){
                throw Error("No such user")
            }

            return data.email;
        },
        first_name: async  (user) => {
            let data = await queryTool.getOne (pool, `SELECT * FROM users WHERE id = ${user.id}` )

            if (!data){
                throw Error("No such user")
            }

            return data.first_name;
        },
        last_name: async  (user) => {
            let data = await queryTool.getOne (pool, `SELECT * FROM users WHERE id = ${user.id}` )

            if (!data){
                throw Error("No such user")
            }

            return data.last_name;
        },
        subscriptions: async  (user) =>{
            return await queryTool.getMany(pool, `SELECT * FROM users WHERE users.id IN (SELECT subscribed_id FROM subscriptions WHERE user_id = ${user.id})`)
        },
        subscribed: async (user) => {
            return await queryTool.getMany(pool, `SELECT * FROM users WHERE users.id IN (SELECT user_id FROM subscriptions WHERE subscribed_id = ${user.id})`)
        },
        posts: async  (user) => {
            res = await queryTool.getMany(pool, `SELECT * FROM posts WHERE user_id = ${user.id}`)
            return res
        },
        comments: async  (user) => {
            return await queryTool.getMany(pool, `SELECT * FROM comments WHERE user_id = ${user.id}`)
        },
        roles: async (user) => {
            const resp = await queryTool.getMany(pool, `SELECT DISTINCT name FROM roles WHERE roles.id IN (SELECT role_id FROM user_roles WHERE user_id = ${user.id})`)
            let ret = []
            for (i of resp){
                ret.push (i.name)
            }
            console.log(ret)
            return ret
        }
    },
    
}



module.exports = { 
    UserResolvers
}