let Sequelize = require('sequelize')
let sequelize = require('../utils/sequelize.js')
// conection.connect()
// sessionid openid映射表
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
// 用户信息表
const UserTable = sequelize.define('user_table', {
  openid: {
    type: Sequelize.STRING
  },
  nickname: {
    type: Sequelize.STRING
  },
  gender: {
    type: Sequelize.STRING
  },
  avatar: { 
    type: Sequelize.STRING
  },
  country: {
    type: Sequelize.STRING
  },
  province: {
    type: Sequelize.STRING
  },
  city: {
    type: Sequelize.STRING
  }
});
// 记账记录总表
/**
 * @param account_id 记账记录ID
 * @param openid 记账人openid
 * @param account_income 1: 收入 0: 支出
 * @param account_type 记账类型 T001: 约会
 * @param account_fund 记账金额
 * @param account_comment 记账备注
 * @param account_time 记账时间
 */
const AccountTable = sequelize.define('account_table', {
  account_id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  openid: {
    type: Sequelize.STRING
  },
  account_income: {
    type: Sequelize.INTEGER
  },
  account_type: {
    type: Sequelize.STRING(4)
  },
  account_fund: {
    type: Sequelize.BIGINT
  },
  account_comment: {
    type: Sequelize.STRING
  },
  account_time: {
    type: Sequelize.DATE
  }
});
// 记账类型表
/**
 * @param type_id 类型ID
 * @param type_desc 类型描述
 * @param type_income 1: 收入 0: 支出
 * @param type_icon 类型描述图标
 */
const AccountTypeTable = sequelize.define('account_type_table', {
  type_id: {
    type: Sequelize.STRING(4),
    primaryKey: true
  },
  type_desc: {
    type: Sequelize.STRING
  },
  type_income: {
    type: Sequelize.INTEGER
  },
  type_icon: {
    type: Sequelize.STRING
  },
});


[SessionTable, UserTable, AccountTable, AccountTypeTable].forEach((item, index) => {
  item.sync({ alter: true })
  .then(() => {
    console.log(`${item.tableName} is already.`)
  })
  .catch(err => {
    console.error('Connection failed.', err)
  })
})
module.exports = {
  SessionTable,
  UserTable,
  AccountTable,
  AccountTypeTable
}
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