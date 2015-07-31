webpackJsonp([5],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var log  =__webpack_require__(13);

	log.init();

/***/ },

/***/ 13:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {var Dialog = __webpack_require__(101);
	var Delegator = __webpack_require__(98);

	var logTable = __webpack_require__(105);
	var keyword = __webpack_require__(106);
	var debar = __webpack_require__(107);


	    var logConfig = {
	            id: 0,
	            startDate: 0,
	            endDate: 0,
	            include: [],
	            exclude: [],
	            index: 0,
	            level:[4]
	        },

	        encodeHtml = function (str) {
	            return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
	        };


	    var websocket ;




	    var currentSelectId = -1, currentIndex = 0  , noData = false , MAX_LIMIT = 500 , loading = false, monitorTimeId;

	    function addKeyword() {
	        var value = $.trim($('#keyword-ipt').val());
	        if (value !== '') {
	            if (!removeValue(value, logConfig.include)) {
	                $('#keyword-group').append(keyword( { it : { value: value } , opt: { encodeHtml: encodeHtml, set: Delegator.set }}));
	            }
	            logConfig.include.push(value);
	            $('#keyword-ipt').val('');
	        }
	    }

	    function addDebar() {
	        var value = $.trim($('#debar-ipt').val());
	        if (value !== '') {
	            if (!removeValue(value, logConfig.exclude)) {
	                $('#debar-group').append(debar( { it : { value: value } , opt: { encodeHtml: encodeHtml, set: Delegator.set }}));
	            }
	            logConfig.exclude.push(value);
	            $('#debar-ipt').val('');
	        }
	    }



	    function bindEvent() {
	        new Delegator(document.body)
	            .on('click', 'searchBusiness', function () {
	                // search business
	            }).on('click', 'addKeyword', addKeyword)
	            .on('keyup', 'addKeyword', function (e) {
	                if (e.which === 13) addKeyword();
	            }).on('click', 'removeKeywords', function () {
	                logConfig.include.length = 0;
	                $('#keyword-group').empty();
	            }).on('click', 'removeKeyword', function (e, value) {
	                $(this).closest('.keyword-tag').remove();
	                removeValue(value, logConfig.include);
	            }).on('click', 'addDebar', addDebar)
	            .on('keyup', 'addDebar', function (e) {
	                if (e.which === 13) addDebar();
	            }).on('click', 'removeDebars', function () {
	                logConfig.exclude.length = 0;
	                $('#debar-group').empty();
	            }).on('click', 'removeDebar', function (e, value) {
	                $(this).closest('.keyword-tag').remove();
	                removeValue(value, logConfig.exclude);
	            }).on('click', 'showLogs', function () {
	                if(logConfig.id <= 0 || loading){
	                    !loading && Dialog({
	                        header: '警告',
	                        body:'请选择一个项目'
	                    });
	                    return ;
	                }

	                if(!$(this).data("stop")){
	                    $(this).data("stop" ,true);
	                    $('#log-table').html('');
	                    startMonitor(logConfig.id);
	                    $(this).text('停止监听');
	                }else {
	                    $(this).data("stop" ,false);
	                    websocket.close();
	                    $(this).text('开始监听')
	                }

	            })
	            .on('click', 'showSource', function (e, data) {
	                // 内网服务器，拉取不到 外网数据,所以屏蔽掉请求
	                return ;

	            }).on('change' ,'selectBusiness' , function (){
	                var val = $(this).val()-0;
	                currentSelectId = val;
	                $('#log-table').html('');
	                currentIndex = 0;
	                noData = false;
	                logConfig.id = val;

	            }).on('click', 'errorTypeClick', function () {
	                if($(this).hasClass('msg-dis')){
	                    logConfig.level.push(4);
	                    $(this).removeClass('msg-dis');
	                }else{
	                    logConfig.level.splice($.inArray(4,logConfig.level),1);
	                    $(this).addClass('msg-dis');
	                }
	                console.log('log', logConfig.level);

	            }).on('click', 'logTypeClick', function(){
	                if($(this).hasClass('msg-dis')){
	                    logConfig.level.push(2);
	                    $(this).removeClass('msg-dis');
	                }else{
	                    logConfig.level.splice($.inArray(2,logConfig.level),1);
	                    $(this).addClass('msg-dis');
	                }


	            }).on('click', 'debugTypeClick', function () {
	                if($(this).hasClass('msg-dis')){
	                    logConfig.level.push(1);
	                    $(this).removeClass('msg-dis');
	                }else{
	                    logConfig.level.splice($.inArray(1,logConfig.level),1);
	                    $(this).addClass('msg-dis');
	                }
	            });



	    }

	    function removeValue(value, arr) {
	        for (var l = arr.length; l--;) {
	            if (arr[l] === value) {
	                return arr.splice(l, 1);
	            }
	        }
	    }


	    var keepAliveTimeoutId ;
	    var currentIndex;
	    var maxShow = 100;
	    var startMonitor = function (id){

	        websocket = new WebSocket("ws://"+location.host+"/ws/realtimeLog");


	        currentIndex = 0;
	        websocket.onmessage = function (evt){
	            showLogs(JSON.parse(evt.data).message);
	        }

	        websocket.onclose = function (){
	            clearTimeout(keepAliveTimeoutId);
	        }

	        websocket.onopen = function (){

	            websocket.send(JSON.stringify({type:"INIT" , include : logConfig.include , exclude: logConfig.exclude , level:logConfig.level , id:id}));

	            keepAliveTimeoutId = setInterval(function (){
	                websocket.send(JSON.stringify({type:"KEEPALIVE"}));
	            },5000);
	        }
	    }


	    function showLogs(data){

	            var param = {
	                encodeHtml: encodeHtml,
	                set: Delegator.set,
	                startIndex : currentIndex
	            }

	            var $table = $('#log-table');

	            if(maxShow%100 == 0){
	                $table.html($table.html().split("</tr>").slice(0,maxShow).join("</tr>"));
	            }
	            $table.prepend(logTable({ it : [data], opt : param}));
	            currentIndex ++;
	    }




	    function init() {
	        bindEvent();
	    }


	exports.init = init;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },

