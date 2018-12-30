let express = require('express')
let router = express.Router()
let asyncHandler = require('express-async-handler')
let uuidv1 = require('uuid/v1')
let {AccountTable, QarecordTable} = require('../models/model.js')
let Sequelize = require('sequelize')
const OP = Sequelize.Op
let {formatTime, compare} = require('../utils/tool.js')

// JWT试验路由 小程序在登录后拿到opened和session_key后下发token 再写一个router.use()中间件
// if token将解密后的openeid 挂载到req下 next() 否则res.status(403).json({}) 
router.get('/admin', asyncHandler(async function (req, res) {
    console.log(req.openid)
    res.json({
        name: 'xiaolin'
    })
}))
// 修改记账
router.put('/edit-account', asyncHandler(async function (req, res) {
    let {
        account_id,
        account_income,
        account_type,
        account_fund,
        account_date,
        account_comment
    } = req.body
    if (!account_id) {
        res.status(403).json({
            code: 0,
            data: null,
            message: 'account_id缺失'
        })
    }
    AccountTable.update(
        {
            account_id,
            account_income,
            account_type,
            account_fund,
            account_date,
            account_comment
        },
        {where: {account_id: account_id}}
    ).then(() => {
        res.json({
            code: 1,
            data: 'null',
            message: '保存成功'
        })
    }).catch((err) => {
        res.status(500).json({
            code: 0,
            data: err,
            message: JSON.stringify(err)
        })
    })
}))

// 删除记账
router.delete('/del-account', asyncHandler(async function (req, res) {
    let {account_id} = req.body
    AccountTable.destroy({
        where: {account_id: account_id}
    }).then(() =>{
        res.json({
            code: 1,
            data: null,
            message: '删除成功'
        })
    }).catch((err) => {
        res.status(500).json({
            code: 0,
            data: err,
            message: JSON.stringify(err)
        })
    })
}))

// 新增记账
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
        account_id: uuidv1().substr(0, 13),
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
            code: 0,
            data: err,
            message: JSON.stringify(err)
        })
    })
}))

// 获取账本
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

// 获取账本信息
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
        income = income.toFixed(2)
        outcome = outcome.toFixed(2)
        res.json({
            income, 
            outcome,
            total: accountList.length
        })
    })
}))

// 新增对战记录
router.post('/add-qarecord', asyncHandler(async function (req, res) {
    let {record_self, record_match, record_winner, record_qatype} = req.body
    QarecordTable.create({
        record_id: uuidv1().substr(0, 13),
        record_self,
        record_match,
        record_winner,
        record_qatype
    }).then(() => {
        res.json({
            code: 1,
            data: null,
            message: '对局记录成功'
        })
    }).catch((err) => {
        res.status(500).json({
            code: 0,
            data: JSON.stringify(err),
            message: '对局记录失败'
        })
    })
}))

// 获取对战记录
router.get('/get-qarecord', asyncHandler(async function (req, res) {
    console.log(req.openid)
    QarecordTable.findAndCountAll({
        where: {
            record_self: {
                [OP.like]: req.openid
            }
            // [OP.or]: [
            //     {
            //         record_self: {[OP.like]: req.openid}
            //     },
            //     {
            //         record_match: {[OP.like]: req.openid}
            //     }
            // ]
        }
    }).then((data) => {
        res.json({
            code: 1,
            data: data,
            message: '获取对局记录成功'
        })
    }).catch((err) => {
        res.status(500).json({
            code: 0,
            data: JSON.stringify(err),
            message: '获取对局记录失败'
        })
    })
}))
module.exports = router