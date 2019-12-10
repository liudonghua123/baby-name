import * as request from 'request';
import rp from 'request-promise';
import * as iconv from 'iconv-lite';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import { any } from 'bluebird';

const wuxingInfos: any[] = [
  { wuxing: 'jin', startPage: 'http://xh.5156edu.com/wx/jin.html' },
  { wuxing: 'mu', startPage: 'http://xh.5156edu.com/wx/mu.html' },
  { wuxing: 'shu', startPage: 'http://xh.5156edu.com/wx/shu.html' },
  { wuxing: 'huo', startPage: 'http://xh.5156edu.com/wx/huo.html' },
  { wuxing: 'tu', startPage: 'http://xh.5156edu.com/wx/tu.html' },
];

const getTotalPages = async (startPage: string): Promise<any> => {
  try {
    const html = await rp({
      uri: startPage,
      encoding: null, // do not interpret content yet
    });
    const $ = cheerio.load(iconv.decode(html, 'gb18030'));
    const pageInfo = $('body > div > center > table > tbody > tr:nth-child(1) > td > p').text();
    // the pageInfo is like `首页  上一页  下一页  尾页  页次：1/6 每页：300 本类资料：1503 个`
    const {
      groups: { totalPage, count },
    } = /页次：1\/(?<totalPage>\d+).*本类资料：(?<count>\d+) 个/.exec(pageInfo) as any;
    return { totalPage, count };
  } catch (error) {
    console.error(error);
  }
};

const parsePageContent = async (pageUrl: string): Promise<any> => {
  try {
    const html = await rp({
      uri: pageUrl,
      encoding: null, // do not interpret content yet
    });
    const $ = cheerio.load(iconv.decode(html, 'gb18030'));
    const result: any[] = [];
    $('table table[align="center"][width="760"] a').each(function(this: any) {
      const word = $(this)
        .contents()
        .first()
        .text();
      const link = 'http://xh.5156edu.com' + $(this).attr('href');
      let pinyins: any = $('span', $(this)).text();
      pinyins = pinyins.substring(0, pinyins.length - 1).split(',');
      result.push({
        word,
        link,
        pinyins,
      });
    });
    return result;
  } catch (error) {
    console.error(error);
  }
};

const generateUrls = (startPage: string, totalPage: number): string[] => {
  const urls = [startPage];
  for (let currentPage = 2; currentPage <= totalPage; currentPage++) {
    urls.push(`${startPage.substring(0, startPage.indexOf('.html'))}_${currentPage}.html`);
  }
  return urls;
};

(async () => {
  // 五行汇总信息
  const wuxingSummary: any = {};
  // 五行字典信息，用于快速查找信息
  const wuxingDict: any = {};
  for (const wuxingInfo of wuxingInfos) {
    console.info(`processing ${wuxingInfo.wuxing}`);
    const pageInfo = await getTotalPages(wuxingInfo.startPage);
    const jinUrls = generateUrls(wuxingInfo.startPage, pageInfo.totalPage);
    const data = (await Promise.all(jinUrls.map(url => parsePageContent(url)))).flat();
    wuxingInfo.data = data;
    wuxingInfo.count = pageInfo.count;
    // collect summary data
    wuxingSummary[wuxingInfo.wuxing] = data
      .map(item => item.word)
      .reduce((pre, cur) => pre + cur, '');
    // collect dict data
    data
      .map(item => ({
        wuxing: wuxingInfo.wuxing,
        ...item,
      }))
      .reduce((_, cur) => (wuxingDict[cur.word] = cur), {});
  }
  // save the result to json file
  fs.writeFileSync('wuxing-data.json', JSON.stringify(wuxingInfos, null, 2));
  fs.writeFileSync('wuxing-summary.json', JSON.stringify(wuxingSummary, null, 2));
  fs.writeFileSync('wuxing-dict.json', JSON.stringify(wuxingDict, null, 2));
})();
