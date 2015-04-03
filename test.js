var puts = require('util').puts,
fs = require('fs'),
cssmin = require('cssmin');
var css = fs.readFileSync("test.css", encoding='utf8');
var min = cssmin(css);
puts(min);