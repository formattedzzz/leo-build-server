let log4js = require('log4js')
let path = require('path')
/* 第一种：
* configure方法为配置log4js对象，内部有levels、appenders、categories三个属性
* levels:
*         配置日志的输出级别,共ALL<TRACE<DEBUG<INFO<WARN<ERROR<FATAL<MARK<OFF八个级别,default level is OFF
*         只有大于等于日志配置级别的信息才能输出出来，可以通过category来有效的控制日志输出级别
* appenders:
*         配置文件的输出源，一般日志输出type共有console、file、dateFile三种
*         console:普通的控制台输出
*         file:输出到文件内，以文件名-文件大小-备份文件个数的形式rolling生成文件
*         dateFile:输出到文件内，以pattern属性的时间格式，以时间的生成文件
* replaceConsole:
*         是否替换控制台输出，当代码出现console.log，表示以日志type=console的形式输出         
*/
log4js.configure({
  appenders: {
    errlog: {
      type: 'dateFile',
      filename: path.resolve( __dirname, '../static/logs/info'),
      alwaysIncludePattern: true,
      pattern: '-yyyy-MM-dd.log'
    },
    infolog: {
      type: 'dateFile',
      filename: path.resolve( __dirname, '../static/logs/info'),
      alwaysIncludePattern: true,
      pattern: '-yyyy-MM-dd.log'
    }
  },
  categories: {
    errlog: { appenders: ['errlog'], level: 'error' },
    infolog: { appenders: ['infolog'], level: 'debug' },
    default: { appenders: ['infolog','errlog'], level: 'all' }
  },
  // pm2: true,
  // pm2InstanceVar: 'INSTANCE_ID',
  disableClustering: true
})

let errlog = log4js.getLogger('errlog')
let infolog = log4js.getLogger('infolog')
let log = log4js.getLogger('default')

module.exports = {
  errlog,
  infolog,
  log
}
