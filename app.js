let path = require('path')
let express = require('express')

let bodyParser = require('body-parser')

let cookieParser = require('cookie-parser')
let session = require('express-session')
let history = require('connect-history-api-fallback')
let app = express()
// app.use(history)

let config = require('./config')

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

let seeionKey = 'leo'
// app.use(session({
//     name: seeionKey,
//     secret:'this is the secret for cookie',
//     saveUninitialized: false,  
//     resave: false, 
//     cookie: { maxAge: 60 * 1000 * 24 }
// }))
let v1 = require('./router/v1')
let static = require('./router/static')
app.use('/api', v1)
app.use('/static', static)
app.listen(config.port, (err)=>{
    if(err){
        console.log(err)
    }else{
        console.log(`server is runing at port localhost: ${config.port}`) 
    }
})


