let Sequelize = require('sequelize')
let sequelize = require('../utils/sequelize.js')
// conection.connect()
const SessionTable = sequelize.define('session_table', {
  sessionid: {
    type: Sequelize.STRING
  },
  openid: {
    type: Sequelize.STRING
  },
  session_key: {
    type: Sequelize.STRING
  }
})
module.exports = {
  SessionTable
}
