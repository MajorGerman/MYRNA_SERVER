const {pool} = require("../../connector");
let sql = require ("mysql2/promise");
const UserResolvers = { 
    Query: { 
        getAllUsers: async () => {
            let final_result;
            let promise = pool.promise();
            let [rows,fields]  = await promise.query(`SELECT * FROM users ` );
            //console.log(rows)
            for (i of rows){
                i.hashedPassword = i.hashedPassword.toString();
                i.salt = i.salt.toString();  
            }

            result = rows
            for (let i = 0; i < rows.length; i++){
                let promise = pool.promise();
                let [rows2, fields]   = await promise.execute(`
                SELECT tags.id, tags.name FROM subscriptions 
                INNER JOIN tags ON tags.id = subscriptions.tag_id
                WHERE user_id = ${rows[i].id}
                `);
                console.log(rows2)
                rows[i].tags = rows2
            }
            console.log(rows)
            return rows;
        },
        getUserById: async (_, { id }) => { 
            let promise = pool.promise();
            let [rows,fields]  = await promise.query(`SELECT * FROM users WHERE id = ${id}` );
            console.log(rows)
            i.hashedPassword = i.hashedPassword.toString();
            i.salt = i.salt.toString();  

            promise = pool.promise();

            [rows2, fields2]   = await promise.execute(`
            SELECT tags.id, tags.name FROM subscriptions 
            INNER JOIN tags ON tags.id = subscriptions.tag_id
            WHERE user_id = ${id}
            `);
            rows.tags = rows2
            console.log(rows)
            return rows;
        }
            
    }
}


module.exports = { 
    UserResolvers
}