/***/ 98:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },

/***/ 101:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {var Delegator = __webpack_require__(98);
	var modal = __webpack_require__(112);

	    var container;

	    function hide() {
	        container.removeClass('in');
	        container.find('.modal-backdrop').removeClass('in');
	        setTimeout(function () {
	            container.remove();
	            container = undefined;
	        }, 300);
	    }

	    function Dialog (param) {
	        if (container) {
	            container.remove();
	            container = undefined;
	        }
	        container = $(modal({it :param}))
	            .appendTo(document.body)
	            .show();

	        var key,
	            action,
	            delegator,
	            on = param.on || {};

	        delegator = (new Delegator(container))
	            .on('click', 'close', hide);

	        for (key in on) {
	            action = key.split('/');
	            delegator.on(action[0], action[1], on[key]);
	        }

	        setTimeout(function () {
	            container.addClass('in');
	            container.find('.modal-backdrop').addClass('in');
	        }, 0);
	    }

	    Dialog.hide = hide;

	module.exports =  Dialog;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)))

/***/ },

/***/ 105:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(_) {module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '', __j = Array.prototype.join;
	function print() { __p += __j.call(arguments, '') }
	with (obj) {


	var urls;
	for (var i = 0 , l = it.length, type; i < l; i++) {
	switch(it[i].level) {
	    case '8':
	        type = 'warning';
	        break;
	    case '4':
	        type = 'err';
	        break;
	    case '2':
	        type = 'info';
	        break;
	    case '1':
	        type = 'debug';
	        break;
	}

	 function getBrowserType(ua){
	        if(!ua){
	            return '';
	        }
	        ua = ua.toLowerCase();

	        if(ua.indexOf('qqbrowser')>-1){
	            return  'ico-qb';
	        }else if(ua.indexOf('qq/')>-1){
	            return  'ico-qq';
	        }else if(ua.indexOf('micromessenger')>-1){
	            return  'ico-wx';
	        }else if(ua.indexOf('chrome')>-1){
	            return  'ico-chrome';
	        }else if(ua.indexOf('msie')>-1 || ua.indexOf('trident')>-1 ){
	            return 'ico-ie';
	        }else if(ua.indexOf('firefox')>-1){
	            return 'ico-ff';
	        }else if(ua.indexOf('safari')>-1){
	            return 'ico-safari';
	        }else if(ua.indexOf('android')>-1){
	            return  'ico-android';
	        }else if(ua.indexOf('iphone')>-1){
	            return  'ico-ios';
	        }
	}

	var isHtml = /^.+?\.html\??/.test(it[i].target);
	;
	__p += '\r\n<tr id="tr-' +
	((__t = (i + 1 + opt.startIndex)) == null ? '' : __t) +
	'">\r\n    <td  class="td-1 info-type-' +
	((__t = (type)) == null ? '' : __t) +
	'">' +
	((__t = (i + 1 + opt.startIndex)) == null ? '' : __t) +
	'</td>\r\n    <td  class="td-2">' +
	((__t = ( _.formatDate(new Date(it[i].date) , 'YYYY-MM-DD hh:mm:ss') )) == null ? '' : __t) +
	'</td>\r\n    <td  style="" class="td-3">' +
	((__t = ( opt.encodeHtml(it[i].msg) )) == null ? '' : __t) +
	'</td>\r\n    <td  class="td-4">' +
	((__t = (  opt.encodeHtml(it[i].uin == 'NaN' ? '-' : it[i].uin ))) == null ? '' : __t) +
	'</td>\r\n    <td  class="td-5">' +
	((__t = (it[i].ip )) == null ? '' : __t) +
	'</td>\r\n    <td  class="td-6"><span class="ico-browser ' +
	((__t = ( getBrowserType(it[i].userAgent))) == null ? '' : __t) +
	'" title="' +
	((__t = (it[i].userAgent)) == null ? '' : __t) +
	'"></span></td>\r\n    <td class="td-7">\r\n  ';
	if(false){;
	__p += '\r\n        <a style="word-break:break-all;display: block" >\r\n  ';
	}else {;
	__p += '\r\n        <a style="word-break:break-all;display: block" href="javascript:;" data-event-click="showSource" data-event-data="' +
	((__t = (opt.set(it[i]))) == null ? '' : __t) +
	'">\r\n  ';
	};
	__p += '\r\n\r\n        ' +
	((__t = ( opt.encodeHtml(it[i].target || it[i].url || ''))) == null ? '' : __t) +
	'</a>\r\n        <span class="err-where">' +
	((__t = (opt.encodeHtml(it[i].rowNum || 0) )) == null ? '' : __t) +
	'行' +
	((__t = (opt.encodeHtml(it[i].colNum || 0))) == null ? '' : __t) +
	'列</span>\r\n        <a style="font-size:12px;" href="' +
	((__t = ( opt.encodeHtml((it[i].from)) )) == null ? '' : __t) +
	'" target="_blank">页面查看</a>\r\n    </td>\r\n</tr>\r\n';
	 } ;
	__p += '\r\n\r\n';
	 if(it.length == 0 ){;
	__p += '\r\n<td colspan="7" style="\r\n    text-align: center;\r\n    background: rgb(221, 221, 221);\r\n">无更多数据</td>\r\n';
	};


	}
	return __p
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(7)))

