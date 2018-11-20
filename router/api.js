
let express = require('express')
let router = express.Router()
let http = require('http')
let querystring = require('querystring')
let request = require('request')
let JWT = require('jsonwebtoken')
let asyncHandler = require('express-async-handler')
// let {SessionTable} = require('../models/model.js')
let {secret_key} = require('../config')
// let conection = require('../utils/mysql')
// let fs = require('fs')
// let path = require('path')
// let multiparty = require('multiparty')

router.get('/v3', function (req, res) {
    request('https://github.com/request/request', function (error, response, body) {
        // console.log('error:', error)
        // console.log('statusCode:', response && response.statusCode)
        // console.log('body:', body)
        res.json({
            status: response && response.statusCode,
            error: error,
            body: body
        })
    })
})
router.get('/v2', function (req, res) {
    throw new Error('故意丢的错误')
    res.json({
        code: 1,
        message: '中间发生了错误'
    })
})
// JWT试验路由 小程序在登录后拿到opened和session_key后下发token 再写一个router.use()中间件
// if token将解密后的openeid 挂载到req下 next() 否则res.status(403).json({}) 
router.get('/admin', asyncHandler(async function (req, res) {
    // let sessionid = req.headers['sessionid']
    // let result = await SessionTable.findAll({where: {sessionid}})
    console.log(req.openid, '-----------')
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoieGlhb2xpbiIsInVuaW9uaWQiOiJsZW8xMjEzOCIsImlhdCI6MTUzOTkyOTQ5NH0.yVmc74Ksj3VW620NbrWPqxdFDkFA606sVtJSUOb9cmA'
    if (req.header['jwt-token'] !== undefined || token) {
        JWT.verify(token, secret_key, function(err, decoded) {
            if (err) {
                res.status(401).json({
                    code: 0,
                    message: '无效的JWTtoken'
                })
            } else {
                res.json({
                    code: 1,
                    message: 'JWTtoken验证通过',
                    data: decoded
                })
            }
        })
    } else {    
        let token = JWT.sign({ name: 'xiaolin', unionid: 'leo12138'}, secret_key)
        res.json({
            data: {
                name: 'xiaolin',
                age: 22,
                token
            }
        })        
    }

}))

function httpGet(host, data, path, status) {
    let options = {
        host: host,
        port: 80,
        path: path + querystring.stringify(data),
        method: 'GET',
        encoding: null,
        headers: {
            'Content-Type': 'application/json',
            'User-Agent':
            'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36'
        }
    }
    if (status) {
        http = require('https')
        options.port = 443
    }
    return new Promise(function (resolve, reject) {
        let body = ''
        let getReq = http.request(options, function (response) {
            // response.setEncoding('utf8');
            response.on('data', function (chunk) {
                body += chunk
            })
            response.on('end', () => {
                resolve(body)
            })
            response.on('error', err => {
                reject(err)
            })
        })
        getReq.end()
    })
}
module.exports = router