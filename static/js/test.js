
var throttle = function(func, delay) {
  console.log('--------')
  console.log(1, arguments)
  var timer = null;
  return function() {
    //   console.log(2, arguments)
      var context = this;
      var args = arguments;
      if (!timer) {
          timer = setTimeout(function() {
              func.apply(context, args);
              timer = null;
          }, delay);
      }
  }
}
function handle(id) {
    let innerid = id

    return function(){
        // console.log(e)
        console.log(innerid)
    }
    // console.log(123, id)
}
let insert = async function(){    
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve(123)
        }, 0)
    })
}
console.log(await insert())
console.log(456)

window.addEventListener('scroll', throttle(handle(123), 1000));