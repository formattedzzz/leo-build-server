let debug = require('./utils/debug.js')
let config = require('./config')
let JWT = require('jsonwebtoken')
let asyncHandler = require('express-async-handler')
let totalServer = require('./app.js')
let {UserTable} = require('./models/model.js')
// 通过app.js中定义好的app构建的http服务 还未监听端口
let IO = require('socket.io')(totalServer)
// 利用该http服务构建IO实例
const userSocketArr = []
const matchingArr = []
IO.use((socket, next) => {
  let {token} = socket.handshake.query
  JWT.verify(token, config.secret_key, function (err, decoded) {
    if (err) {
      debug.error('authentication error')
      return next(new Error('authentication error'))
    } else {
      return next()
    }
  })
})

function one2one (from = '', to = '', msg = 'one2one message') {
  userSocketArr.forEach((item, index) => {
    if (item.openid === to) {
      item.socket.emit('private_msg', from, to, msg)
    }
  })
}
// 根据socketID 删除在线成员
function delOnlineSocketByid(id = '') {
  userSocketArr.forEach((item, index) => {
    if (item.socket.id === id) {
      userSocketArr.splice(index, 1)
    }
  })
}
// 根据socketID 删除匹配中的成员
function delMatchingSocketByid(id = '') {
  matchingArr.forEach((item, index) => {
    if (item.socket.id === id) {
      matchingArr.splice(index, 1)
    }
  })
}
function findSocketByid(id = '') {
  let socket = {}
  matchingArr.forEach((item, index) => {
    if (item.socket.id === id) {
      socket = item
    }
  })
  return socket
}

setInterval(() => {
  if (matchingArr.length >= 2) {
    // let matchingLength = matchingArr.length % 2 === 0 ? matchingArr.length : matchingArr.length - 1
    // for (let i = 0; i < matchingLength / 2; i++) {
    //   let VSdata = [matchingArr[i], matchingArr[i + 1]]
    //   matchingArr[i].socket.emit('matched', VSdata)
    //   matchingArr[i + 1].socket.emit('matched', VSdata)
    // }
    // matchingArr.splice(0, matchingLength)
    matchingArr.forEach((item) => {
      item.socket.emit('matched', [{}, {}])
    })
  } else {
    if (matchingArr.length) {
      matchingArr[0].socket.emit('match_failed')
      matchingArr.splice(0, 1)
    }
  }
}, 5000)
async function getOpenid (token) {
  return new Promise((resolve, reject) => {
    JWT.verify(token, config.secret_key, function (err, decoded) {
      if (err) {
        debug.error('authentication error')
        reject(new Error('authentication error'))
      } else {
        resolve(decoded.openid)
      }
    })
  })
}

// let User = IO.of('/user')
IO.of('/user').on('connection', asyncHandler( async (socket) => {
  let openid = await getOpenid(socket.handshake.query.token)
  debug.log('one socket connected', socket.id, openid)
  if (!openid) {
    socket.emit('system_info', 'authentication error')
    return
  }
  let {nickname, avatar} = await UserTable.findOne({where: {openid}})
  socket.on('need_match', () => {
    console.log(socket.id, ' need match')
    console.log(matchingArr.length)
    matchingArr.push(currentSocket)
    debug.success(matchingArr.length)
  })
  socket.on('cancel_match', () => {
    console.log(socket.id, ' cancel match')
    delMatchingSocketByid(socket.id)
  })
  // one2one(openid, openid, 'this is a private msg')
  // socket.broadcast.emit('broadcast')
  // IO.of('/user').emit('broadcast2')
  // socket.emit('system_info', 'Hi, leo')
  // socket.on('custom_info', (msg) => {
  //   console.log(msg)
  // })
  socket.on('disconnect', () => {
    console.log(matchingArr.length)
    debug.warn(socket.id, '客户端已经断开连接')
    delOnlineSocketByid(socket.id)
    delMatchingSocketByid(socket.id)
    debug.success(matchingArr.length, 'offline')
  })
  let currentSocket = {
    socket,
    openid,
    nickname,
    avatar,
    matched: false
  }
  userSocketArr.push(currentSocket)
  // 遍历所有客户端
  // IO.of('/user').clients((error, clients) => {
  //   if (error) throw error;
  //   console.log(clients)
  // });
}))


totalServer.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log(`server is runing at port localhost: ${config.port}`)
  }
})
