webpackJsonp([9],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var log = __webpack_require__(15);
	log.init();

	var source_trigger = __webpack_require__(14);
	source_trigger.init();

	//var last_select = require("../common/last.select");
	//last_select.init();


/***/ },

/***/ 14:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {exports.init = function() {
		var not_show_source_page = false;
		var hideform_class_name = 'main-table-hidefrom';

		try {
			not_show_source_page = !!localStorage.not_show_source_page;
			$('.main-table')[not_show_source_page ? 'addClass' : 'removeClass'](hideform_class_name);
		} catch (ex) {}

		var update_source = function(show_source_page) {
			if (show_source_page) {
				$('.main-table').removeClass(hideform_class_name);
				$('#log-table .source_page_link').each(function() {
					var $this = $(this);
					$this.text($this.data('viewlink'));
				});
			} else {
				$('.main-table').addClass(hideform_class_name);
				$('#log-table .source_page_link').each(function() {
					var $this = $(this);
					$this.text($this.data('viewtext'));
				});
			}
		};

		var $ssp = $('#show_source_page');
		$ssp.prop('checked', !not_show_source_page).on('change', function() {
			try {
				var show_source_page = $ssp.prop('checked');
				localStorage.not_show_source_page = show_source_page ? '' : '1';
				update_source(show_source_page);
			} catch (ex) {}
		});
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },

/***/ 15:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($, _) {var dialog = __webpack_require__(140);
	var Delegator = __webpack_require__(21);

	var logTable = __webpack_require__(146);
	var keyword = __webpack_require__(147);
	var debar = __webpack_require__(148);
	var offlineDialog = __webpack_require__(24);
	var logDetailDialog = __webpack_require__(22);

	var offlineLogCache = {};


	var logConfig = {
	        id: 0,
	        startDate: 0,
	        endDate: 0,
	        include: [],
	        exclude: [],
	        index: 0,
	        level: [1, 2, 4 , 20]
	    },

	    encodeHtml = function(str) {
	        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
	    },

	    formatMsg = function (str){
	        return str.replace(/@/gi , '<br/><b style="color:#A78830;">@</b> ')
	    };


	var currentSelectId = -1,
	    currentIndex = 0,
	    noData = false,
	    MAX_LIMIT = 500,
	    loading = false,
	    monitorTimeId;

	function addKeyword() {
	    var value = $.trim($('#keyword-ipt').val());
	    if (value !== '') {
	        if (!removeValue(value, logConfig.include)) {
	            $('#keyword-group').append(keyword({
	                it: {
	                    value: value
	                },
	                opt: {
	                    encodeHtml: encodeHtml,
	                    set: Delegator.set
	                }
	            }));
	        }
	        logConfig.include.push(value);
	        $('#keyword-ipt').val('');
	    }
	}

	function addDebar() {
	    var value = $.trim($('#debar-ipt').val());
	    if (value !== '') {
	        if (!removeValue(value, logConfig.exclude)) {
	            $('#debar-group').append(debar({
	                it: {
	                    value: value
	                },
	                opt: {
	                    encodeHtml: encodeHtml,
	                    set: Delegator.set
	                }
	            }));
	        }
	        logConfig.exclude.push(value);
	        $('#debar-ipt').val('');
	    }
	}



	function bindEvent() {
	    new Delegator(document.body)
	        .on('click', 'searchBusiness', function() {
	            // search business
	        }).on('click', 'addKeyword', addKeyword)
	        .on('keyup', 'addKeyword', function(e) {
	            if (e.which === 13) addKeyword();
	        }).on('click', 'removeKeywords', function() {
	            logConfig.include.length = 0;
	            $('#keyword-group').empty();
	        }).on('click', 'removeKeyword', function(e, value) {
	            $(this).closest('.keyword-tag').remove();
	            removeValue(value, logConfig.include);
	        }).on('click', 'addDebar', addDebar)
	        .on('keyup', 'addDebar', function(e) {
	            if (e.which === 13) addDebar();
	        }).on('click', 'removeDebars', function() {
	            logConfig.exclude.length = 0;
	            $('#debar-group').empty();
	        }).on('click', 'removeDebar', function(e, value) {
	            $(this).closest('.keyword-tag').remove();
	            removeValue(value, logConfig.exclude);
	        }).on('click', 'configOfflineMonitor', function(e, value) {

	            if ( logConfig.id <= 0 ) {
	                !loading && dialog({
	                    header: '警告',
	                    body: '请选择一个项目'
	                });
	                return;
	            }

	            offlineDialog(logConfig)


	        }).on('click', 'showLogs', function() {
	            var fileId = logConfig.fileId = $('#select-offline-logs').val(); // jshint ignore:line

	            if(loading){
	                return ;
	            }

	            if (logConfig.fileId <= 0 || logConfig.id <= 0 ) {
	                !loading && dialog({
	                    header: '警告',
	                    body: '请选择一个离线日志'
	                });
	                return;
	            }


	            loading = true;
	            $(".setting-search").text("正在加载...")

	            if(offlineLogCache[fileId]){
	                showLogs(offlineLogCache[fileId] , logConfig)
	                $(".setting-search").text("查询日志");
	                loading = false;
	                return ;
	            }

	            var url = '/controller/logAction/showOfflineLog.do';
	            $.ajax({
	                url: url,
	                data: {
	                    id: logConfig.id,
	                    fileId: fileId,
	                },
	                success : function (data){
	                    loading = false;

	                    $(".setting-search").text("查询日志")
	                    var offlineLogs = JSON.parse(data.data);
	                    var newLogs = []
	                    offlineLogs.logs.forEach(function (item){
	                        var  date = new Date(item.time);
	                        item.userAgent = offlineLogs.userAgent;
	                        item.date = _.formatDate(date , 'YYYY-MM-DD hh:mm:ss');
	                        var all = "";
	                        for(var key in item ) {
	                            if(key == 'time'){
	                                continue
	                            }
	                            all += ';'+key+'=' + item[key];
	                        }
	                        item.date = date;
	                        item.all = all;
	                        newLogs.push(item)
	                    })

	                    offlineLogCache[fileId] = newLogs

	                    showLogs(offlineLogCache[fileId] , logConfig)
	                },
	                error : function (){

	                }
	            })




	        })
	        .on('click', 'alertModal', function(e, data) {
	            var $target=$(e.currentTarget);

	            logDetailDialog({
	                id :$target.text(),
	                time :$target.siblings('.td-2').text(),
	                info :$target.siblings('.td-3').html(),
	                uin :$target.siblings('.td-4').text(),
	                ip :$target.siblings('.td-5').text(),
	                agent : $target.siblings('.td-6').attr("title"),
	                source :   $target.siblings('.td-7').html() ,
	            })
	        }).on('change', 'selectBusiness', function() {
	            var val = $(this).val() - 0;
	            currentSelectId = val;
	            $('#log-table').html('');
	            currentIndex = 0;
	            noData = false;
	            logConfig.id = val;
	            fetchOfflineFile(val)
	        }).on('click', 'showTd', function(e) {
	            var $target=$(e.currentTarget).toggleClass('active');
	            $('.main-table .'+$target.data('td')).toggleClass('active');
	            //保存用户偏好，隐藏为true
	            //console.log($target.data('td'));
	            localStorage.setItem($target.data('td'),!$target.hasClass('active'));
	            //console.log(localStorage);
	            window.classes[$target.data('td')]=$target.hasClass('active')?'active':'';
	        }).on('click', 'errorTypeClick', function() {
	            if ($(this).hasClass('msg-dis')) {
	                logConfig.level.push(4);
	                $(this).removeClass('msg-dis');
	            } else {
	                logConfig.level.splice($.inArray(4, logConfig.level), 1);
	                $(this).addClass('msg-dis');
	            }
	            console.log('log', logConfig.level);

	        }).on('click', 'logTypeClick', function() {
	            if ($(this).hasClass('msg-dis')) {
	                logConfig.level.push(2);
	                $(this).removeClass('msg-dis');
	            } else {
	                logConfig.level.splice($.inArray(2, logConfig.level), 1);
	                $(this).addClass('msg-dis');
	            }


	        }).on('click', 'debugTypeClick', function() {
	            if ($(this).hasClass('msg-dis')) {
	                logConfig.level.push(1);
	                $(this).removeClass('msg-dis');
	            } else {
	                logConfig.level.splice($.inArray(1, logConfig.level), 1);
	                $(this).addClass('msg-dis');
	            }
	        }).on('click', 'offlineTypeClick', function() {
	            if ($(this).hasClass('msg-dis')) {
	                logConfig.level.push(20);
	                $(this).removeClass('msg-dis');
	            } else {
	                logConfig.level.splice($.inArray(20, logConfig.level), 1);
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



	function fetchOfflineFile (id){
	    if(id == -1 || !id){
	        $("#select-offline-logs").attr("disabled").html('<option value="-1">-- 选择离线日志 --</option>')
	        return;
	    }
	    var url = '/controller/logAction/showOfflineFiles.do';
	    $.ajax({
	        url: url,
	        data: {
	            id: id,
	        },
	        success : function (data){
	            if(data.data.length <= 0){
	                $("#select-offline-logs").attr("disabled" , "disabled").html('<option value="-1">-- 无离线日志 --</option>')
	            }else {
	                $("#select-offline-logs").removeAttr("disabled").html("")
	                $.each(data.data, function (key , item){
	                    var arr = item.id.split("_");
	                    var itemName = arr[0];
	                    if(arr[2]  ){
	                        var dateStr = _.formatDate(new Date(arr[2]-0) , 'YYYY-MM-DD');
	                        itemName += " (" + dateStr +")";
	                    }


	                    $("#select-offline-logs").append('<option value="'+item.id +'">'+itemName+'</option>')
	                })
	            }
	        },
	        error : function (){

	        }
	    })
	}

	function showLogs(data , opt) {



	    var includeJSON = [];
	    opt.include.forEach(function(value, key) {
	        includeJSON.push(value);
	    });


	    var excludeJSON = [];
	    opt.exclude.forEach(function(value, key) {
	        excludeJSON.push(value);
	    });


	    var newData = [];
	    data.forEach(function (value){
	        var matched = false;

	        if($.inArray( value.level , opt.level ) == -1){
	            return ;
	        }
	        if(includeJSON.length || excludeJSON.length){
	            for(var i = 0 ; i < includeJSON.length ; i++){
	                if(value.all.indexOf(includeJSON[i]) > -1){
	                    matched = true;
	                }
	            }

	            for(var i = 0 ; i < excludeJSON.length ; i++){
	                if(value.all.indexOf(excludeJSON[i]) > -1){
	                   matched = false;
	                }else {
	                    matched = true;
	                }
	            }
	        }else  {
	            matched = true;
	        }

	        if(matched){
	            newData.push(value)
	        }


	    });

	    var param = {
	        encodeHtml: encodeHtml,
	        set: Delegator.set,
	        startIndex: 1,
	        formatMsg : formatMsg
	    };

	    $('#log-table').html(logTable({
	        it: newData,
	        opt: param,
	        classes: {
	            'td-1':'active',
	            'td-2':'active',
	            'td-3':'active',
	            'td-6':'active',
	            'td-7':'active',
	        }
	    }));
	}

	function init() {
	    bindEvent();
	    //读取用户偏好

	    $('.main-table .td-4').removeClass('active');
	    $('.main-table .td-5').removeClass('active');


	    $('#content .mid-side .main-table thead tr').show();
	    $('#content .right-side .setting-show').show();
	}

	exports.init = init;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5), __webpack_require__(4)))

/***/ },

/***/ 21:
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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },

/***/ 22:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {var Delegator = __webpack_require__(21);
	var dialogTpl = __webpack_require__(152);

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
	        container = $(dialogTpl(param))
	            .appendTo(document.body)
	            .show();

	        var key,
	            action,
	            delegator,
	            on =  {};

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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },

/***/ 24:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($, _) {var Delegator = __webpack_require__(21);
	var offline_monitor_row = __webpack_require__(153);
	var dialogTpl = __webpack_require__(154);

	    var container;

	    function hide() {
	        container.removeClass('in');
	        container.find('.modal-backdrop').removeClass('in');
	        setTimeout(function () {
	            container.remove();
	            container = undefined;
	        }, 300);
	    }

	    function showOfflineLogConfig(logConfig){
	        $.ajax({
	            url: "/controller/logAction/getOfflineLogConfig.do",
	            data: {
	                id: logConfig.id,
	            },
	            success : function (data){
	                $("#offlineConfigModal table").html("")
	                _.each(data.data , function (value ,key){
	                    $("#offlineConfigModal table").append(offline_monitor_row({uin : key}))
	                })
	            },
	            error : function (){

	            }
	        })
	    }

	    function Dialog (param) {
	        if (container) {
	            container.remove();
	            container = undefined;
	        }
	        container = $(dialogTpl())
	            .appendTo(document.body)
	            .show();

	        var key,
	            action,
	            delegator,
	            on =  {};

	        delegator = (new Delegator(container))
	            .on('click', 'close', hide)
	            .on('click', 'addUin', function (){
	                var val = $("#addUin").val();

	                if(val.length <=0){
	                    return ;
	                }
	                $.ajax({
	                    url: "/controller/logAction/addOfflineLogConfig.do",
	                    data: {
	                        uin: val,
	                        id : param.id
	                    },
	                    success : function (data){
	                        if(!data.data.hadAdd && data.ret == 0){
	                            $("#offlineConfigModal table").append(offline_monitor_row({uin : val}))
	                        }

	                        $("#addUin").val("")
	                    },
	                    error : function (){

	                    }
	                })
	            })
	            .on('click', 'deleteUin', function (e){
	                var val = $(e.currentTarget).attr("uin");

	                if(val.length <=0){
	                    return ;
	                }
	                $.ajax({
	                    url: "/controller/logAction/deleteOfflineLogConfig.do",
	                    data: {
	                        uin: val,
	                        id : param.id
	                    },
	                    success : function (){
	                        $(e.currentTarget).parents("tr").remove();
	                    },
	                    error : function (){

	                    }
	                })
	            });

	        for (key in on) {
	            action = key.split('/');
	            delegator.on(action[0], action[1], on[key]);
	        }

	        setTimeout(function () {
	            container.addClass('in');
	            container.find('.modal-backdrop').addClass('in');

	            showOfflineLogConfig(param);
	        }, 0);
	    }

	    Dialog.hide = hide;

	module.exports =  Dialog;

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5), __webpack_require__(4)))

