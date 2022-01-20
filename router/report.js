let express = require('express')
let router = express.Router()
const puppeteer = require('puppeteer')
const path = require('path')

router.get('/', async function (req, res) {
  let { url, width = 750, height = 1334 } = req.query
  if (!url) {
    res.json({
      code: 0,
      data: null,
      message: '截屏失败'
    })
    return
  }
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  await page.setViewport({
    width,
    height
  })
  await page
    .goto(url, {
      waitUntil: 'domcontentloaded'
    })
    .catch(err => {
      console.log(err)
      res.json({
        code: 0,
        data: null,
        message: '截屏失败'
      })
    })
  try {
    const timestamp = Date.now()
    const temppath = path.join(__dirname, `../static/img/${timestamp}.jpg`)
    await page
      .screenshot({
        path: temppath,
        fullPage: true,
        // type: 'png',
        encoding: 'gbk'
      })
      .catch(err => {
        res.json({
          code: 0,
          data: null,
          message: '截屏失败'
        })
      })
    res.set('Content-Type', 'image/jpg; charset=utf-8')
    let url = path.resolve(temppath)
    fs.readFile(url, function (err, data) {
      if (err) {
        res.header('Content-Type', 'application/json;charset=utf-8')
        res.status(404).json({
          code: 0,
          message: '404!没有找到相应资源，请检查路径'
        })
      } else {
        res.send(data)
      }
    })
  } catch (e) {
    res.json({
      code: 0,
      data: null,
      message: '截屏失败'
    })
  } finally {
    await browser.close()
  }
})
module.exports = router
