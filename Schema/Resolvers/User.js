const {pool} = require("../../connector");
let sql = require ("mysql2/promise");
const crypto = require('crypto');
const { Buffer } = require('buffer');
const passwordGenerator = require('../../tools/PasswordGeneratorTool')
const UserResolvers = { 
    Query: { 
        getAllUsers: async () => {
            let conn = await pool.getConnection()
            let res = await conn.query(`SELECT * FROM users ` );
            conn.release()
            let result = res[0];
            
            //console.log(rows)
            for (i of result){
                i.hashedPassword = i.hashedPassword.toString();
                i.salt = i.salt.toString();  
            }

            for (let i = 0; i < result.length; i++){
                let conn = await pool.getConnection()
                let res2 = await conn.query(`
                SELECT tags.id, tags.name FROM subscriptions 
                INNER JOIN tags ON tags.id = subscriptions.tag_id
                WHERE user_id = ${result[i].id}
                `);
                conn.release()

                result[i].tags = res2[0]
            }
            return result;
        },
        getUserById: async (_, { id }) => { 
            let conn = await pool.getConnection();
            let res = await conn.query(`SELECT * FROM users WHERE id = ${id}` );
            conn.release();
            data = res[0][0];
            console.log(data)

            data.hashedPassword = data.hashedPassword.toString();
            data.salt = data.salt.toString();  

            conn = await pool.getConnection();

            res2 = await conn.query(`
            SELECT tags.id, tags.name FROM subscriptions 
            INNER JOIN tags ON tags.id = subscriptions.tag_id
            WHERE user_id = ${id}
            `);

            data.tags = res[0]
            return data;
        },
        loginUser: async (_, { email, pass }) => { 
            let conn = await pool.getConnection();
            let [data, fields] = await conn.query(`SELECT id FROM users WHERE email = '${email}'`);
            conn.release();

            if (data.length == 0) return false;
            conn = await pool.getConnection();
            [data, fields] = await conn.query(`SELECT salt, hashedPassword FROM users WHERE email = '${email}'`);
            conn.release();
            data = data[0];
            return passwordGenerator.validatePassword(pass, data.salt, data.hashedPassword)

            
        }
            
    },
    Mutation: {
        addNewUser: async (_,{email, firstName, lastName,pass, birthday}) => {

            stringKey, salt = passwordGenerator.generateHashedPasswordAndSalt(pass);

            return pool.getConnection().then( (conn) =>{
                return conn.query(`INSERT INTO users 
                (email, hashedPassword, salt, firstName, lastName, birthday, location) VALUES
                ('${email}',0x${stringKey},0x${salt},'${firstName}','${lastName}','${birthday}','lol')`)
                .then((res) => {
                    return conn.query(`SELECT * FROM users WHERE id= LAST_INSERT_ID()`)
                    .then( ([data, fields]) => {
                        conn.release()
                        delete data[0].salt;
                        delete data[0].hashedPassword;
                        console.log(data[0])
                        return data[0]; 
                    })
                })
            });
        }
    }
}


module.exports = { 
    UserResolvers
}