/***/ },

/***/ 106:
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '';
	with (obj) {
	__p += '<a class="keyword-tag">' +
	((__t = (it.value)) == null ? '' : __t) +
	'<span class="keyword-del" data-event-click="removeKeyword" data-event-data="' +
	((__t = (opt.set(it.value))) == null ? '' : __t) +
	'">x</span></a>';

	}
	return __p
	}

/***/ },

/***/ 107:
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '';
	with (obj) {
	__p += '<a class="keyword-tag">' +
	((__t = (it.value)) == null ? '' : __t) +
	'<span class="keyword-del" data-event-click="removeDebar" data-event-data="' +
	((__t = (opt.set(it.value))) == null ? '' : __t) +
	'">x</span></a>';

	}
	return __p
	}

/***/ },

/***/ 112:
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '';
	with (obj) {
	__p += '<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" id="' +
	((__t = (it.id || '' )) == null ? '' : __t) +
	'">\r\n  <div class="modal-backdrop fade"></div>\r\n  <div class="modal-dialog">\r\n    <div class="modal-content">\r\n\r\n      <div class="modal-header">\r\n        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true" data-event-click="close">×</span><span class="sr-only">Close</span></button>\r\n        <h4 class="modal-title">' +
	((__t = (it.header)) == null ? '' : __t) +
	'</h4>\r\n      </div>\r\n      <div class="modal-body">\r\n        ' +
	((__t = (it.body)) == null ? '' : __t) +
	'\r\n      </div>\r\n      <div class="modal-footer">\r\n        <button type="button" class="btn btn-default" data-event-click="close">Close</button>\r\n      </div>\r\n\r\n    </div>\r\n  </div>\r\n</div>';

	}
	return __p
	}

/***/ }

});