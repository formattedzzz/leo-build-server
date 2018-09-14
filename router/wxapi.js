let express = require('express')
// let conection = require('../utils/mysql')
let router = express.Router()
let Axios = require('axios')
let WXBizDataCrypt = require('../static/js/WXBizDataCrypt.js')

router.get('/login', function (req, res) {
    console.log(req.query)
    const {code, encryptedData, iv, signature} = req.query
    const appid = 'wxb44a677abfabfc2c'
    const secret = 'ed69bd6509b8fe98312ada51cbb55047'
    // const { code, encryptedData, iv } = req.payload
    Axios({
        url: 'https://api.weixin.qq.com/sns/jscode2session',
        method: 'GET',
        params: {
            appid,
            secret,
            js_code: code,
            grant_type: 'authorization_code'
        }
    }).then((response) => {
        console.log(response.data)
        let { session_key } = response.data
        let pc = new WXBizDataCrypt(appid, session_key)
        let data = pc.decryptData(encryptedData , iv)
        console.log('解密后用户信息: ', data)
        res.json(response.data)
    })
})

module.exports = router