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
    // res.set('Content-Type', 'video/mp4;charset=utf-8')
    // var rs = fs.createReadStream(url)
    // rs.pipe(res)
    // rs.on('end', function () {
    //   res.end()
    //   console.log('end call')
    // })
    const path = url
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : fileSize-1
  
      const chunksize = (end-start)+1
      const file = fs.createReadStream(path, {start, end})
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      }
  
      res.writeHead(206, head)
      file.pipe(res)
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      }
      res.writeHead(200, head)
      fs.createReadStream(path).pipe(res)
    }
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
        message: '解析失败,可能为upload路径不对！',
        path: ''
      })
      return
    }
    // let multipartiedPath =  path.resolve(__dirname, '../', files.video[0].path)
    res.json({
      code: 1,
      message: '视频上传成功',
      path: '/' + files.video[0].path
    })
  })
})

router.post('/image', function (req, res) {
  console.log(Object.keys(req))
  let {rawHeaders, body, params, headers } = req
  console.log(rawHeaders, body, params, headers )
  var form = new multiparty.Form({
    encoding: 'utf8',
    maxFilesSize: 10 * 1024 * 1024,
    autoFiles: true,
    uploadDir: 'upload/image'
  })
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.log('parse error: ' + err)
      res.json({
        code: 0,
        message: '解析失败，可能为upload路径不对！',
        path: ''
      })
      return
    }
    // files 数据格式：
    // {
    //   fieldName: 'image',
    //   originalFilename: 'temppath...',
    //   path: 'upload/image/...',
    //   Headers: {
    //     'content-type': 'image/type',
    //     'content-disposition': 'form-data; name="image";filename="..."'
    //   },
    //   size: 31034524
    // }
    let pathArr = files.image.map((item, index) => {
      return '/' + item.path
    })
    res.json({
      code: 1,
      message: '图片上传成功',
      path: pathArr
    })

  })
})

module.exports = router    
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