var request = require('request');
var cheerio = require('cheerio');

var category = require('./cate.json');

module.exports = function (categoryName, start, end, callback) {
    var url = category[categoryName];
    if (category == null) {
        throw new Error('没有这个分类')
    }

    function getResult(page, start, end, callback) {
        let pageUrl = url;
        if (page !== 1) {
            pageUrl = url.replace('.html', '_' + page + '.html');
        }

        var result = [];
        request(pageUrl, function (error, response, body) {
            if (response && response.statusCode === 200) {
                var $ = cheerio.load(body);
                var elements = $('#content > div.Wrapper > div.TopListCent > div.TopListCent-listWrap > ul > li.clearfix > div.CentTxt > h3');
                for (var i = start % 30; i < 30 && i <= end % 30 && i < elements.length; i++) {
                    result.push({
                        name: elements[i].children[0].attribs.title,
                        domain: elements[i].children[1].children[0].data
                    });
                }
            }
            callback(result)
        });
    }

    var startPage = parseInt(start / 30) + 1;
    var iterFunc = function iterFunc(i, start, end, finalResult, callback) {
        var endPage = parseInt(end / 30) + 1;
        if (i <= endPage) {
            getResult(i, start, end, function (result) {
                finalResult = finalResult.concat(result);
                iterFunc(++i, start, end, finalResult, callback);
            });
        } else {
            callback(finalResult)
        }
    };

    iterFunc(startPage, start, end, [], callback)
};