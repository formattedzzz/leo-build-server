let express = require('express')
let router = express.Router()
const puppeteer = require('puppeteer');
const path = require('path');

router.get('/', async function(req, res){
  let {skuid, sessionid} = req.query;
  if (!skuid || !sessionid) {
    res.json({
      code: 0,
      data: null,
      message: '截屏失败'
    })
  }
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.setViewport({
    width: 750,
    height: 1334
  });
  // let request_url = `https://ecs.nncz.cn/report/summary/${skuid}/${sessionid}#ping`;
  let request_url = 'https://blog.nnleo.cn';
  await page.goto(request_url, {
    waitUntil: 'domcontentloaded'
  }).catch(err => {
    console.log(err)
    res.json({
      code: 0,
      data: null,
      message: '截屏失败'
    })
  });
  try {
    console.log(path.join(__dirname, `../static/img/${skuid + sessionid}.jpg`))
    await page.screenshot({
      path: path.join(__dirname, `../static/img/${skuid + sessionid}.jpg`),
      fullPage: true,
      // type: 'png',
      encoding: 'utf-8' 
    }).catch(err => {
      res.json({
        code: 0,
        data: null,
        message: '截屏失败'
      })
    });
    res.json({
      code: 1,
      data: `https://wx.nnleo.cn/static/img/${skuid + sessionid}.jpg`,
      message: '截屏成功'
    })
  } catch (e) {
    res.json({
      code: 0,
      data: null,
      message: '截屏失败'
    })
  } finally {
    await browser.close();
  }
})
module.exports = router