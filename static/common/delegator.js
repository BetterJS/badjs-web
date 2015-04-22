/**
 * Map
 * @class
 */
function Map() {
    this.map = {};
    this.length = 0;
}
Map.prototype = {
    constructor: Map,
    /**
     * has
     * @param {String} key
     * @returns {Boolean}
     */
    has: function (key) {
        return (key in this.map);
    },
    /**
     * get
     * @param {String} key
     * @returns {Any}
     */
    get: function (key) {
        return this.map[key];
    },
    /**
     * set
     * @param {String} key
     * @param {Any} value
     */
    set: function (key, value) {
        !this.has(key) && this.length++;
        return (this.map[key] = value);
    },
    /**
     * count
     * @returns {Number}
     */
    count: function () {
        return this.length;
    },
    /**
     * remove
     * @param {String} key
     */
    remove: function (key) {
        if (this.has(key)) {
            this.map[key] = null;
            delete this.map[key];
            this.length--;
        }
    }
};

var cache = new Map(), set = cache.set, uid = 0;
cache.set = function (node, value) {
    if (!value) {
        value = node;
        set.call(cache, ++uid + '', value);
        return uid;
    } else {
        typeof node === 'string' &&
        (node = $(node)[0]);
        $.data(node, 'event-data', value);
        return this;
    }
};

function _key(arr) {
    if (!arr) return {};
    arr = arr.split(' ');
    var obj = {};
    for (var i = 0, l = arr.length; i < l; i++) {
        obj[arr[i]] = true;
    }
    return obj;
}

/**
 * Delegator
 * @class
 * @param {Selector} container
 */
function Delegator(container) {
    this.container = $(container);
    this.listenerMap = new Map();
}

/**
 * getKey
 * @param {Any} value
 * @returns {Number}
 */
Delegator.set = cache.set;
/**
 * cache
 * @class
 * @static
 */
Delegator.cache = cache;

Delegator.prototype = {
    constructor: Delegator,
    _getListener: function (type) {
        if (this.listenerMap.has(type)) {
            return this.listenerMap.get(type);
        }
        function listener(e) {
            var data = $.data(this),
                routes = data['event-' + type + '-routes'],
                eventData = data['event-data'], handle, dataKey;

            // preprocessing
            if (!routes && (routes = this.getAttribute('data-event-' + type))) {
                (routes = routes.split(' ')) &&
                (data['event-' + type + '-routes'] = routes);
                !eventData &&
                (dataKey = this.getAttribute('data-event-data')) &&
                (eventData = cache.get(dataKey)) &&
                (data['event-data'] = eventData) &&
                (cache.remove(dataKey));
                !data['event-stop-propagation'] &&
                (data['event-stop-propagation'] = _key(this.getAttribute('data-event-stop-propagation')));
            }

            if (routes) {
                for (var i = 0, l = routes.length; i < l; i++) {
                    handle = listener.handleMap.get(routes[i]);

                    if (handle) {
                        handle.call(this, e, eventData);
                    }
                    data['event-stop-propagation'][type] &&
                    e.stopPropagation();
                }
            }
        }

        listener.handleMap = new Map();
        this.listenerMap.set(type, listener);
        this.container.on(type, '[data-event-' + type + ']', listener);
        return listener;
    },
    /**
     * on
     * @param {String} type
     * @param {String} name
     * @param {Function} handle
     */
    on: function (type, name, handle) {
        var listener = this._getListener(type);
        listener.handleMap.set(name, handle);
        return this;
    },
    /**
     * off
     * @param {String} type
     * @param {String} name
     */
    off: function (type, name) {
        var listener = this._getListener(type),
            handleMap = listener.handleMap;
        handleMap.remove(name);
        if (!handleMap.count()) {
            this.container.off(type, '[data-event-' + type + ']', listener);
            this.listenerMap.remove(type);
        }
    }
};

module.exports = Delegator;
