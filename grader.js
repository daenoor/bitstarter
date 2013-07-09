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

var HTML_FILE_DEFAULT = 'index.html';
var CHECKS_FILE_DEFAULT = 'checks.json';

var assertFileExists = function(infile){
    var in_str = infile.toString();
    if (!fs.existsSync(in_str)){
        console.log("%s doesn't exist. Exiting.", in_str);
        process.exit(1)
    }

    return in_str;
};

var cheerioHtmlFile = function(html_file){
    return cheerio.load(fs.readFileSync(html_file));
};

var loadChecks = function(checks_file){
    return JSON.parse(fs.readFileSync(checks_file));
};

var checkHtmlFile = function(html_file, checks_file){
    var $ = cheerioHtmlFile(html_file),
        checks = loadChecks(checks_file).sort(),
        out = {};

    for (var i in checks){
        var present = $(checks[i]).length>0;
        out[checks[i]] = present;
    }

    return out;
};

var clone = function(fn){
    // workaround for commander.js issue.
    // See http://stackoverflow.com/a/6772648
    return fn.bind({});
}

if (require.main == module){
    program
        .option('-c, --checks <checks_file>', 'Path to checks.json', clone(assertFileExists), CHECKS_FILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTML_FILE_DEFAULT)
        .parse(process.argv);

    var checkJson = checkHtmlFile(program.file, program.checks),
        out_json = JSON.stringify(checkJson, null, 4);

    console.log(out_json);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
