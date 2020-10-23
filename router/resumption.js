let express = require('express')
let router = express.Router()
const puppeteer = require('puppeteer')
// const path = require('path')

router.get('/', async function (req, res) {
  const { url } = req.query
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  await page
    .goto(url, {
      waitUntil: 'domcontentloaded'
    })
    .then(() => {
      setTimeout(() => {
        res.json({
          code: 200,
          data: {
            url
          },
          message: '访问成功'
        })
      }, 6000)
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({
        code: 0,
        data: null,
        message: '访问失败'
      })
    })
})
module.exports = router