/***/ },

/***/ 140:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {var Delegator = __webpack_require__(21);
	var modal = __webpack_require__(155);

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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },

/***/ 146:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(_) {module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '', __j = Array.prototype.join;
	function print() { __p += __j.call(arguments, '') }
	with (obj) {


	var urls;
	var not_show_source_page = true;
	try {
	    not_show_source_page = !!localStorage.not_show_source_page;
	} catch (ex) {}

	// 手Q
	var RE_MQQ = /(ipad|iphone|ipod).*? (ipad)?qq\/([\d.]+)|\bv1_and_sqi?_([\d.]+)(.*? qq\/([\d.]+))?/;

	function getBrowserType(ua) {
	    if (!ua) {
	        return '';
	    }
	    ua = ua.toLowerCase();

	    var osIcon = '', browserIcon = '';

	    // os
	    if (ua.indexOf('android') > -1)
	        osIcon = 'ico-android';
	    else if (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1)
	        osIcon = 'ico-ios';
	    else if (ua.indexOf('windows') > -1)
	        osIcon = 'ico-windows';


	    // 手Q
	    if (RE_MQQ.test(ua)) {
	        browserIcon = 'ico-qq';
	    } else if (ua.indexOf('qqbrowser') > -1) {
	        browserIcon = 'ico-qb';
	    } else if (ua.indexOf('metasr') > -1) {
	        browserIcon = 'ico-sougou';
	    } else if (ua.indexOf('maxthon') > -1) {
	        browserIcon = 'ico-maxthon';
	    } else if (ua.indexOf('360se') > -1) {
	        browserIcon = 'ico-360';
	    } else if (ua.indexOf('qq/') > -1) {
	        browserIcon = 'ico-qq';
	    } else if (ua.indexOf('micromessenger') > -1) {
	        browserIcon = 'ico-wx';
	    } else if (ua.indexOf('edge') > -1) {
	        browserIcon = 'ico-edge';
	    } else if (ua.indexOf('chrome') > -1) {
	        browserIcon = 'ico-chrome';
	    } else if (ua.indexOf('msie') > -1 || ua.indexOf('trident') > -1) {
	        browserIcon = 'ico-ie';
	    } else if (ua.indexOf('firefox') > -1) {
	        browserIcon = 'ico-ff';
	    } else if (ua.indexOf('safari') > -1) {
	        browserIcon = 'ico-safari';
	    }

	    return [osIcon, browserIcon];
	}

	function sourcePage(data, type, opt) {
	    var from = data.from || ''
	    if (/view/.test(type)) {
	        var view = ['页面查看', opt.encodeHtml(from)];
	        return 'viewtext' === type ? view[0] :
	            'viewlink' === type ? view[1] :
	            not_show_source_page ? view[0] : view[1];
	    } else {
	        var href = opt.encodeHtml(from);
	        var msg = [data._target, data.rowNum, data.colNum].join(':') + ' ' + data.msg;
	        if (href.indexOf('#') === -1) {
	            href += '#BJ_ERROR=' + encodeURIComponent(msg);
	        } else {
	            href += '&BJ_ERROR=' + encodeURIComponent(msg);
	        }
	        return href;
	    }
	}

	for (var i = 0 , l = it.length, type = ''; i < l; i++) {
	    switch(it[i].level.toString()) {
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
	        case '20':
	            type = 'offline';
	            break;
	    }

	    if (_.isArray(it[i].target)) {
	        it[i].target = it[i].target[0];
	    }

	    var isHtml = /^.+?\.html\??/.test(it[i].target);
	    var _target = it[i]._target = (it[i].target || it[i].url || '').replace(/\)/g, '');
	;
	__p += '\r\n<tr id="tr-' +
	((__t = (i + 1 + opt.startIndex)) == null ? '' : __t) +
	'">\r\n    <td  class="td-1 active info-type-' +
	((__t = (type)) == null ? '' : __t) +
	'" data-event-click="alertModal" title="点击查看#' +
	((__t = (i + 1 + opt.startIndex)) == null ? '' : __t) +
	'详情">\r\n        ' +
	((__t = (i + 1 + opt.startIndex)) == null ? '' : __t) +
	'\r\n    </td>\r\n    <td  class="td-2 ' +
	((__t = (classes['td-2'] )) == null ? '' : __t) +
	'">\r\n        ' +
	((__t = ( _.formatDate(new Date(it[i].date) , 'YYYY-MM-DD hh:mm:ss') )) == null ? '' : __t) +
	'\r\n    </td>\r\n    <td  style="" class="td-3 ' +
	((__t = (classes['td-3'] )) == null ? '' : __t) +
	'">\r\n        ' +
	((__t = ( opt.formatMsg(opt.encodeHtml(it[i].msg)) )) == null ? '' : __t) +
	'\r\n    </td>\r\n    <td  class="td-4 ' +
	((__t = (classes['td-4'] )) == null ? '' : __t) +
	'" title="' +
	((__t = (  opt.encodeHtml(it[i].uin == 'NaN' ? '-' : it[i].uin ))) == null ? '' : __t) +
	'" style="text-overflow: ellipsis;overflow: hidden;" >\r\n        ' +
	((__t = (  opt.encodeHtml(it[i].uin == 'NaN' ? '-' : it[i].uin ))) == null ? '' : __t) +
	'\r\n    </td>\r\n    <td  class="td-5 ' +
	((__t = (classes['td-5'] )) == null ? '' : __t) +
	'">\r\n        ' +
	((__t = (it[i].ip )) == null ? '' : __t) +
	'\r\n    </td>\r\n    <td class="td-6 ' +
	((__t = ( classes['td-6'] )) == null ? '' : __t) +
	'" title="' +
	((__t = ( it[i].userAgent )) == null ? '' : __t) +
	'">\r\n            ';

	            var browserTypes = getBrowserType(it[i].userAgent);
	            for(var x = 0; x < browserTypes.length; x++) {
	             ;
	__p += '\r\n             <span class="ico-browser ' +
	((__t = ( browserTypes[x] )) == null ? '' : __t) +
	'"></span>\r\n             ';
	};
	__p += '\r\n     </td>\r\n    <td class="td-7 ' +
	((__t = (classes['td-7'] )) == null ? '' : __t) +
	'">\r\n        <a\r\n            style="word-break:break-all;display:block"\r\n            href="' +
	((__t = ( opt.encodeHtml(_target))) == null ? '' : __t) +
	'"\r\n            target="_blank"\r\n            data-event-click="showSource"\r\n            data-event-data="' +
	((__t = (opt.set(it[i]))) == null ? '' : __t) +
	'"\r\n        >\r\n            ' +
	((__t = (opt.encodeHtml(_target))) == null ? '' : __t) +
	'\r\n            <span\r\n                class="err-where"\r\n                style="height:24px;line-height:24px;border-radius:3px"\r\n            >\r\n                ' +
	((__t = (opt.encodeHtml(it[i].rowNum || 0))) == null ? '' : __t) +
	'行\r\n                ' +
	((__t = (opt.encodeHtml(it[i].colNum || 0))) == null ? '' : __t) +
	'列\r\n            </span>\r\n        </a>\r\n        <a\r\n            class="source_page_link"\r\n            style="font-size:12px"\r\n            target="_blank"\r\n            href="' +
	((__t = (sourcePage(it[i], 'href', opt))) == null ? '' : __t) +
	'"\r\n            data-viewtext="' +
	((__t = (sourcePage(it[i], 'viewtext', opt))) == null ? '' : __t) +
	'"\r\n            data-viewlink="' +
	((__t = (sourcePage(it[i], 'viewlink', opt))) == null ? '' : __t) +
	'"\r\n        >' +
	((__t = (sourcePage(it[i], 'view', opt))) == null ? '' : __t) +
	'</a>\r\n    </td>\r\n</tr>\r\n';
	 } ;
	__p += '\r\n\r\n';
	 if(it.length === 0 ){;
	__p += '\r\n<td colspan="7" style="\r\n    text-align: center;\r\n    background: rgb(221, 221, 221);\r\n">无更多数据</td>\r\n';
	};
	__p += '\r\n';

	}
	return __p
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },

