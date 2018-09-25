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
});

// bbb()
// SessionTable.findOne({where: {openid: 'openid'}}).then((res)=>{
//   console.log(res.get('sessionid'))
// })
// SessionTable.sync()
// SessionTable.create({
//   session_key: 'session_key',
//   openid: 'openid',
//   sessionid: 'session_key' + 'openid'
// })
// .then((res)=>{
//   console.log('inserted ok!')
// })
// .catch(function(err){
//   console.log('inserted error');
//   console.log(err.message)
// })
// const User = sequelize.define('user_table', {
//   name: Sequelize.STRING,
//   email: Sequelize.STRING
// })
// const Project = sequelize.define('project_table', {
//   name: Sequelize.STRING,
//   fund: Sequelize.BIGINT,
//   other: Sequelize.STRING
// })
// Project.belongsTo(User, {foreignKey: 'user_id'})
// User.sync()
// Project.sync()

// User.create({
//   name: 'xiaolin',
//   email: '614791110@qq.com'
// })
// .then((res)=>{
//   console.log('inserted ok!')
// })
// Project.create({
//   name: 'nncz',
//   fund: 1000000,
//   user_id: 1
// })
// .then((res)=>{
//   console.log('inserted ok too!')
// })
module.exports = {
  SessionTable
}
