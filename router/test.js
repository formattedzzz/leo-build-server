let express = require('express')
let router = express.Router()
let path = require('path')
let fs = require('fs')
let multiparty = require('multiparty')

router.get('*', function (req, res) {
  let pathurl = req.path
  let url = path.resolve(__dirname, '../upload' + pathurl)
  // let type = /\.(\w+)$/.exec(pathurl) ? /\.(\w+)$/.exec(pathurl)[1] : ''
  /** ---------------播放链接 */
  res.set('Content-Type', 'video/mp4;charset=utf-8')
  var rs = fs.createReadStream(url)
  rs.pipe(res)
  rs.on('end', function () {
    res.end()
    console.log('end call')
  })
})
router.post('/upload', function (req, res) {
  var form = new multiparty.Form({
    encoding: 'utf8',
    maxFilesSize: 50 * 1024 * 1024,
    autoFiles: true,
    uploadDir: 'upload'
  })
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.log('parse error: ' + err)
      res.json({
        code: 0,
        message: 'multiparty解析失败'
      })
      return
    }
    let promiseArr = []
    let resSemiSrc = []
    files.video.forEach((item) => {
      var uploadedPath = path.resolve(__dirname, '../', item.path) // 经过multiparty处理的路径
      var realPath = path.resolve(__dirname, '../upload/' + item.originalFilename) // 真实文件名产生的路径
      resSemiSrc.push(path.resolve('/upload/' + item.originalFilename))// 返回前端一半的目标路径
      // 重命名为真实文件名
      promiseArr.push(new Promise(function (resolve, reject) {
        fs.rename(uploadedPath, realPath, function (err) {
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
      res.json({
        code: 1,
        message: '视频上传成功',
        imgurls: resSemiSrc
      })
    }).catch(function (err) {
      console.log(err)
      res.json({
        code: 0,
        message: '视频上传失败'
      })
    })

  })
})

module.exports = router