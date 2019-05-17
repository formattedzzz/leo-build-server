let express = require('express')
let router = express.Router()
let sha1 = require('sha1')

let config = {
  wechat: {
    appID: 'wx5865fe72fdc1f49d',
    appsecret: 'fbca87cc861951cd9777405f4c1375ad',
    token: '730811'
  }
}
router.get('/', function (req, res) {
  console.log(req.query)
  var token = config.wechat.token
  var signature = req.query.signature
  var nonce = req.query.nonce
  var timestamp = req.query.timestamp
  var echostr = req.query.echostr
  var str = [token, timestamp, nonce].sort().join('')
  var sha = sha1(str)
  if (sha === signature) {
    res.send(echostr + '')
  } else {
    res.send('wrong')
  }
})
module.exports = router