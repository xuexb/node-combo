var fs = require('fs');


function load(data) {
    var code = fs.readFileSync(data.path).toString();

    code = code.replace(/\\/g, '\\\\').replace(/\'/g, '\\\'').replace(/[\r]+/g, '\\');

    code = 'define(\''+ data.uri +'\',[], \''+ code +'\');';

    return code;
}

module.exports = load;