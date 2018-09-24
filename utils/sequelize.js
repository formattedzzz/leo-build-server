const Sequelize = require('sequelize')
const sequelize = new Sequelize('account', 'root', 'lfl730811', {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
  // storage: 'path/to/database.sqlite'
})
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection successfully.')
  })
  .catch(err => {
    console.error('Connection failed.', err)
  })
module.exports = sequelize