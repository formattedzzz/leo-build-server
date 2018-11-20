
const Sequelize = require('sequelize')

const sequelize = new Sequelize('account', 'root', require('../config.js').password, {
  host: 'localhost',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
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