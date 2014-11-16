(function (root) {
    'use strict';

    var Cache = {},
        _sim = {},
        _stack = [],
        _head = document.getElementsByTagName('head')[0],
        _require,
        _base,
        MODULE_CACHE_KEY = 'module',
        CGI_CACHE_KEY = 'cgi',
        STORAGE_MODULE_NAME = 'storage',
        DOT_RE = /\/\.\//g,
        DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//,
        DOUBLE_SLASH_RE = /([^:/])\/\//g;

    function _isFunction(f) {
        return typeof f === 'function';
    }

    function _normalize(base, id) {
        if (_isUnnormalId(id)) return id;
        if (_isRelativePath(id)) return _resolvePath(base, id) + '.js';
        return id;
    }

    function _isUnnormalId(id) {
        return (/^https?:|^file:|^\/|\.js$/).test(id);
    }

    function _isRelativePath(path) {
        return (path + '').indexOf('.') === 0;
    }

    function _resolvePath(base, path) {
        path = base.substring(0, base.lastIndexOf('/') + 1) + path;
        path = path.replace(DOT_RE, '/');
        while (path.match(DOUBLE_DOT_RE)) {
            path = path.replace(DOUBLE_DOT_RE, '/');
        }
        return path = path.replace(DOUBLE_SLASH_RE, '$1/');
    }

    // just a async parallel
    function parallel(tasks, cb) {
        var results = [], pending = tasks.length, keys;

        function done(i, err, result) {
            results[i] = result;
            if (--pending === 0 || err) {
                cb && cb(err, results);
                cb = null;
            }
        }

        if (!pending) {
            cb && cb(null, results);
            cb = null;
        } else {
            tasks.forEach(function (task, i) {
                task(done.bind(undefined, i));
            });
        }
    }

    // like a sync require
    function _getMod(opt) {
        var name = opt.name,
            base = opt.base,
            path = _normalize(base, name),
            mod;
        return (mod = Cache[path]) ?
            mod.exports : false; 
    }

    function _initCache(path) {
        return Cache[path] = {
            dones: [], 
            url: _sim[path] || path, 
            loaded: false
        };
    }

    function _save(path) {
        var db = require(STORAGE_MODULE_NAME),
            mod = Cache[path];

        db && (mod.factory ?
            db.set(MODULE_CACHE_KEY, {
                path: path,
                factory: mod.factory.toString(),
                deps: JSON.stringify(mod.deps)
            }) : db.set(MODULE_CACHE_KEY, {
                path: path,
                json: JSON.stringify(mod.json)
            }));
    }

    function _dealKeywords(mods, require, module) {
        mods = [].slice.call(mods, 0);
        mods.forEach(function (mod, i) {
            if (mod === 'require') {
                mods[i] = require;
            } else if (mod === 'module') {
                mods[i] = module;
            } else if (mod === 'exports') {
                mods[i] = module.exports;
            }
        });
        return mods;
    }

    function _runFactory(path, factory, deps, saved) {
        var mod = Cache[path],
            r = makeRequire({ base: mod.url });
        function _run() {
            if (_isFunction(factory)) {
                var module = { exports: {} }, mods;
                mod.factory = mod.factory || factory;
                mod.exports = mod.exports || 
                    factory.apply(this, _dealKeywords(arguments, makeRequire({ base: mod.url }), module)) ||
                        module.exports;
            } else {
                mod.json = factory;
                mod.exports = factory;
            }
            mod.dones.forEach(function (done) {
                done(null, mod.exports);
            });
            mod.dones.length = 0;
            saved && _save(path);
        }
        if (deps) {
            mod.deps = deps.slice(0);
            setTimeout(function () {
                r(deps, _run);
            }, 0);
        } else {
            _run();
        }
    }

    function _makeMod(src) {
        var url = Cache[src].url;
        _stack.forEach(function (o) {
            if (!o.m) o.m = src;
            var path = _normalize(url, o.m),
                factory = o.f,
                mod = Cache[path];
            if (!mod) {
                mod = _initCache(path);
                _runFactory(path, factory, o.d, true);
            }
            !mod.exports && _runFactory(path, factory, o.d, true);
        });
        _stack.length = 0;
    }

    function _loadScript(path) {
        var node = document.createElement('script'),
            mod = Cache[path];
        node.addEventListener('load', _onload, false);
        node.addEventListener('error', _onerror, false);
        node.type = 'text/javascript';
        node.src = mod.url;
        _head.appendChild(node);
        function _onload() {
            _onend();
            return _makeMod(path);
        }
        function _onerror() {
            _onend();
            _head.removeChild(node);
            // TODO
            mod.dones.forEach(function (done) {
                done(new Error(404));
            });
            mod.dones.length = 0;
        }
        function _onend() {
            node.removeEventListener('load', _onload, false);
            node.removeEventListener('error', _onerror, false);
        }
    }

    function _buildCallback(opt) {
        var name = opt.name,
            base = opt.base,
            path = _normalize(base, name),
            mod = Cache[path],
            db = require(STORAGE_MODULE_NAME);

        return function (done) {
            if (!mod) {
                mod = _initCache(path);
                mod.dones.push(done);
                if (!db) { 
                    _loadScript(path);
                } else {
                    db.get(MODULE_CACHE_KEY, path, function (e) {
                        var data = this.result;
                        if (!data) {
                            _loadScript(path);
                        } else if (data.factory) {
                            var res = eval.call(window, '(' + data.factory + ')');
                            _runFactory(path, res, JSON.parse(data.deps));
                        } else if (data.json) {
                            _runFactory(path, JSON.parse(data.json));
                        }
                    });
                }
            } else {
                if ('exports' in mod) {
                    done(null, mod.exports);
                } else {
                    mod.dones.push(done);
                }
            }
        }
    }

    function makeRequire(opt) {
        // baseUrl
        var base = opt.base;
        function _r(deps, succ, fail) {
            // async
            if (succ) {
                deps.forEach(function (dep, i) {
                    // need build a callback
                    if (typeof dep === 'string') {
                        if (dep === 'require' || dep === 'exports' || dep === 'module') {
                            deps[i] = function (done) {
                                done(null, dep);
                            };
                        } else {
                            deps[i] = _buildCallback({
                                name: dep,
                                base: base
                            });
                        }
                    }
                });
                parallel(deps, function (err, results) {
                    if (err) return fail(err);
                    succ.apply(undefined, results);
                });
            // sync
            } else {
                return _getMod({
                    name: deps,
                    base: base
                });
            }
        }
        return _r;
    }

    function require() {
        if (_require) return _require.apply(root, arguments);
        if (_base) {
            _require = makeRequire({ base: _base });
        } else {
            _require = makeRequire({ base: location.href });
        }
        return _require.apply(root, arguments);
    }

    /**
     * define(module, deps, factory)
     * define(module, factory)
     * define(deps, factory)
     * define(factory)
     */
    function define(module, deps, factory) {
        if (!factory) {
            if (!deps) {
                factory = module;
                module = undefined;
                deps = null;
            } else {
                factory = deps;
                if (Array.isArray(module)) {
                    deps = module;
                    module = undefined;
                } else {
                    deps = null;
                }
            }
        }
        _stack.push({
            m: module,
            d: deps,
            f: factory
        });
    }



    define.amd = { jQuery: true };

    root.define = define;
    root.require = require;
    require.config = function (config) {
        var paths = config.paths;
        Object.keys(paths)
            .forEach(function (path) {
                _sim[path] = paths[path];
            });
    };

})(window);