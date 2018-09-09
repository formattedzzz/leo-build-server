let express = require('express')
let conection = require('../utils/mysql')
let router = express.Router()
let path = require('path')
let fs = require('fs')

conection.connect()

router.get('/v1', function(req, res){
    res.set('Content-Type','text/html')
    res.sendFile(path.resolve(__dirname,'../static/index1.html'))
})
router.get('/v3', function(req, res){
    res.set('Content-Type','image/jpg')
    let url = path.resolve(__dirname,'../static/full1.jpg')
    fs.readFile(url, function(err, data){
        if (err) {
            console.log(err)
        } else {
            // console.log(data)
            res.send(data)
        }
    })
})
router.get('/admin', function(req, res){
    res.set('Content-Type','text/html')
    res.sendFile(path.resolve(__dirname,'../index.html'))
})

router.get('/v4', function(req, res){
    res.send(process.env)
})
console.log(process.env.NODE_ENV)
router.get('/v2', function(req, res){

    let sql = 'SELECT * FROM USERINFO'
    conection.query(sql, function(err, result){
        if (err) {
            console.log(err)
        } else {
            res.send(result)
        }
    })
})
module.exports = router