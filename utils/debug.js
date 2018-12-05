
const debug ={
  log (...msgs) {
    let msg = ' ';
    [].forEach.call(msgs, (item) => {
      msg += item
    })
    console.log('\033[47;30m' + 'debug' + '\033[40;37m' + msg + '\033[0m')
  },
  success (...msgs) {
    let msg = ' ';
    [].forEach.call(msgs, (item) => {
      msg += item
    })
    console.log('\033[42;30m' + 'success' + '\033[40;32m' + msg + '\033[0m')
  },
  warn (...msgs) {
    let msg = ' ';
    [].forEach.call(msgs, (item) => {
      msg += item
    })
    console.log('\033[43;30m' + 'warn' + '\033[40;33m' + msg + '\033[0m')
  },
  error (...msgs) {
    let msg = ' ';
    [].forEach.call(msgs, (item) => {
      msg += item
    })
    console.log('\033[41;30m' + 'error' + '\033[40;31m' + msg + '\033[0m')
  }
}

// \033[0m 为关闭所有属性
/** 用法实例 */
// debug.log('debug.log')
// debug.success('debug.success')
// debug.warn('debug.warn')
// debug.error('debug.error')

module.exports = debug