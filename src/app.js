import fs from 'fs';
// https://github.com/yanyiwu/nodejieba
import nodejieba from 'nodejieba';
nodejieba.load();
// https://github.com/theajack/cnchar
import cnchar from 'cnchar';
import poly from 'cnchar-poly';
import order from 'cnchar-order';
import trad from 'cnchar-trad';
cnchar.use(poly, order, trad);
// https://github.com/hotoo/pinyin
import pinyin from 'pinyin';
import readline from 'readline';
// https://github.com/marga8080/scbz/blob/master/src/App.js
import Lunar from './utils/Lunar';
import Horoscope from './utils/Horoscope';

const date = new Date();
let lunar = Lunar.calc(date);
let scbz = Horoscope.calc(date);
/*
lunar: {
  "year": 2019,   
  "isLeap": false,
  "month": 11,
  "day": 9,
  "cYear": "己亥",
  "cMonth": "十一月",
  "cDay": "初九",
  "str": "己亥年十一月初九"
}
scbz: {
  "nz": "己亥",
  "yz": "乙亥",
  "rz": "乙亥",
  "sz": "丁亥",
  "bz": "己亥、乙亥、乙亥、丁亥",
  "wx": "土水、木水、木水、火水",
  "fw": "中北、东北、东北、南北",
  "shishen": "偏财、比肩、日主、食神"
}
*/
console.info(`lunar: ${JSON.stringify(lunar, null, 2)}`);
console.info(`scbz: ${JSON.stringify(scbz, null, 2)}`);

const getTwoWordsFromPoetryAndChu = () => {
  const poetryContents = fs.readFileSync('resources/诗经.txt');
  const chuContents = fs.readFileSync('resources/楚辞.txt');

  const extractTwoWords = contents => {
    // use nodejieba.tag to cut sentences in order to remove the stop words easier
    let result = nodejieba.tag(contents);
    // ignore the stop words
    result = result.filter(item => item.tag !== 'x');
    // filter only two words
    result = result.filter(item => item.word.length === 2);
    // only need the actual word
    result = result.map(item => item.word);
    return result;
  };

  const poetryTwoWords = extractTwoWords(poetryContents);
  const chuTwoWords = extractTwoWords(chuContents);
  let twoWords = [...poetryTwoWords, ...chuTwoWords];
  // remove Duplicate
  twoWords = Array.from(new Set(twoWords));
  return twoWords;
};

const getTwoWordsFromIdioms = () => {
  return new Promise((resolve, reject) => {
    const fRead = fs.createReadStream('resources/THUOCL_chengyu.txt');
    const objReadline = readline.createInterface({
      input: fRead,
    });
    const twoWords = [];
    objReadline.on('line', line => {
      const [words, _] = line.split(/\s+/);
      if (words.length === 4) {
        twoWords.push(words.substring(0, 2));
        twoWords.push(words.substring(2));
      } else {
        const fragments = nodejieba.cut(words);
        twoWords.push(...fragments.filter(item => item.length === 2));
      }
    });
    objReadline.on('close', () => {
      resolve(Array.from(new Set(twoWords)));
    });
  });
};

const getTwoWordsFromHistoryName = () => {
  return new Promise((resolve, reject) => {
    const fRead = fs.createReadStream('resources/THUOCL_lishimingren.txt');
    const objReadline = readline.createInterface({
      input: fRead,
    });
    const twoWords = [];
    objReadline.on('line', line => {
      const [words, _] = line.split(/\s+/);
      if (words.length === 3) {
        twoWords.push(words.substring(1));
      }
    });
    objReadline.on('close', () => {
      resolve(Array.from(new Set(twoWords)));
    });
  });
};

(async () => {
  console.info(`extract two words from poetry and chu`);
  const poetryAndChuTwoWords = getTwoWordsFromPoetryAndChu();
  console.info(`extract two words from idioms`);
  const idiomTwoWords = await getTwoWordsFromIdioms();
  console.info(`extract two words from history name`);
  const historyNameTwoWords = await getTwoWordsFromHistoryName();
  // filter the 9-23, 10-7, 9-7, 22-15, 2-14, 20-4, 8-24, 3-14
  const goodStroke = ['9-23', '10-7', '9-7', '22-15', '2-14', '20-4', '8-24', '3-14'];

  const filterNiceName = (candidateTwoWords, strokes) => {
    // add tradition and stroke info
    let enrichedTwoWords = candidateTwoWords.map(simple => {
      const tradition = cnchar.convert.simpleToTrad(simple);
      const simpleStroke = cnchar.stroke(simple, 'array');
      const traditionStroke = cnchar.stroke(tradition, 'array');
      return { simple, tradition, simpleStroke, traditionStroke };
    });
    // filter by strokes
    const niceEnrichedTwoWords = enrichedTwoWords.filter(item => strokes.includes(item.traditionStroke.join('-')));
    return niceEnrichedTwoWords;
  };
  let output = '';
  let niceEnrichedTwoWords = [];
  niceEnrichedTwoWords = filterNiceName(poetryAndChuTwoWords, goodStroke);
  output += '\n\n\n------------ poetry and chu candidate names ------------';
  output += niceEnrichedTwoWords.reduce(
    (pre, cur) =>
      `${pre}\n${cur.simple},${cur.tradition},${cur.simpleStroke.join('-')},${cur.traditionStroke.join('-')}`,
    ''
  );
  niceEnrichedTwoWords = filterNiceName(idiomTwoWords, goodStroke);
  output += '\n\n\n------------ idiom candidate names ------------';
  output += niceEnrichedTwoWords.reduce(
    (pre, cur) =>
      `${pre}\n${cur.simple},${cur.tradition},${cur.simpleStroke.join('-')},${cur.traditionStroke.join('-')}`,
    ''
  );
  niceEnrichedTwoWords = filterNiceName(historyNameTwoWords, goodStroke);
  output += '\n\n\n------------ history candidate names ------------';
  output += niceEnrichedTwoWords.reduce(
    (pre, cur) =>
      `${pre}\n${cur.simple},${cur.tradition},${cur.simpleStroke.join('-')},${cur.traditionStroke.join('-')}`,
    ''
  );
  fs.writeFileSync('output.txt', output);
})();
