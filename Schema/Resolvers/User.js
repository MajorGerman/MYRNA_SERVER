const passwordGenerator = require('../../tools/PasswordGeneratorTool')
const {verify, sign} = require ('jsonwebtoken');
const {isRolesInUser} = require('../../tools/FindUserRolesTool');
const UserQueries = require('../../queries/UserQueries')
const PostQueries = require('../../queries/PostQueries')
const MeetingQueries = require('../../queries/MeetingQueries')

const getUserRoles = async (user_id) =>{
    const resp = await UserQueries.getAllUserRoles(user_id)
    console.log(resp)
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
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])) throw Error("You do not have rights (basically woman)")

            return await UserQueries.getAllUsers();

        },
        getUserById: async (_, { id }, ctx) => { 
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"]) && user.id !== id) throw Error("You do not have rights (basically woman)")

            let data = await UserQueries.getUserById(id)

            if (!data){
                throw Error("No such user")
            }

            return data;
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

            let res = await UserQueries.getUsersByEmail(email);
            if (res.length > 0){
                throw Error("This email already exists");
            } 

            let [stringKey, salt] = await passwordGenerator.generateHashedPasswordAndSalt(password);
            try{
                
                UserQueries.insertUser(email, stringKey, salt, first_name, last_name)

            } catch (err) {
                console.log(err)
            }

            let user = 0;
            try{
                //console.log(res)
                user = await UserQueries.getLastInsertedUser()


                UserQueries.insertUserRole(user.id, 1); //1st role 
            } catch (err){
                console.log(err)
            }
            

            user.roles = await getUserRoles(user.id);
            const token = sign({"user": user}, process.env.SECRET_WORD)

            
            const auth = {token: token, user: user }
            return auth
        },
        signin: async (_, { email, password }) => { 
            let user = await UserQueries.getUsersByEmail(email);

            if (!user) throw Error('wrong email or password');
            if (user.length == 0) throw Error('wrong email');

            user = user[0]

            try{
                if ( !passwordGenerator.validatePassword(password, user.salt, user.hashed_password) ) throw Error('wrong email or password');
            } catch {
                throw Error('wrong email or password');
            }


            user.roles = await getUserRoles(user.id)
            const token = sign({user: user}, process.env.SECRET_WORD)

            const auth = {token: token, user: user }
            return auth
        },
        changeMyself: async() =>{

        },
        changeUserRoles: async(_, { id, roles }, ctx) => {

            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["ADMIN"])) throw Error("You do not have rights (basically woman)")

            const allRoles = await UserQueries.getAllRoles()
            const userRoles = await UserQueries.getAllUserRoles(id)

            let userRolesArray = []
            for (i of userRoles){
                userRolesArray.push(i.id)
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
                    UserQueries.insertUserRole(id, i)
                } catch (err) {
                    console.log(err)
                }
            }
            for (i of toChange.toDelete){
                try{
                    UserQueries.deleteUserRole(id, i)
                } catch (err) {
                    console.log(err)
                }
            }
            return {id: id}
        },
        addNewSubscription: async (_, {user_id, subscribed_id}, ctx) =>{
            const user = verify(ctx.req.headers['verify-token'], process.env.SECRET_WORD).user;
            if (!isRolesInUser(await getUserRoles(user.id), ["USER","ADMIN"]) && user.id !== user_id ) throw Error("You do not have rights (basically woman)")

            UserQueries.insertSubcription(user_id, subscribed_id);
        }

        
    },
    User: {
        id: async (user) =>{
            let user_ret = await UserQueries.getUserById(user.id)

            if (!user_ret){
                throw Error("No such user")
            }

            return user_ret.id;
        },
        email: async  (user) => {
            let user_ret = await UserQueries.getUserById(user.id)

            if (!user_ret){
                throw Error("No such user")
            }

            return user_ret.email;
        },
        first_name: async  (user) => {
            let user_ret = await UserQueries.getUserById(user.id)

            if (!user_ret){
                throw Error("No such user")
            }

            return user_ret.first_name;
        },
        last_name: async  (user) => {
            let user_ret = await UserQueries.getUserById(user.id)

            if (!user_ret){
                throw Error("No such user")
            }

            return user_ret.last_name;
        },
        subscriptions: async  (user) =>{
            return await UserQueries.getAllSubsciptions(user.id)
        },
        subscribed: async (user) => {
            return await UserQueries.getAllSubscribed(user.id);
        },
        posts: async  (user) => {
           return await PostQueries.getAllUserPosts(user.id);
        },
        comments: async  (user) => {
            return await PostQueries.getAllUserComments(user.id)
        },
        roles: async (user) => {
            return await getUserRoles(user.id)
        },
        meetings: async (user) => {
            return MeetingQueries.getAllUserMeetings(user.id)
        }
    },
    
}



module.exports = { 
    UserResolvers
}