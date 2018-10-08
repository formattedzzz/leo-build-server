let express = require('express')
let router = express.Router()
let Axios = require('axios')
let WXBizDataCrypt = require('../static/js/WXBizDataCrypt.js')
let config = require('../config.js')
let {SessionTable} = require('../models/model.js')
let uuidv1 = require('uuid/v1')
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
        // console.log(response.data)
        let { session_key, openid } = response.data
        let pc = new WXBizDataCrypt(appid, session_key)
        let decodedata = pc.decryptData(encryptedData , iv)
        console.log(session_key, openid)
        // console.log('解密后用户信息: ', decodedata)
        
        SessionTable.findOne({ where: {openid: openid} }).then((session) => {
            if (session) {
                // console.log('有记录')
                let uuid = uuidv1()
                SessionTable.update({session_key: session_key, sessionid: uuid}, {where: {openid: openid} }).then(()=>{
                    console.log('老用户sessionID更新成功！')
                    res.header('sessionID', uuid)
                    res.json({
                        code: 1,
                        message: '自定义登录态成功！',
                        sessionID: uuid
                    })
                })
            }else{
                // console.log('没记录')
                let uuid = uuidv1()
                SessionTable.create({
                    session_key: session_key,
                    openid: openid,
                    sessionid: uuid
                }).then(()=>{
                    console.log('新用户sessionID创建成功！')
                    res.header('sessionID', uuid)        
                    res.json({
                        code: 1,
                        message: '自定义登录态成功！',
                        sessionID: uuid
                    })
                })
            }
        })
    })
})

module.exports = router