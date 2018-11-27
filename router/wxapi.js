let express = require('express')
let router = express.Router()
let Axios = require('axios')
let WXBizDataCrypt = require('../static/js/WXBizDataCrypt.js')
let config = require('../config.js')
let {SessionTable, UserTable} = require('../models/model.js')
let uuidv1 = require('uuid/v1')

let JWT = require('jsonwebtoken')
let {secret_key} = require('../config')

router.post('/login', function (req, res) {
    // console.log(req.body)
    const {code, encryptedData, iv, signature} = req.body
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
        // console.log(session_key, openid)
        // console.log('解密后用户信息: ', decodedata)
        let {nickName, gender, country, province, city, avatarUrl} = decodedata
        UserTable.findOne({ where: {openid: openid} }).then((user) => {
            if (user) {
                UserTable.update({
                    nickname: nickName,
                    gender,
                    country,
                    province,
                    city,
                    avatar: avatarUrl
                }, {where: {openid: openid} }).then(() => {
                    console.log('老用户基本资料更新成功！')
                })
            } else {
                UserTable.create({
                    openid,
                    nickname: nickName,
                    gender,
                    avatar: avatarUrl,
                    country,
                    province,
                    city
                }).then(() => {
                    console.log('新用户基本资料注入成功！')
                })
            }
        })
        let token = JWT.sign({ 
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 180), // 过期时间设为间隔1小时，不是绝对时间
            openid: openid
        }, secret_key)
        res.json({
            code: 1,
            message: '登录成功',
            token
        })
        // SessionTable.findOne({ where: {openid: openid} }).then((session) => {
        //     if (session) {
        //         // console.log('有记录')
        //         let uuid = uuidv1()
        //         SessionTable.update({session_key: session_key, sessionid: uuid}, {where: {openid: openid} }).then(()=>{
        //             console.log('老用户sessionID更新成功！')
        //             res.header('sessionID', uuid)
        //             res.json({
        //                 code: 1,
        //                 message: '自定义登录态成功！',
        //                 sessionID: uuid
        //             })
        //         })
        //     }else{
        //         // console.log('没记录')
        //         let uuid = uuidv1()
        //         SessionTable.create({
        //             session_key: session_key,
        //             openid: openid,
        //             sessionid: uuid
        //         }).then(()=>{
        //             console.log('新用户sessionID创建成功！')
        //             res.header('sessionID', uuid)        
        //             res.json({
        //                 code: 1,
        //                 message: '自定义登录态成功！',
        //                 sessionID: uuid
        //             })
        //         })
        //     }
        // })
    }).catch((err) => {
        console.log(err)
        res.json({
            code: 0,
            data: null,
            message: 'code2session回调失败，请删除小程序后重新打开'
        })
    })
})

module.exports = router