let con = require("../connector.js")

const UserResolvers = { 
    Query: { 
        getAllUsers: async () => {
            let final_result;
            con.connect(function(err) {
                if (err) throw err;
                con.query(
                    `SELECT * FROM users ` , function (err, result) {
                  if (err) return null;
                    for (i in result){
                        con.query (`SELECT * FROM subscriptions
                        WHERE user_id = ${i[0]}`, function (err, result){
                        if (err) return null;
                        i.push(result)
                      })
                    final_result = result
                  } 
                });
              });
            return final_result;
        },
        getUserById: async (_, { id }) => { 
            con.connect(function(err) {
                if (err) throw err;
                con.query(
                    `SELECT * FROM users WHERE id = ${id}` , function (err, result) {
                  if (err) return null;
                  user = result[0];
                  con.query (
                    `SELECT * FROM users WHERE id = ${id}` , function (err, result) {
                        if (err) return null;
                        user.push(result);
                    }
                  )
                });
              });
            return user;
        }
    }
}

module.exports = { 
    UserResolvers
}