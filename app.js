
let fs = require('fs')
let path = require('path')
let express = require('express')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let session = require('express-session')
let SessionStore = require('express-mysql-session')
let asyncHandler = require('express-async-handler')
let JWT = require('jsonwebtoken')
let morgan = require('morgan')
let config = require('./config')
let mysqlOptions = {
  host: config.host,
  port: 3306,
  user: 'root',
  password: config.password,
  database: config.database
}
let gameHub = require('./game/GameHub.js')
let app = express()
let httpserver = require('http').createServer(app)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.set('secret_key', config.secret_key)
app.use(morgan(config.logstyle, {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}))
app.use(express.static(path.join(__dirname, 'static')))
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
  name: 'seeionKey',
  secret: 'secret for cookie',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 60 * 1000 * 24
  },
  store: new SessionStore(mysqlOptions)
}))

// app.get('/', function (req, res, next) {
//   console.log(req.session)
//   if (req.session.views) {
//     req.session.views++
//     res.setHeader('Content-Type', 'text/html')
//     res.write('<p>views: ' + req.session.views + '</p>')
//     res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
//     res.end()
//   } else {
//     req.session.views = 1
//     res.end('welcome to the session demo. refresh!')
//   }
// })
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'x-Request-with')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  next()
})

// 业务路由获取openid及解决跨域问题中间件
let openid_controller = asyncHandler(async function (req, res, next) {
  res.header('Content-Type', 'application/json;charset=utf-8')
  let token = req.headers['token']
  if (token) {
    JWT.verify(token, config.secret_key, function (err, decoded) {
      if (err) {
        res.status(401).json({
          code: -1,
          message: 'token失效，需要重新登录'
        })
        return
      } else {
        req.openid = decoded.openid
      }
    })
  } else {
    res.status(401).json({
      code: -1,
      message: '需要重新登录'
    })
    return
  }
  next()
});
app.all('/api/*', openid_controller);
app.all('/upload/*', function (req, res, next) {
  req.openid = req.headers['openid']
  next()
});
// 错误捕获中间件 这里捕获的不是逻辑上会走的错误，而是代码语法上的错误 
// 比如说 var arr = null 而你在代码中访问了arr.length
app.use(function (err, req, res, next) {
  console.log("Error happens", err.stack)
  res.status(500).json({
    code: 0,
    message: '发现服务器错误'
  })
  next(err)
});

let router_api = require('./router/api')
let router_static = require('./router/static')
let router_wxapi = require('./router/wxapi')
let router_views = require('./router/views')
let router_upload = require('./router/upload')
let router_report = require('./router/report')

app.use('/api', router_api)
app.use('/static', router_static)
app.use('/wx', router_wxapi)
app.use('/views', router_views)
app.use('/upload', router_upload)
app.use('/report', router_report)

// console.log(app)
// 将socket服务挂载到通过app构建的httpserver
gameHub.init(httpserver)

httpserver.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  } else {
    console.log(`server is runing at port localhost: ${config.port}`)
  }
})
