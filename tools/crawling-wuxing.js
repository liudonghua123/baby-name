"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var rp = require("request-promise");
var iconv = require("iconv-lite");
var cheerio = require("cheerio");
var fs = require("fs");
var wuxingInfos = [
    { wuxing: 'jin', startPage: 'http://xh.5156edu.com/wx/jin.html' },
    { wuxing: 'mu', startPage: 'http://xh.5156edu.com/wx/mu.html' },
    { wuxing: 'shu', startPage: 'http://xh.5156edu.com/wx/shu.html' },
    { wuxing: 'huo', startPage: 'http://xh.5156edu.com/wx/huo.html' },
    { wuxing: 'tu', startPage: 'http://xh.5156edu.com/wx/tu.html' },
];
var getTotalPages = function (startPage) { return __awaiter(void 0, void 0, void 0, function () {
    var html, $, pageInfo, _a, totalPage, count, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, rp({
                        uri: startPage,
                        encoding: null
                    })];
            case 1:
                html = _b.sent();
                $ = cheerio.load(iconv.decode(html, 'gb18030'));
                pageInfo = $('body > div > center > table > tbody > tr:nth-child(1) > td > p').text();
                _a = /页次：1\/(?<totalPage>\d+).*本类资料：(?<count>\d+) 个/.exec(pageInfo).groups, totalPage = _a.totalPage, count = _a.count;
                return [2 /*return*/, { totalPage: totalPage, count: count }];
            case 2:
                error_1 = _b.sent();
                console.error(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var parsePageContent = function (pageUrl) { return __awaiter(void 0, void 0, void 0, function () {
    var html, $_1, result_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, rp({
                        uri: pageUrl,
                        encoding: null
                    })];
            case 1:
                html = _a.sent();
                $_1 = cheerio.load(iconv.decode(html, 'gb18030'));
                result_1 = [];
                $_1('table table[align="center"][width="760"] a').each(function () {
                    var word = $_1(this)
                        .contents()
                        .first()
                        .text();
                    var link = 'http://xh.5156edu.com' + $_1(this).attr('href');
                    var pinyins = $_1('span', $_1(this)).text();
                    pinyins = pinyins.substring(0, pinyins.length - 1).split(',');
                    result_1.push({
                        word: word,
                        link: link,
                        pinyins: pinyins
                    });
                });
                return [2 /*return*/, result_1];
            case 2:
                error_2 = _a.sent();
                console.error(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var generateUrls = function (startPage, totalPage) {
    var urls = [startPage];
    for (var currentPage = 2; currentPage <= totalPage; currentPage++) {
        urls.push(startPage.substring(0, startPage.indexOf('.html')) + "_" + currentPage + ".html");
    }
    return urls;
};
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var wuxingSummary, wuxingDict, _loop_1, _i, wuxingInfos_1, wuxingInfo;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                wuxingSummary = {};
                wuxingDict = {};
                _loop_1 = function (wuxingInfo) {
                    var pageInfo, jinUrls, data;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.info("processing " + wuxingInfo.wuxing);
                                return [4 /*yield*/, getTotalPages(wuxingInfo.startPage)];
                            case 1:
                                pageInfo = _a.sent();
                                jinUrls = generateUrls(wuxingInfo.startPage, pageInfo.totalPage);
                                return [4 /*yield*/, Promise.all(jinUrls.map(function (url) { return parsePageContent(url); }))];
                            case 2:
                                data = (_a.sent()).flat();
                                wuxingInfo.data = data;
                                wuxingInfo.count = pageInfo.count;
                                // collect summary data
                                wuxingSummary[wuxingInfo.wuxing] = data
                                    .map(function (item) { return item.word; })
                                    .reduce(function (pre, cur) { return pre + cur; }, '');
                                // collect dict data
                                data
                                    .map(function (item) { return (__assign({ wuxing: wuxingInfo.wuxing }, item)); })
                                    .reduce(function (_, cur) { return (wuxingDict[cur.word] = cur); }, {});
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, wuxingInfos_1 = wuxingInfos;
                _a.label = 1;
            case 1:
                if (!(_i < wuxingInfos_1.length)) return [3 /*break*/, 4];
                wuxingInfo = wuxingInfos_1[_i];
                return [5 /*yield**/, _loop_1(wuxingInfo)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                // save the result to json file
                fs.writeFileSync('wuxing-data.json', JSON.stringify(wuxingInfos, null, 2));
                fs.writeFileSync('wuxing-summary.json', JSON.stringify(wuxingSummary, null, 2));
                fs.writeFileSync('wuxing-dict.json', JSON.stringify(wuxingDict, null, 2));
                return [2 /*return*/];
        }
    });
}); })();
