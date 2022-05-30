const {pool} = require("../../connector");
let sql = require ("mysql2/promise");
const crypto = require('crypto');
const { Buffer } = require('buffer');
const passwordGenerator = require('../../tools/PasswordGeneratorTool')
const queryTool = require('../../tools/QueryTool')
const responseGenerator = require('../../tools/ResponseGenerator')
const {verify, sign} = require ('jsonwebtoken');
const {isRolesInUser} = require('../../tools/FindUserRolesTool');
const getUserRoles = async (user_id) =>{
    const resp = await queryTool.getMany(pool, `SELECT DISTINCT name FROM roles WHERE roles.id IN (SELECT role_id FROM user_roles WHERE user_id = ${user_id})`);
    const roles = [];
    for (i of resp){
        roles.push (i.name)
    }
    return roles
}
const UserResolvers = { 
    Query: { 
        getAllUsers: async (_,__, ctx) => {
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(user.roles, ["ADMIN", "MANAGER"])) throw Error("You do not have rights (basically woman)")

            return result = await queryTool.getMany(pool,`SELECT * FROM users `)

        },
        getUserById: async (_, { id }) => { 
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(user.roles, ["ADMIN"])) throw Error("You do not have rights (basically woman)")

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

            let res = await queryTool.getMany(pool, `SELECT * FROM users WHERE email = '${email}'` );
            if (res.length > 0){
                throw Error("This email already exists");
            } 

            let [stringKey, salt] = await passwordGenerator.generateHashedPasswordAndSalt(password);
            try{
                let q = `INSERT INTO users 
                (email, hashed_password, salt, first_name, last_name) VALUES
                ('${email}',0x${stringKey},0x${salt},'${first_name}','${last_name}')`

                //console.log(q)
            await queryTool.insert(pool,q)

            } catch (err) {
                console.log(err)
            }

            let res2 = 0;
            let user = 0;
            try{
                res2 = await queryTool.getMany(pool, `SELECT id, email, hashed_password, salt, first_name, last_name FROM users WHERE id= (SELECT MAX(id) FROM users)` );
                //console.log(res)
                user = res2[0]
                await queryTool.insert(pool, `INSERT INTO user_roles (user_id, role_id) VALUES (${user.id}, ${1})` )
            } catch (err){
                console.log(err)
            }
            

            user.roles = getUserRoles(user.id);
            //console.log(res)
            const token = sign({"user": user}, process.env.SECRET_WORD)

            
            const auth = {token: token, user: user }
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


            data.roles = getUserRoles(data.id)
            const token = sign({user: data}, process.env.SECRET_WORD)


            const auth = {token: token, user: data }
            console.log(auth)
            return auth
        },
        changeMyself: async() =>{

        },
        changeUserRoles: async(_, { id, roles }) => {

            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(user.roles, ["ADMIN"])) throw Error("You do not have rights (basically woman)")

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
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(user.roles, ["USER","ADMIN"])) throw Error("You do not have rights (basically woman)")
            await queryTool.insert(pool, `INSERT INTO subscriptions (user_id, subscribed_id) VALUES (${user_id},${subscribed_id})`)
        }

        
    },
    User: {
        id: async (user) =>{
            let data = await queryTool.getOne (pool, `SELECT * FROM users WHERE id = ${user.id}` )

            if (!data){
                throw Error("No such user")
            }

            return data.id;
        },
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
            return ret
        }
    },
    
}



module.exports = { 
    UserResolvers
}