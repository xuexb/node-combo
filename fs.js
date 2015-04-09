var fs = require('fs');
var path = require('path');

var url = path.join(__dirname, 'xl.json');

console.log(url);

fs.chmodSync(url, 777);

fs.writeSync(url, JSON.stringify({a:1,b:2}), 0, 'utf-8');

console.log(1);