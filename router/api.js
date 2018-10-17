let express = require('express')
// let conection = require('../utils/mysql')
let router = express.Router()
let path = require('path')
let http = require('http')
let fs = require('fs')
let multiparty = require('multiparty')
let querystring = require('querystring')
let request = require('request')
const asyncHandler = require('express-async-handler')
let {SessionTable} = require('../models/model.js')

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

router.get('/admin', asyncHandler(async function (req, res) {
    let sessionid = req.headers['sessionid']
    // (async function (){
    let result = await SessionTable.findAll({where: {sessionid}})
    // console.log(result)
    res.json({
        data: {
            name: 'xiaolin',
            age: 22
        }
    })
    // })()
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