let express = require('express')
let router = express.Router()
let path = require('path')
let fs = require('fs')
let multiparty = require('multiparty')

router.get('*', function (req, res) {
  let pathurl = req.path
  let url = path.resolve(__dirname, '../upload' + pathurl)
  let type = /\.(\w+)$/.exec(pathurl) ? /\.(\w+)$/.exec(pathurl)[1] : ''
  if (type === 'mp4') {
    res.set('Content-Type', 'video/mp4;charset=utf-8')
    var rs = fs.createReadStream(url)
    rs.pipe(res)
    rs.on('end', function () {
      res.end()
      console.log('end call')
    })
  } else {
    let url = path.resolve(__dirname, '../upload' + pathurl)
    fs.readFile(url, function (err, data) {
      if (err) {
        res.header('Content-Type', 'application/json;charset=utf-8')
        res.json({
          code: 0,
          message: '没有找到相应资源，请检查路径'
        })
      } else {
        res.set('Content-Type', `image/${type};charset=utf-8`)
        res.send(data)
      }
    })
  }
})
// 视频文件暂时只支持单个上传
router.post('/video', function (req, res) {
  var form = new multiparty.Form({
    encoding: 'utf8',
    maxFilesSize: 50 * 1024 * 1024,
    autoFiles: true,
    uploadDir: 'upload/video'
  })
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.log('parse error: ' + err)
      res.json({
        code: 0,
        message: '解析失败,极可能为upload路径不对！',
        path: ''
      })
      return
    }
    console.log(files)
    // let multipartiedPath =  path.resolve(__dirname, '../', files.video[0].path)
    res.json({
      code: 1,
      message: '视频上传成功',
      path: '/' + files.video[0].path
    })
  })
})

router.post('/image', function (req, res) {
  var form = new multiparty.Form({
    encoding: 'utf8',
    maxFilesSize: 10 * 1024 * 1024,
    autoFiles: true,
    uploadDir: 'upload/image'
  })
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.log('parse error: ' + err)
      res.header``
      res.json({
        code: 0,
        message: 'multiparty解析失败',
        path: ''
      })
      return
    }
    let pathArr = files.image.map((item, index) => {
      return '/' + item.path
    })
    res.json({
      code: 1,
      message: '图片上传成功',
      path: pathArr
    })
    // let promiseArr = []
    // let resSemiSrc = []
    // files.image.forEach((item) => {
    //   var uploadedPath = path.resolve(__dirname, '../', item.path) // 经过multiparty处理的路径
    //   var realPath = path.resolve(__dirname, '../upload/image/' + item.originalFilename) // 真实文件名产生的路径
    //   resSemiSrc.push(path.resolve('/upload/image/' + item.originalFilename))// 返回前端一半的目标路径
    //   // 重命名为真实文件名
    //   promiseArr.push(new Promise(function (resolve, reject) {
    //     fs.rename(uploadedPath, realPath, function (err) {
    //       if (err) {
    //         console.log('rename error: ' + err)
    //         reject('failed')
    //       } else {
    //         console.log('rename ok')
    //         resolve('success')
    //       }
    //     })
    //   }))
    // })
    // Promise.all(promiseArr).then(function (result) {
    //   // fs.readFileSync(path).toString('base64') // 返回base64编码的图片
    //   res.json({
    //     code: 1,
    //     message: '图片上传成功',
    //     path: resSemiSrc
    //   })
    // }).catch(function (err) {
    //   console.log(err)
    //   res.json({
    //     code: 0,
    //     message: '图片上传失败'
    //   })
    // })
  })
})

module.exports = router