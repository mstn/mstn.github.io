// append cookie consent script before </body>
// load google analytics only if consent is given
// TODO pretty ugly hack, investigate if there exists a better way in Hexo
function render(data) {
    return data.replace('</body>',
        '<script async src="https://www.googletagmanager.com/gtag/js?id=UA-80361243-4"></script>' +
        '<link rel="stylesheet" type="text/css" href="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.0.3/cookieconsent.min.css" />' +
        '<script src="//cdnjs.cloudflare.com/ajax/libs/cookieconsent2/3.0.3/cookieconsent.min.js"></script>' +
        '<script>' +
        'window.cookieconsent.initialise({' +
        'content: {' +
        'message: "This website uses cookies (gtag/Google Analytics) to measure content popularity. If I see there is interest in what I write, I am more encouraged to publish new stuff. If you click on the button, you will give your consent for cookies.",' +
        'dismiss: "Accept Cookies",' +
        '},' +
        'onStatusChange: function(status) {' +
        '  if ( this.hasConsented() ) { ' +
        '      window.dataLayer = window.dataLayer || []; ' +
        '      function gtag(){dataLayer.push(arguments);} ' +
        '      gtag("js", new Date()); ' +
        '      gtag("config", "UA-80361243-4"); ' +
        '  } ' +
        '},' +
        '"palette": {' +
        '     "popup": {' +
        '       "background": "#000"' +
        '     },' +
        '     "button": {' +
        '       "background": "#f1d600"' +
        '     }' +
        '   }' +
        ' })' +
        '</script></body>');
}

hexo.extend.filter.register('after_render:html', render);
