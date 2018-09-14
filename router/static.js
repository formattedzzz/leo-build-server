let express = require('express')
let router = express.Router()
let path = require('path')
let fs = require('fs')

function getContentType(str) {
  switch (str) {
    case 'png': 
    case 'jpg':
    case 'gif':
    case 'jpeg':
      return 'image/' + str
      break;
    case 'svg':
      return 'text/xml'
      break;
    case 'pdf':
      return 'application/pdf'
      break;
    case 'js':
      return 'application/x-javascript'
      break;
    case 'css':
    case 'txt':
      return 'text/' + str
      break;
    case 'mp4':
      return 'video/mpeg4'
      break;
    case 'mp3':
      return 'audio/mp3'
      break;
    case 'html':
      return 'text/html'
      break;
    default:
      return 'application/octet-stream'
  }
}

router.get('*', function (req, res) {
  let pathurl = req.path
 
  let type = /\.(\w+)$/.exec(pathurl) ? /\.(\w+)$/.exec(pathurl)[1] : ''

  // console.log(pathurl, type, getContentType(type) + ';charset=utf-8')
  res.set('Content-Type', getContentType(type) + ';charset=utf-8')
  // res.set('Content-Type', 'application/octet-stream;charset=utf-8')
  // res.set('Content-Type', 'image/jpg; charset=utf-8')
  let url = path.resolve(__dirname, '../static' + pathurl)
  fs.readFile(url, function (err, data) {
    if (err) {
      // console.log('没有对应的资源文件')
      res.json({
        code: 0,
        message: '没有找到相应资源，请检查路径'
      })
    } else {
      // console.log(data)
      res.send(data)
    }
  })

})

// let str = 'abc.map.png'
// let re = /\.(\w+)$/
// console.log(str.match(re)[0])
// console.log(re.exec(str)[1])

module.exports = router