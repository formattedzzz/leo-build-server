const Sequelize = require('sequelize')
const config = require('../config.js')

const sequelize = new Sequelize(config.database, config.mysql_user, config.mysql_pass, {
  host: config.mysql_host,
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  options: {
    charset: 'utf8mb4'
  },
  logging: false
  // storage: 'path/to/database.sqlite'
})
// sequelize
//   .sync({ alter: true })
//   .then(() => {
//     console.log('Connection successfully.')
//   })
//   .catch(err => {
//     console.error('Connection failed.', err)
//   })
module.exports = sequelize
