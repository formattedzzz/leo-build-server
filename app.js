let path = require('path')
let express = require('express')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let session = require('express-session')
let history = require('connect-history-api-fallback')
let config = require('./config')
let app = express()
// app.use(history)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(express.static(path.join(__dirname, 'static')))
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser())

app.all('/api/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'x-Request-with')
    res.header('Access-Control-Allow-Credentials', true)
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
    res.header('X-Powered-By', '4.15.2')
    res.header('Content-Type', 'application/json;charset=utf-8')
    next()
})
// let seeionKey = 'leo'
// app.use(session({
//     name: seeionKey,
//     secret:'this is the secret for cookie',
//     saveUninitialized: false,  
//     resave: false, 
//     cookie: { maxAge: 60 * 1000 * 24 }
// }))

let api = require('./router/api')
let static = require('./router/static')
let wxapi = require('./router/wxapi')
let views = require('./router/views')
app.use('/api', api)
app.use('/static', static)
app.use('/wx', wxapi)
app.use('/views', views)
// app.get('/', function (req, res) {
//     // 如果请求中的 cookie 存在 isVisit, 则输出 cookie
//     // 否则，设置 cookie 字段 isVisit, 并设置过期时间为1分钟
//     if (req.cookies.isVisit) {
//         console.log(req.cookies)
//         res.send("再次欢迎访问")
//     } else {
//         res.cookie('isVisit', 1, {maxAge: 30 * 1000})
//         res.send("欢迎第一次访问")
//     }
// })

app.listen(config.port, (err)=>{
    if(err){
        console.log(err)
    }else{
        console.log(`server is runing at port localhost: ${config.port}`) 
    }
})


