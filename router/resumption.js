let express = require('express')
let router = express.Router()
const puppeteer = require('puppeteer')
// const path = require('path')

router.get('/', async function (req, res) {
  const { url, sec } = req.query
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  await page
    .goto(url, {
      waitUntil: 'domcontentloaded'
    })
    .then(() => {
      setTimeout(
        () => {
          page.close()
          res.json({
            code: 200,
            data: {
              url
            },
            message: '访问成功'
          })
        },
        sec ? sec * 1000 : 6000
      )
    })
    .catch(err => {
      console.log(err)
      page.close()
      res.status(500).json({
        code: 0,
        data: null,
        message: '访问失败'
      })
    })
})
module.exports = router
