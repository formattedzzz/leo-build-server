let express = require('express')
let router = express.Router()
let request = require('request')
let asyncHandler = require('express-async-handler')
let uuidv1 = require('uuid/v1')
// let http = require('http')
// let querystring = require('querystring')
let {AccountTable} = require('../models/model.js')
let Sequelize = require('sequelize')
let sequelize = require('../utils/sequelize.js')
const OP = Sequelize.Op
// let {secret_key} = require('../config')
// let conection = require('../utils/mysql')
// let fs = require('fs')
// let path = require('path')
// let multiparty = require('multiparty')
let formatTime = require('../utils/formatTime.js')

router.get('/v3', function (req, res) {
    request('https://github.com/request/request', function (error, response, body) {
        // console.log('error:', error)
        // console.log('statusCode:', response && response.statusCode)
        // console.log('body:', body)
        res.json({
            status: response && response.statusCode,
            error: error,
            body: body
        })
    })
})
router.get('/v2', function (req, res) {
    throw new Error('故意丢的错误')
    res.json({
        code: 1,
        message: '中间发生了错误'
    })
})
// JWT试验路由 小程序在登录后拿到opened和session_key后下发token 再写一个router.use()中间件
// if token将解密后的openeid 挂载到req下 next() 否则res.status(403).json({}) 
router.get('/admin', asyncHandler(async function (req, res) {
    // let sessionid = req.headers['sessionid']
    // let result = await SessionTable.findAll({where: {sessionid}})
    console.log(req.openid, '-----------')
    res.json({
        name: 'xiaolin'
    })

}))

router.post('/add-account', asyncHandler(async function (req, res) {
    console.log(formatTime(new Date()).split(' ')[1], 'post-account')
    let {
        account_income,
        account_type,
        account_fund,
        account_date,
        account_comment
    } = req.body
    if (account_fund === null || account_fund === undefined || !account_type) {
        res.json({
            code: 0,
            data: null,
            message: '关键参数不明，记账失败'
        })
        return
    }
    AccountTable.create({
        account_id: uuidv1(),
        openid: req.openid,
        account_income,
        account_type,
        account_fund,
        account_date: account_date + ' ' + formatTime(new Date()).split(' ')[1],
        account_comment
    }).then(() => {
        res.json({
            code: 1,
            data: null,
            message: '新增记录成功'
        })
    }).catch((err) => {
        res.status(500).json({
            code: 1,
            data: err,
            message: JSON.stringify(err)
        })
    })
}))

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
router.get('/get-account', asyncHandler(async function (req, res) {
    let year = req.query.year ? req.query.year : new Date().getFullYear + ''
    AccountTable.findAll({
        where: {
            openid: {
                [OP.eq]: req.openid
            }
            // order: sequelize.col('account_date')
        }
    }).then((data) => {
        if (data && data.length) {
            let accountList = data.sort(compare('account_date')).filter((item) => {
                let calcyear = new Date(item.account_date).getFullYear() + ''
                return calcyear === year
            })
            accountList = accountList.map((item) => {
                return {
                    id: item.account_id,
                    openid: item.openid,
                    income: item.account_income,
                    type: item.account_type,
                    fund: item.account_fund,
                    date: item.account_date,
                    comment: item.account_comment,
                    created: item.createdAt,
                    updated: item.updatedAt
                }
            })
            // console.log(accountList)
            let monthArr = [[],[],[],[],[],[],[],[],[],[],[],[]]
            accountList.forEach((item, index) => {
                let dateStr = JSON.stringify(item.date)
                let month = Number(dateStr.split('T')[0].split('-')[1])
                monthArr[month - 1].push(item)
            })
            res.json({
                code: 1,
                data: monthArr,
                message: '查询记录成功'
            })
        } else {
            res.json({
                code: 1,
                data: [],
                message: '查询记录成功'
            })
        }
    }).catch((err) => {
        console.log(err)
        res.status(500).json({
            code: 0,
            data: err,
            message: JSON.stringify(err)
        })
    })
}))
router.get('/account-info', asyncHandler(async function (req, res) {
    let year = req.query.year || new Date().getFullYear()
    AccountTable.findAll({
        where: {openid: req.openid}
    }).then((data) => {
        let accountList = data.filter((item) => {
            let calcyear = new Date(item.account_date).getFullYear() + ''
            return calcyear === year
        })
        let income = 0, outcome = 0
        accountList.forEach((item) => {
            if (item.account_income === 1) {
                income += Number(item.account_fund)
            } else {
                outcome += Number(item.account_fund)
            }
        })
        console.log(income, outcome)
        res.json({
            income, 
            outcome,
            total: accountList.length
        })
    })
}))
module.exports = router