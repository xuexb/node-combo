var combo = require('./index');


combo({
    base: '../../web/html5/',
    port: 90,
    alias: {
        'global': 'src/??seajs/sea,seajs/sea-style,seajs/sea-config,lib/dialog/base,photog/home,lib/zepto,lib/template,lib/imgLoad/base,lib/share/base,lib/slide/tab,lib/slide/base,lib/base,lib/class'
    },
});