var mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: "localhost", 
    user: "my_test",
    password: "my_test",
    database: "my_test",
    connectionLimit: 10,
    port: 3306
  });


(function(){

})()

module.exports = {pool} 