/***/ 147:
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

/***/ 148:
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

/***/ 152:
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '';
	with (obj) {
	__p += '\n\n<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" id="logDetailModal">\n    <div class="modal-backdrop fade"></div>\n    <div class="modal-dialog">\n        <div class="modal-content">\n\n            <div class="modal-header">\n                <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true" data-event-click="close">×</span><span class="sr-only">Close</span></button>\n                <h4 class="modal-title">日志详情</h4>\n            </div>\n            <div class="modal-body">\n                <p>\n                    <b>Time：</b><span class="time">' +
	((__t = (time)) == null ? '' : __t) +
	'</span>\n                </p>\n                <p>\n                    <b>Info：</b><div class="info">' +
	((__t = (info)) == null ? '' : __t) +
	'</div>\n                </p>\n                <p>\n                    <b>uin：</b><span class="uin">' +
	((__t = (uin)) == null ? '' : __t) +
	'</span>\n                </p>\n                <p>\n                    <b>ip：</b><span class="ip">' +
	((__t = (ip)) == null ? '' : __t) +
	'</span>\n                </p>\n                <p>\n                    <b>agent：</b><div class="userAgent">' +
	((__t = (agent)) == null ? '' : __t) +
	'</div>\n                </p>\n                <p>\n                    <b>Source：</b><div class="source">' +
	((__t = (source)) == null ? '' : __t) +
	'</div>\n                </p>\n            </div>\n            <div class="modal-footer">\n                <button type="button" class="btn btn-default" data-event-click="close">Close</button>\n            </div>\n\n        </div>\n    </div>\n</div>\n';

	}
	return __p
	}

