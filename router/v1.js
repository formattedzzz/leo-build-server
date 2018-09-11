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
router.post('/v1', function(req, res){
    console.log(req.body)
    var form = new multiparty.Form({uploadDir: 'upload'});
    form.encoding = 'utf-8';
    form.maxFilesSize = 5 * 1024 * 1024;
    form.parse(req, function(err, fields, files) {
        // console.log(err)
        // console.log('-----------')
        // console.log(fields)
        // console.log('-----------')
        console.log(files)
        console.log('-----------')
        var filesTmp = JSON.stringify(files,null,2);
        console.log('parse files: ' + filesTmp);
        if(err){
            console.log('parse error: ' + err);
        }
        else {
            let promiseArr = []
            let uploadSrc = []
            files.imgfile.forEach((item)=>{
                var inputFile = item;
                var uploadedPath = path.resolve(__dirname,'../', inputFile.path)
                var dstPath = path.resolve(__dirname, '../upload/' + inputFile.originalFilename) 
                uploadSrc.push(dstPath)
                //重命名为真实文件名
                promiseArr.push(new Promise(function(resolve, reject){
                    fs.rename(uploadedPath, dstPath, function(err) {
                        if(err){
                            console.log('rename error: ' + err);
                            reject('failed')
                        } else {
                            console.log('rename ok');
                            resolve('success')
                        }
                    })                     
                }))
            })
            Promise.all(promiseArr).then(function(result){
                // console.log(result)
                let urls = []
                uploadSrc.forEach((item)=> {
                    urls.push(fs.readFileSync(item).toString('base64'))
                })
                // console.log(urls)
                res.json({
                    code: 1,
                    message: '图片上传成功',
                    urls: urls
                })
            }).catch(function(err){
                console.log(err)
                res.json({
                    code: 0,
                    message: '图片上传失败'
                })
            })
        }
    })
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