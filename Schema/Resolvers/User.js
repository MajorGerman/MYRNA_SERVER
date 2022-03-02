const {pool} = require("../../connector");
let sql = require ("mysql2/promise");
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
        }
            
    }
}


module.exports = { 
    UserResolvers
}