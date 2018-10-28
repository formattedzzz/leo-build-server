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
        res.status(404).json({
          code: 0,
          message: '404!没有找到相应资源，请检查路径'
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
      res.status(500).json({
        code: 0,
        message: '解析失败,可能为upload路径不对！',
        path: ''
      })
      return
    }
    // let multipartiedPath =  path.resolve(__dirname, '../', files.video[0].path)
    let respath = files.video[0].path.replace(/\\/g, '/')
    console.log(files.video[0].path)
    res.json({
      code: 1,
      message: '视频上传成功',
      path: '/' + respath
    })
  })
})

router.post('/image', function (req, res) {
  // console.log(Object.keys(req))
  // let {rawHeaders, body, params, headers } = req
  var form = new multiparty.Form({
    encoding: 'utf8',
    maxFilesSize: 10 * 1024 * 1024,
    autoFiles: true,
    uploadDir: 'upload/image'
  })
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.log('parse error: ' + err)
      res.status(500).json({
        code: 0,
        message: '解析失败，可能为upload路径不对！',
        path: ''
      })
      return
    }
    if (files.image[0].size === 0) {
      res.status(400).json({
        code: 0,
        message: '上传为空！'
      })
      return
    }
    // console.log(files)
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
    console.log(files)
    let pathArr = files.image.map((item, index) => {
      return '/' + item.path.replace(/\\/g, '/')
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