let express = require('express')
let router = express.Router()
const puppeteer = require('puppeteer');
const path = require('path');

router.get('/', async function(req, res){
  let {skuid, sessionid} = req.query;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({
    width: 750,
    height: 1334
  });
  let request_url = `https://ecs.nncz.cn/report/summary/${skuid}/${sessionid}#ping`;
  await page.goto(request_url, {
    waitUntil: 'domcontentloaded'
  }).catch(err => console.log(err));
  try {
    await page.screenshot({
      path: path.join(__dirname, "../static/img"),
      fullPage: true
    }).catch(err => {
      res.json({
        code: 0,
        data: null,
        message: '截屏失败'
      })
    });
    res.json({
      code: 1,
      data: `https://wx.nnleo.cn/static/img/${skuid}-${sessionid}.jpg`,
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