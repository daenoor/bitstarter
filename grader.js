#!/usr/bin/env node
/*
 Automatically grade files for the presence of specified HTML tags/attributes.
 Uses commander.js and cheerio. Teaches command line application development
 and basic DOM parsing

 References:

 + cheerio
 - https://github.com/MatthewMueller/cheerio
 - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
 - http://maxodgen.com/scraping-with-node.html

 + commander.js
 - https://github.com/visionmedia/commander.js
 - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
 - http://en.wikipedia.org/wiki/JSON
 - https://developer.mozilla.org/en-US/docs/JSON
 - https://developer.mozilla.org/en-US/docs/JSON_in_Firefox_2
 */

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');

var HTML_FILE_DEFAULT = 'index.html';
var CHECKS_FILE_DEFAULT = 'checks.json';

var assertFileExists = function (infile) {
    var in_str = infile.toString();
    if (!fs.existsSync(in_str)) {
        console.log("%s doesn't exist. Exiting.", in_str);
        process.exit(1)
    }

    return in_str;
};

var cheerioHtml = function (html) {
    return cheerio.load(html);
};

var loadChecks = function (checks_file) {
    return JSON.parse(fs.readFileSync(checks_file));
};

var checkHtmlFile = function (html, checks_file) {
    var $ = cheerioHtml(html),
        checks = loadChecks(checks_file).sort(),
        out = {};

    for (var i in checks) {
        out[checks[i]] = $(checks[i]).length > 0;
    }

    return out;
};

var clone = function (fn) {
    // workaround for commander.js issue.
    // See http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var check = function(html, checks){
    var checkJson = checkHtmlFile(html, checks),
        out_json = JSON.stringify(checkJson, null, 4);

    console.log(out_json);

};

var checkExternalPage = function (url, checks, callback) {
    rest.get(url).on('complete', function (result, response) {
        if (result instanceof Error) {
            console.log("Can't fetch url %s. Exiting", url);
            process.exit(1);
        }

        console.log("fetched url %s with result %s", url, response.statusCode);
        callback(result, checks)
    });
};

if (require.main == module) {
    program
        .option('-c, --checks <checks_file>', 'Path to checks.json', clone(assertFileExists), CHECKS_FILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTML_FILE_DEFAULT)
        .option('-u, --url <url>', 'Path to external page')
        .parse(process.argv);

    if (!program.url){
        var html = fs.readFileSync(program.file)
        check(html, program.checks);
    } else {
        checkExternalPage(program.url, program.checks, check);
    }
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
