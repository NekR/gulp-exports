var through = require('through2');

module.exports = gulpExports;

function gulpExports(host, exports) {
    if (!exports) {
        exports = host;
        host = '(window || self)';
    }
    if (typeof exports === 'string') {
        exports = (function (exports) {
            return function () {
                return exports;
            };
        })(exports);
    }
    if (typeof exports !== 'function') {
        exports = false;
    }

    return through.obj(function (file, enc, next) {
        if (!file.isBuffer()) {
            return next(null, file);
        }
        var expose = exports && exports(file);
        if (!expose) {
            return next(null, file);
        }
        var contents = wrap(file.contents.toString(enc), host, expose);
        file.contents = new Buffer(contents, enc);
        next(null, file);
    });
}

function wrap(code, host, exports) {
  return `
    (function() {
      var module = { exports: {} };

      (function (exports) {
        /****** code begin *********/

        ${ code }

        /****** code end *********/
      }).call(module.exports, module.exports);

      ${ host }['${ exports }'] = module.exports;
    }())
  `;
}

