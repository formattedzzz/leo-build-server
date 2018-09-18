let express = require('express')

let router = express.Router()
// let conection = require('../utils/mysql')
// let path = require('path')
// let http = require('http')
// let fs = require('fs')
// let querystring = require('querystring')
// let request = require('request')
// let Sequelize = require('sequelize')

router.get('/index', function(req, res, next){
  res.render('index', {title: 'account服务器！'})
})
module.exports = router