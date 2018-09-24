let path = require('path')
let express = require('express')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let session = require('express-session')
let SessionStore = require('express-mysql-session')
// let history = require('connect-history-api-fallback')
let config = require('./config')
let app = express()
let { host, port, user, password, database } = require('./config')
let mysqlOptions = {
    host,
    port: 3306,
    user: 'root',
    password,
    database
}

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(express.static(path.join(__dirname, 'static')))
app.use(bodyParser.urlencoded({ extended: false }))
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
app.all('/api/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'x-Request-with')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.header('X-Powered-By', '4.15.2')
    res.header('Content-Type', 'application/json;charset=utf-8')
    next()
})

let api = require('./router/api')
let static = require('./router/static')
let wxapi = require('./router/wxapi')
let views = require('./router/views')
app.use('/api', api)
app.use('/static', static)
app.use('/wx', wxapi)
app.use('/views', views)

app.listen(config.port, (err) => {
    if (err) {
        console.log(err)
    } else {
        console.log(`server is runing at port localhost: ${config.port}`)
    }
})


