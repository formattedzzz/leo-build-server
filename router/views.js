let express = require('express')
let router = express.Router()
let {UserTable} = require('../models/model.js')
let asyncHandler = require('express-async-handler')
// let conection = require('../utils/mysql')
// let path = require('path')
// let http = require('http')
// let fs = require('fs')
// let querystring = require('querystring')
// let request = require('request')
// let Sequelize = require('sequelize')

router.get('/users', asyncHandler(async function(req, res){
  let Users = await UserTable.findAll()
  console.log(Users.length)
  // res.render('index', {Users})
  res.json({
    code: 1,
    users: Users,
    message: '获取用户列表成功'
  })
}))
module.exports = router