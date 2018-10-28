
let fs = require('fs')
let path = require('path')
let express = require('express')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let session = require('express-session')
let SessionStore = require('express-mysql-session')
let asyncHandler = require('express-async-handler')
let {SessionTable} = require('./models/model.js')
// let history = require('connect-history-api-fallback')
let morgan = require('morgan')
let { host, password, database, secret_key} = require('./config')
let accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
let morganStr = ':remote-addr - :remote-user [:date[clf]] :response-time ms ":method  :url HTTP/:http-version" :status :res[content-length] ":referrer"'
let mysqlOptions = {
    host,
    port: 3306,
    user: 'root',
    password,
    database
}
let app = express()
// let totalServer = require('http').createServer(app)
// let IO = require('socket.io')(totalServer)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.set('secret_key', secret_key)
app.use(morgan(morganStr, { stream: accessLogStream }))
app.use(express.static(path.join(__dirname, 'static')))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
    name: 'seeionKey',
    secret: 'secret for cookie',
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 60 * 1000 * 24 },
    store: new SessionStore(mysqlOptions)
}))
// app.get('/', function (req, res, next) {
//     console.log(req.session)
//     if (req.session.views) {
//         req.session.views++
//         res.setHeader('Content-Type', 'text/html')
//         res.write('<p>views: ' + req.session.views + '</p>')
//         res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
//         res.end()
//     } else {
//         req.session.views = 1
//         res.end('welcome to the session demo. refresh!')
//     }
// })
// 业务路由获取openid及解决跨域问题中间件
app.all('/api/*',asyncHandler(async function (req, res, next) {
        let sessionid = req.headers['sessionid']
        if (sessionid) {
            let result = await SessionTable.findOne({where: {sessionid}})
            req.openid = result.openid
        }
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Headers', 'x-Request-with')
        res.header('Access-Control-Allow-Credentials', true)
        res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
        res.header('Content-Type', 'application/json;charset=utf-8')
        next()
    }) 
)
// 错误捕获中间件
app.use(function(err,req,res,next) {
    console.log("Error happens",err.stack)
    res.status(500).json({
        code: 0,
        message: '发现服务器错误'
    })
    next(err)
});

let api = require('./router/api')
let static = require('./router/static')
let wxapi = require('./router/wxapi')
let views = require('./router/views')
let upload = require('./router/upload')
app.use('/api', api)
app.use('/static', static)
app.use('/wx', wxapi)
app.use('/views', views)
app.use('/upload', upload)

module.exports = require('http').createServer(app)




