
let mysql = require('mysql')

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'lfl730811',
  database : 'testdb'
})

module.exports = connection