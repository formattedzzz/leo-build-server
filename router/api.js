let express = require('express')
// let conection = require('../utils/mysql')
let router = express.Router()
let path = require('path')
let http = require('http')
let fs = require('fs')
let querystring = require('querystring')
let request = require('request')
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

router.get('/admin', function (req, res) {
    (async function (){
        let result = await SessionTable.findAll({where: {openid: 'openid'}})
        // console.log(result)  
        res.json({
            data: result
        })
    })()
})

router.post('/v1', function (req, res) {
    console.log(req.body)
    var form = new multiparty.Form({ uploadDir: 'upload' })
    form.encoding = 'utf-8'
    form.maxFilesSize = 5 * 1024 * 1024
    form.parse(req, function (err, fields, files) {
        // console.log(err)
        // console.log('-----------')
        // console.log(fields)
        // console.log('-----------')
        console.log(files)
        console.log('-----------')
        var filesTmp = JSON.stringify(files, null, 2)
        console.log('parse files: ' + filesTmp)
        if (err) {
            console.log('parse error: ' + err)
        }
        else {
            let promiseArr = []
            let uploadSrc = []
            files.imgfile.forEach((item) => {
                var inputFile = item
                var uploadedPath = path.resolve(__dirname, '../', inputFile.path)
                var dstPath = path.resolve(__dirname, '../upload/' + inputFile.originalFilename)
                uploadSrc.push(dstPath)
                //重命名为真实文件名
                promiseArr.push(new Promise(function (resolve, reject) {
                    fs.rename(uploadedPath, dstPath, function (err) {
                        if (err) {
                            console.log('rename error: ' + err)
                            reject('failed')
                        } else {
                            console.log('rename ok')
                            resolve('success')
                        }
                    })
                }))
            })
            Promise.all(promiseArr).then(function (result) {
                // console.log(result)
                let urls = []
                uploadSrc.forEach((item) => {
                    urls.push(fs.readFileSync(item).toString('base64'))
                })
                // console.log(urls)
                res.json({
                    code: 1,
                    message: '图片上传成功',
                    urls: urls
                })
            }).catch(function (err) {
                console.log(err)
                res.json({
                    code: 0,
                    message: '图片上传失败'
                })
            })
        }
    })
})
// router.get('/v2', function(req, res){

//     let sql = 'SELECT * FROM USERINFO'

//     conection.query(sql, function(err, result){
//         if (err) {
//             console.log(err)
//         } else {
//             res.send(result)
//         }
//     })
// })
function httpGet(host, data, path, status) {
    console.log('===================HttpGet=====================')
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