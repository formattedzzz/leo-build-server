let express = require('express')
// let conection = require('../utils/mysql')
let router = express.Router()
let Axios = require('axios')
let WXBizDataCrypt = require('../static/js/WXBizDataCrypt.js')
let config = require('../config.js')

router.get('/login', function (req, res) {
    // console.log(req.query)
    const {code, encryptedData, iv, signature} = req.query
    const {appid, secret} = config
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
        let { session_key, openid } = response.data
        let pc = new WXBizDataCrypt(appid, session_key)
        let data = pc.decryptData(encryptedData , iv)
        console.log('解密后用户信息: ', data)
        // res.header('sessionID', session_key + openid)
        res.json({
            code: 1,
            message: '自定义登录态成功！',
            sessionID: session_key + openid
        })
    })
})

module.exports = router