/***/ },

/***/ 153:
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '';
	with (obj) {
	__p += '<tr>\n    <td style="width:70%">' +
	((__t = (uin)) == null ? '' : __t) +
	'</td>\n    <td>监听中</td>\n    <td><a uin="' +
	((__t = (uin)) == null ? '' : __t) +
	'" data-event-click="deleteUin" href="javascript:;">删除</a></td>\n</tr>\n';

	}
	return __p
	}

/***/ },

/***/ 154:
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '';
	with (obj) {
	__p += '<div class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" id="offlineConfigModal">\n    <div class="modal-backdrop fade"></div>\n    <div class="modal-dialog">\n        <div class="modal-content">\n\n            <div class="modal-header">\n                <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true" data-event-click="close">×</span><span class="sr-only">Close</span></button>\n                <h4 class="modal-title">设置离线日志自动拉取</h4>\n            </div>\n            <div class="modal-body">\n                <div class="form-group" style="text-align: center;">\n                    <input style="display: inline-block;width: 300px;" type="text" class="form-control" id="addUin" placeholder="添加监听的UIN">\n                    <button type="submit" class="btn btn-default" data-event-click="addUin">添加</button>\n                </div>\n                <div class="uin-list">\n                    <table class="table table-striped">\n                    </table>\n                </div>\n            </div>\n            <div class="modal-footer">\n                <button type="button" class="btn btn-default" data-event-click="close">Close</button>\n            </div>\n\n        </div>\n    </div>\n</div>\n';

	}
	return __p
	}

/***/ },

/***/ 155:
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