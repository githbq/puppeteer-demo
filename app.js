const puppeteer = require('puppeteer');

const sleep = time => new Promise(resolve => {
    setTimeout(resolve, time);
})

const url = `https://h5.oschina.net`;
;(async () => {
    console.log('Start visit');

    const brower = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        dumpio: false
    });

    const page = await brower.newPage()   // 开启一个新页面

    await page.goto(url, {
        waitUntil: 'networkidle2'  // 网络空闲说明已加载完毕
    });

    //加载jQuery
    await page
        .mainFrame()
        .addScriptTag({
            url: 'https://cdn.bootcss.com/jquery/3.2.0/jquery.min.js'
        })

    await sleep(1000);

    // 编辑推荐内容
    await page.waitForSelector('.osc-list');

    // 结果
    const result = await page.evaluate(() => {
        //获取的数据数组
        let dataTemp = [];

        let articles = $('.project-item');

        for (let i = 0; i < articles.length; i++) {
            let article = articles[i];
            let descDoms = $(article).find('.osc-cell__title');
            let name = descDoms.find('.project-item__name').text();
            let title = descDoms.find('.project-item__desc').text();
            let desc = descDoms.find('.content').text();
            let ident = title.toLowerCase();

            dataTemp.push({
                name: name,
                title: title,
                desc: desc,
                ident: ident
            });
        }
        return dataTemp;
    });
    // 关闭浏览器
    brower.close();
    console.log(result);
})();