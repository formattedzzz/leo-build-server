
let totalServer = require('./app.js')
let config = require('./config')
let IO = require('socket.io')(totalServer)
IO.on('connection', (socket) => {
  
  socket.emit('systeminfo', 'Hi, leo')
  socket.on('custominfo', (msg)=>{
    console.log(msg)
  })
  var addedUser = false
  // socket.on('new message', (data) => {
  //   socket.broadcast.emit('new message', {
  //     username: socket.username,
  //     message: data
  //   })
  // })
  // socket.on('add user', (username) => {
  //   if (addedUser) return
  //   socket.username = username;
  //   ++numUsers
  //   addedUser = true
  //   socket.emit('login', {
  //     numUsers: numUsers
  //   })
  //   socket.broadcast.emit('user joined', {
  //     username: socket.username,
  //     numUsers: numUsers
  //   })
  // })
  // socket.on('typing', () => {
  //   socket.broadcast.emit('typing', {
  //     username: socket.username
  //   })
  // })
  // socket.on('stop typing', () => {
  //   socket.broadcast.emit('stop typing', {
  //     username: socket.username
  //   })
  // })
  // socket.on('disconnect', () => {
  //   if (addedUser) {
  //     --numUsers
  //     socket.broadcast.emit('user left', {
  //       username: socket.username,
  //       numUsers: numUsers
  //     })
  //   }
  // })
})
totalServer.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log(`server is runing at port localhost: ${config.port}`)
  }
})