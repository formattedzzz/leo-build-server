
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
  },
  map_client: function (arr) {
    return arr.map((item) => {
      return {
        openid: item.openid,
        socketid: item.socket.id,
        nickname: item.nickname,
        avatar: item.avatar
      }
    })
  }
}

function GameHub () {
  this.rooms = []
  this.online_clients = []
  this.matching_clients = []
  this.ROOMS = {}
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

GameHub.prototype.send_to = function (openid, msg = 'one-to-one message') {
  this.online_clients.forEach((item) => {
    if (item.openid === openid) {
      console.log('find')
      item.socket.emit('private_msg', {openid, msg})
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

GameHub.prototype.find_client_byid = function (type='socketid', id = '') {
  let client = null
  this.online_clients.forEach((item, index) => {
    if (type === 'openid') {
      if (item.openid === id) {
        client = item
      }
    } else {
      if (item.socket.id === id) {
        client = item
      }
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
      console.log(matchingLength)
      for (let i = 0; i < matchingLength / 2; i++) {
        let VS1 = {
          openid: clients[2 * i].openid,
          nickname: clients[2 * i].nickname,
          socketid: clients[2 * i].socket.id,
          avatar: clients[2 * i].avatar
        }
        let VS2 = {
          openid: clients[2 * i + 1].openid, 
          nickname: clients[2 * i + 1].nickname,
          socketid: clients[2 * i + 1].socket.id,
          avatar: clients[2 * i + 1].avatar
        }
        let VSdata = [VS1, VS2]
        clients[2 * i].socket.emit('matched', VSdata)
        clients[2 * i + 1].socket.emit('matched', VSdata)
      }
      clients.splice(0, matchingLength)
      console.log('匹配了' + matchingLength + '人,还剩', this.matching_clients.length)
    } else {
      if (clients.length) {
        clients[0].socket.emit('match_failed')
        clients.splice(0, 1)
      }
    }
  }, 12000)
}

GameHub.prototype.run_beat_system = function () {
  setInterval(() => {
    this.io.of('/user').emit('beat_req')
  }, 60000)
}

GameHub.prototype.init = function (httpserver, options) {
  let opts = options || this.getdefaultoptions()

  this.io = IO(httpserver)
  // this.io.set('heartbeat interval', 20)
  // this.io.set('heartbeat timeout', 30)
  this.verify_token(this.io)
  this.run_match_system(this.matching_clients)
  this.run_beat_system(this.online_clients)

  this.io.of('/user').on('connection', async (socket) => {
    socket.on('beat_res', () => {})  //接受心跳包
    let openid = await LEO.get_openid(socket.handshake.query.token)
    if (!openid) {
      socket.emit('system_info', 'authentication error')
      return
    }
    let {nickname, avatar} = await UserTable.findOne({where: { openid }})
    debug.log('connected', socket.id, ' ', this.online_clients.length)
    
    let socket_obj = {
      socket,
      openid,
      nickname,
      avatar
    }
    socket.on('need_match', () => {
      debug.success(socket.id, ' need_match')
      this.matching_clients.push(socket_obj)
      debug.success('matching-length:', this.matching_clients.length)
    })

    socket.on('cancel_match', () => {
      console.log(socket.id, ' cancel_match')
      this.del_matching_client_byid(socket.id)
      console.log(this.matching_clients.length)
    })

    socket.on('disconnect', () => {
      console.log(socket.id, ' 断开连接')
      this.del_online_client_byid(socket.id)
      console.log('还有', this.online_clients.length)
    })

    socket.on('update_score', (data) => {
      let {score, openid} = data
      this.send_to(openid, score)
    })
    socket.on('join_room', (roominfo) => {
      // socket.join(roominfo.room)
      // socket.to(roominfo.room).emit('join_info', 'someone joined')
      // let room_info = this.get_room_info('/user', roominfo.room)
      let join_info_data
      
      let thisroom = this.ROOMS[roominfo.room]
      if (!thisroom && !roominfo.init) {
        socket.emit('join_fail', '房主已离线，房间无效')
        return
      }
      if (thisroom && thisroom.length > 5) {
        socket.emit('join_fail', '人员已满')
        return
      }
      if (thisroom && thisroom.length) {
        let is_inroom
        is_inroom = thisroom.some((item) => {
          return item.openid === openid
        })
        if (!is_inroom) {
          thisroom.push(socket_obj) // 已经在房间中
        }
        join_info_data = LEO.map_client(thisroom)
        thisroom.forEach((item) => {
          item.socket.emit('join_info', join_info_data)
        })
        // this.io.of('/user').in(roominfo.room).emit('join_info', join_info_data)
      } else {
        this.ROOMS[roominfo.room] = [socket_obj]
        join_info_data = LEO.map_client(this.ROOMS[roominfo.room])
        this.ROOMS[roominfo.room].forEach((item) => {
          item.socket.emit('join_info', join_info_data)
        })
        // this.io.of('/user').in(roominfo.room).emit('join_info', join_info_data)
      }
    })
    socket.on('exit_room', (roominfo) => {
      if (roominfo.init) {
        console.log('房主离线')
        this.ROOMS[roominfo.room].forEach((item) => {
          item.socket.emit('exit_info', {init: true})
        })
        delete this.ROOMS[roominfo.room]
      } else {
        let thisroom = this.ROOMS[roominfo.room]
        thisroom.forEach((item, index) => {
          if (item.socket.id === socket.id) {
            thisroom.splice(index, 1)
          }
        })
        this.ROOMS[roominfo.room].forEach((item) => {
          item.socket.emit('exit_info', {
            init: false,
            leftrooms: LEO.map_client(this.ROOMS[roominfo.room])
          })
        })
      }
    })
    socket.on('req_begin', (roomname) => {
      this.ROOMS[roomname].forEach((mate) => {
        mate.socket.emit('diss_begin')
      })
    })
    socket.on('room_msg', (msginfo) => {
      this.ROOMS[msginfo.roomname].forEach((mate) => {
        if (mate.openid != msginfo.openid) {
          mate.socket.emit('room_msg', {
            from: msginfo.openid,
            msg: msginfo.msg,
            nickname: msginfo.nickname
          })
        }
      })
    })
    this.online_clients.push(socket_obj)
  })
}

module.exports = new GameHub()