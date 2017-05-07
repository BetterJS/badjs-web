webpackJsonp([6],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var usermanger = __webpack_require__(19);

	usermanger.init();

/***/ },

/***/ 19:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * @info 用户列表js
	 * @author coverguo
	 * */

	var Dialog = __webpack_require__(140);
	var userTable = __webpack_require__(151);


	    var encodeHtml = function (str) {
	        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
	    };
	    function bindEvent() {

	        $(".searchBtn").on("click", function (){
	            reloadPage();
	        });

	        $("#add-btn").on("click", function () {
	            var params ={
	                userName : $(".add-userName").val(),
	                applyId  : $(".search-applyId").val()
	            };
	            console.log(params);
	            $ajax("/controller/userApplyAction/addUserApply.do", params, function(data){
	                reloadPage();
	            });
	        });

	        var submiting =  false;
	        $("#userList").on("click",'.user-deleteBtn', function (){
	            if(submiting){
	                return;
	            }
	            submiting = true;
	            var params = {
	                id : $(this).data().uaid
	            };
	            if(window.confirm('你确定要删除该用户吗？')){
	                $ajax("/controller/userApplyAction/remove.do", params, function(data){
	                    location.reload();
	                });
	            }else{
	                return false;
	            }

	        });


	        $("#userList").on("click",'.user-authBtn', function (){
	            if(submiting){
	                return;
	            }
	            submiting = true;
	            var params = {
	                id : $(this).data().uaid
	            };
	            $ajax("/controller/userApplyAction/auth.do", params, function(data){
	                location.reload();
	            });

	        });
	    };

	    function reloadPage(){
	        var params ={
	            userText : $(".search-userText").val(),
	            applyId  : $(".search-applyId").val(),
	            role : $(".search-userType").val()
	        };
	        var url = "/user/userManage.html";
	        url += "?applyId=" + params.applyId + "&role=" + params.role + "&userText=" + params.userText;
	        location.href = url;
	    }
	    function $ajax(url, params, cb,type){
	        $.ajax({
	            url: url,
	            data:params,
	            type: type?type:'post',
	            success: function(data) {
	                var ret = data.ret;
	                switch(ret){
	                    case 0://成功
	                        //执行成功回调函数.
	                        cb(data);

	                        break;
	                    default ://没有登陆态或登陆态失效
	                        alert(data.msg);
	                }
	            },
	            error: function() {
	            }
	        });
	    }
	    $.extend({
	        getUrlVars: function(){
	            var vars = [], hash;
	            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	            for(var i = 0; i < hashes.length; i++)
	            {
	                hash = hashes[i].split('=');
	                vars.push(hash[0]);
	                vars[hash[0]] = hash[1];
	            }
	            return vars;
	        },
	        getUrlVar: function(name){
	            return $.getUrlVars()[name];
	        }
	    });

	    function init() {
	        var urlParams = $.getUrlVars();
	        var params ={
	            userText :urlParams.userText || '' ,
	            applyId  : urlParams.applyId || -1 ,
	            role : urlParams.role || -1
	        };
	        $ajax("controller/userAction/queryListByCondition.do",params,function(items){
	            console.log(items);
	            var param = {
	                encodeHtml: encodeHtml,
	                isAdmin : items.isAdmin
	            };
	            $('#userList').html(userTable({it : items.data, opt : param}));

	        });
	        //设置初始搜索框内容
	        $(".search-userText").val(params.userText);
	        $(".search-applyId").val(params.applyId);
	        $(".search-userType").val(params.role);

	        //设置info
	        if(params.applyId ==-1){
	            $(".add-userName").attr("disabled","disabled");
	            $("#add-btn").attr("disabled","disabled");
	        }else{
	            $(".add-userName").removeAttr("disabled");
	            $("#add-btn").removeAttr("disabled");
	        }
	        $(".projectName").text( $(".search-applyId").find("option:selected").text());
	        bindEvent();


	    }

	module.exports = {
	        init: init
	    }

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

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

/***/ 151:
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '', __j = Array.prototype.join;
	function print() { __p += __j.call(arguments, '') }
	with (obj) {

	 for(var i =0, len = it.length;i<len; i++){
	    var role ="参与者";
	    if(it[i].role == 1){
	        role ="项目管理员";
	    }
	;
	__p += '\r\n<tr class="listRow">\r\n    <td>' +
	((__t = ( i+1)) == null ? '' : __t) +
	'</td>\r\n    <td>' +
	((__t = ( it[i].loginName)) == null ? '' : __t) +
	'</td>\r\n    <td>' +
	((__t = ( it[i].chineseName?it[i].chineseName:"无")) == null ? '' : __t) +
	'</td>\r\n    <td>' +
	((__t = ( it[i].name)) == null ? '' : __t) +
	'</td>\r\n    <td>' +
	((__t = ( role)) == null ? '' : __t) +
	' </td>\r\n    <td>\r\n        ';
	if(it[i].role != 1 ){;
	__p += '\r\n            <button class="user-authBtn btn-default modifyBtn" data-uaid = "' +
	((__t = ( it[i].id)) == null ? '' : __t) +
	'">授权管理员</button>\r\n            <button class="user-deleteBtn btn-default modifyBtn" data-uaid = "' +
	((__t = ( it[i].id)) == null ? '' : __t) +
	'">删除</button>\r\n        ';
	};
	__p += '\r\n\r\n        ';
	if(it[i].role ==1 && opt.isAdmin){;
	__p += '\r\n        <button class="user-deleteBtn btn-default modifyBtn" data-uaid = "' +
	((__t = ( it[i].id)) == null ? '' : __t) +
	'">删除</button>\r\n        ';
	};
	__p += '\r\n\r\n    </td>\r\n</tr>\r\n';
	};
	__p += '\r\n';

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