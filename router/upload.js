let express = require('express')
let router = express.Router()
let path = require('path')
let fs = require('fs')
let multiparty = require('multiparty')
let {ImageTable} = require('../models/model.js')
const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')

function postImgInfo(openid, imgpath) {
  // findOne 要对查询结果做判断
  ImageTable.findOne({
    where: {openid}
  }).then((info) => {
    if (info) {
      if (/^\[[\S\s]+\]$/.test(info.dataValues.patharr)) {
        ImageTable.update(
          {
            patharr: JSON.stringify(JSON.parse(info.dataValues.patharr).concat([imgpath]))
          },
          {
            where: {openid}
          }
        ).then((res) => {
          console.log('老用户imgOK！')
        })
      } else {
        ImageTable.update(
          {
            patharr: JSON.stringify([imgpath])
          },
          {
            where: {openid}
          }
        ).then((res) => {
          console.log('老用户imgOK！')
        })
      }
    } else {
      ImageTable.create({
        openid,
        patharr: JSON.stringify([imgpath])
      }).then((res) => {
        console.log('新用户imgOK！')
      })
    }
  })
}

router.get('*', function (req, res) {
  let pathurl = req.path
  let url = path.resolve(__dirname, '../upload' + pathurl)
  let type = /\.(\w+)$/.exec(pathurl) ? /\.(\w+)$/.exec(pathurl)[1] : ''
  if (type === 'mp4') {
    const path = url
    const stat = fs.statSync(path)
    const fileSize = stat.size
    const range = req.headers.range
    // console.log(req.headers)
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
  let openid = req.openid
  let imgname = req.headers['name']
  if (typeof imgname === 'string' || typeof imgname === 'number') {
    imgname = [imgname + '']
  } else {
    imgname = Array.isArray(imgname) ? imgname : []
  }
  var form = new multiparty.Form({
    encoding: 'utf8',
    maxFilesSize: 10 * 1024 * 1024,
    autoFiles: true,
    uploadDir: 'upload/rawimage'
  })
  form.parse(req, function (err, fields, files) {
    if (err) {
      console.log('parse error: ' + err)
      res.status(500).json({
        code: 0,
        message: '解析失败，可能为upload路径不对',
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
    /**  数据格式：files ===  */
    // {
    //   image: [
    //     {
    //       fieldName: 'image',
    //       originalFilename: 'wxb44a677abfabfc2c.o6zAJs0hmuK9PI-CnGJV9ElP7Pe4.LRu6ASTuu1y4750dacc63e5fb6ad893f430be14b5db0.png',
    //       path: 'upload/image/FD5TXWuOqZ16AX6SwklXo7yW.png',
    //       Headers: {
    //         'content-type': 'image/type',
    //         'content-disposition': 'form-data; name="image";filename="..."'
    //       },
    //       size: 310524
    //     }
    //   ]
    // }
    let pathArr = files.image.map((item) => {
      return item.path.replace(/\\/g, '/')
    })
    imagemin(
      pathArr,
      // ['upload/rawimage/Dfw9GZI2DmlveGfnlk9vpmS4.png'],
      'upload/image',
      {
        use: [
          imageminJpegtran(),
          imageminPngquant({
            quality: [0.6, 0.8]
          })
        ]
      }
    ).then((data) => {
      let miniPathArr = data.map(img => img.path)
      if (imgname.length === miniPathArr.length) {
        miniPathArr.forEach((minipath, index) => {
          if (imgname[index]) {
            let oldpath = path.resolve(__dirname, '../', minipath)
            let type = /\.(\w+)$/.exec(minipath) ? /\.(\w+)$/.exec(minipath)[0] : ''
            let newpath = path.resolve(__dirname, '../', `upload/image/${imgname[index]}${type}`)
            fs.renameSync(oldpath, newpath)
            let imginfo = fs.statSync(newpath)
            miniPathArr[index] = {
              path: `/upload/image/${imgname[index]}${type}`,
              size: imginfo.size
            }
            if (openid) {
              postImgInfo(openid, `/upload/image/${imgname[index]}${type}`)
            }
          }
        })
      }
      console.log(miniPathArr)
      res.json({
        code: 1,
        message: '图片处理成功',
        pathArr: miniPathArr
      })
      pathArr.forEach((item, index) => {
        let delpath = path.resolve(__dirname, '../', item)
        if (fs.existsSync(delpath)) {
          fs.unlinkSync(delpath)
        }
      })
    }).catch((err) => {
      console.log(err)
      res.json({
        code: 1,
        message: '图片处理失败',
        pathArr: [],
        err: err
      })
    })

  })
})

module.exports = router