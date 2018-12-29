
let debug = require('../utils/debug.js')
// 自定义debug样式
let config = require('../config')
let JWT = require('jsonwebtoken')
// 对IO中间件进行openid验证
// let asyncHandler = require('express-async-handler')
// express 中对async函数进行包装，以便错误中间件捕获错误
let {UserTable} = require('../models/model.js')
let IO = require('socket.io')
// 工具类函数
let LEO = {
  get_openid: async function (token) {
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
}

function GameHub () {
  this.rooms = []
  this.online_clients = []
  this.matching_clients = []
}

GameHub.prototype.getdefaultoptions = function () {
  return {
    path: '/user',
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false
  }
}

GameHub.prototype.verify_token = function (IO) {
  IO.use((socket, next) => {
    let {token} = socket.handshake.query
    JWT.verify(token, config.secret_key, (err, decoded) => {
      if (err) {
        debug.error('authentication error')
        return next(new Error('authentication error'))
      } else {
        return next()
      }
    })
  })
}

GameHub.prototype.send_to = function (from, to, msg = 'one-to-one message') {
  this.online_clients.forEach((item) => {
    if (item.socket.id === to) {
      console.log('find')
      item.socket.emit('private_msg', {from, msg})
    }
  })
}

GameHub.prototype.del_online_client_byid = function (id = '') {
  this.online_clients.forEach((item, index) => {
    if (item.socket.id === id) {
      this.online_clients.splice(index, 1)
    }
  })
}

GameHub.prototype.del_matching_client_byid = function (id = '') {
  this.matching_clients.forEach((item, index) => {
    if (item.socket.id === id) {
      this.matching_clients.splice(index, 1)
    }
  })
}

GameHub.prototype.find_client_byid = function (id = '') {
  let client = null
  this.online_clients.forEach((item, index) => {
    if (item.socket.id === id) {
      client = item
    }
  })
  if (client) {
    return client
  } else {
    return false
  }
}

GameHub.prototype.run_match_system = function (clients) {
  setInterval(() => {
    if (clients.length >= 2) {
      let matchingLength = clients.length % 2 === 0 ? clients.length : clients.length - 1
      for (let i = 0; i < matchingLength / 2; i++) {
        let VS1 = {
          openid: clients[i].openid,
          nickname: clients[i].nickname,
          socketid: clients[i].socket.id,
          avatar: clients[i].avatar
        }
        let VS2 = {
          openid: clients[i + 1].openid, 
          nickname: clients[i + 1].nickname,
          socketid: clients[i + 1].socket.id,
          avatar: clients[i + 1].avatar
        }
        let VSdata = [VS1, VS2]
        clients[i].socket.emit('matched', VSdata)
        clients[i + 1].socket.emit('matched', VSdata)
      }
      clients.splice(0, matchingLength)
    } else {
      if (clients.length) {
        clients[0].socket.emit('match_failed')
        clients.splice(0, 1)
      }
    }
  }, 12000)
}

GameHub.prototype.run_beat_system = function (clients) {
  setInterval(() => {
    if (clients && clients.length) {
      clients.forEach((client) => {
        client.socket.send('beats me plz!')
      })
    }
  }, 60000)
}

GameHub.prototype.init = function (httpserver, options) {
  let opts = options || this.getdefaultoptions()

  this.io = IO(httpserver)
  this.verify_token(this.io)
  this.run_match_system(this.matching_clients)
  this.run_beat_system(this.online_clients)

  this.io.of('/user').on('connection', async (socket) => {
    let openid = await LEO.get_openid(socket.handshake.query.token)
    if (!openid) {
      socket.emit('system_info', 'authentication error')
      return
    }
    let {nickname, avatar} = await UserTable.findOne({where: { openid }})
    debug.log('one socket connected', socket.id, ' ', openid)

    socket.on('message', function (msg) {
      console.log(msg)
    })

    socket.on('need_match', () => {
      debug.success(socket.id, ' need match current-length:', this.matching_clients.length)
      this.matching_clients.push(socket_obj)
      debug.success(this.matching_clients.length)
    })

    socket.on('cancel_match', () => {
      console.log(socket.id, ' cancel match', this.matching_clients.length)
      this.del_matching_client_byid(socket.id)
      console.log(this.matching_clients.length)
    })

    socket.on('disconnect', () => {
      console.log(socket.id, ' 客户端已经断开连接 ', this.online_clients.length)
      this.del_online_client_byid(socket.id)
      console.log(this.online_clients.length, 'offline')
    })

    socket.on('update_score', (data) => {
      let {score, socketid} = data
      this.send_to(socket.id, socketid, score)
    })

    let socket_obj = {
      socket,
      openid,
      nickname,
      avatar,
      playing: false
    }
    this.online_clients.push(socket_obj)
  })
}

module.exports = new GameHub()