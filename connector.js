var mysql = require('mysql2/promise');
require('dotenv').config()

const pool = mysql.createPool({
    host: process.env.DB_host, 
    user: process.env.DB_user,
    password: process.env.DB_password,
    database: process.env.DB_database,
    connectionLimit: 10,
    port: process.env.DB_port
  });


(function(){

})()

module.exports = {pool} 

