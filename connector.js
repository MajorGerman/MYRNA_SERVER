var mysql = require('mysql2');

const pool = mysql.createPool({
    host: "sql11.freesqldatabase.com", 
    user: "sql11476086",
    password: "id7B3V3qax",
    database: "sql11476086",
    connectionLimit: 100
  });


(function(){

})()

module.exports = {pool} 

