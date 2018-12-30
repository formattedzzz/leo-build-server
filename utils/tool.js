function formatNumber (n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

function compare(key) {
  return function (obj1, obj2) {
      var val1 = +new Date(obj1[key])
      var val2 = +new Date(obj2[key])
      if (val1 < val2) {
          return 1
      } else if (val1 > val2) {
          return -1
      } else {
          return 0
      }
  }
}

function formatTime (date, split) {
  let split1 = split || '-'
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join(split1)
  const t2 = [hour, minute, second].map(formatNumber).join(':')
  return `${t1} ${t2}`
}

module.exports = {
  compare,
  formatTime
}