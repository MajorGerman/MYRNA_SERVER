var mysql = require('mysql');

var con = mysql.createConnection({
    host: "sql11.freesqldatabase.com",
    user: "sql11476086",
    password: "id7B3V3qax",
    database: "sql11476086"
  });
con.connect();

module.exports = {con} 