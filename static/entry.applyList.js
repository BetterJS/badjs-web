webpackJsonp([11],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var applyList = __webpack_require__(8);

	applyList.init();

/***/ },

/***/ 8:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * @info 申请列表js
	 * @author coverguo
	 * */


	var Dialog = __webpack_require__(140);
	var applyTable = __webpack_require__(144);


	    var maxDate = 60*60*1000*24 *2;
	    var   encodeHtml = function (str) {
	        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
	    };
	    //选择的状态
	    var tempStatus,
	        oldClass;


	    function doApprove(params , cb){
	        $.post('/controller/approveAction/doApprove.do',params, function (data) {
	            var ret = data.ret;
	            switch(ret){
	                case 0://成功
	                    //执行成功回调函数.
	                    cb(data);
	                    break;
	                case 1://没有登陆态或登陆态失效
	                    alert(data.msg);
	            }
	        }).fail(function () {
	            // 错误处理
	        });
	    }

	    var deleteItem = function ($item , id){
	        if(!confirm("你确定要删除吗")){
	            return ;
	        }
	        $.getJSON('/controller/applyAction/remove.do',{id : id}, function (data) {
	            var ret = data.ret;
	            if(ret == 0){
	                $item.parents(".listRow").remove();
	            }else {
	                alert(data.msg);
	            }
	        }).fail(function () {
	            alert("删除失败");
	        });
	    }
	    function bindEvent() {

	        //搜索
	        $("#apply_searchBtn").on("click", function () {
	            var searchParam = {
	                searchText:$("#apply_searchText").val(),
	                statusType:parseInt($("#apply_searchType").val(),10)
	            };
	            getSearchList(searchParam, function(data){
	                console.log(data);
	                var param = {
	                    encodeHtml: encodeHtml
	                };
	                $('.dataTable').html(applyTable({it : data, opt : param}));
	                //bindEvent();
	            });
	        });

	        //审核
	        $("#applyList").on("click",".approveBtn", function(){
	            $(this).siblings(".approveBlock").show();
	            tempStatus = $(this).siblings(".approveBlock").find("#statusPanel").data("value");
	            oldClass = $(this).siblings(".approveBlock").find("#statusPanel").attr("class");
	        });
	        $(".approveBlock .closeBtn").on("click", function(e){
	            $(this).parent().hide();
	            //取消则返回之前的class
	            $(this).siblings("#statusPanel").removeClass().addClass(oldClass);
	            e.stopPropagation();
	        });
	        $("#statusPanel .statusBtn").on("click", function(e){
	            var type = $(this).data("type");
	            oldClass = $(this).parent().attr("class");
	            tempStatus = $(this).data("value");
	            $(this).parent().removeClass().addClass(type +"-active");
	            e.stopPropagation();
	        });
	        $("#applyList .deleteBtn").on("click", function(e){
	            deleteItem($(this) , $(this).data("applyid"));
	            e.stopPropagation();
	        });
	        $(".approveBlock .operation").on("click", function (e) {

	            if( $(this).siblings("#statusPanel").hasClass("delete-active")){
	                deleteItem($(this) , $(this).data("apply_id"));
	                return ;
	            }
	            //只有提交了才改变状态值
	            $(this).siblings("#statusPanel").data().value = tempStatus;
	            var param = {
	                reply       : $(this).siblings(".replyText").val(),
	                applyId     : $(this).data("apply_id"),
	                applyStatus : tempStatus
	            };
	            var $self = $(this);
	            doApprove(param, function (data) {
	                alert(data.msg);
	                $self.parent().hide();
	                location.reload();
	            });
	            e.stopPropagation();
	        });

	        $("#applyList .appkey_btn").click(function (){

	        });

	    }
	    function getSearchList(params,cb){
	        $.get('./controller/applyAction/queryListBySearch.do',params, function (data) {
	            var ret = data.ret;
	            switch(ret){
	                case 0://成功
	                    //执行成功回调函数.
	                    cb(data.data);
	                    break;
	                case 1://没有登陆态或登陆态失效
	                    alert("失败");
	            }
	        }).fail(function () {
	            // 错误处理
	        });
	    }
	    //获取列表页信息
	    function getApplyList(cb){
	        var params = {
	        };
	        $.get('./controller/applyAction/queryListByUser.do',params, function (data) {
	            var ret = data.ret;
	            switch(ret){
	                case 0://成功
	                    //执行成功回调函数.
	                    cb(data.data);
	                    break;
	                case 1://没有登陆态或登陆态失效
	                    alert("失败");
	            }
	        }).fail(function () {
	            // 错误处理
	        });
	    }

	    function init() {
	        //$(".datetimepicker").datetimepicker({format: 'YYYY-MM-DD HH:mm'}).data("DateTimePicker").setMaxDate(new Date());
	        //
	        //$('.fromTime').data("DateTimePicker").setDate( new Date(new Date() - maxDate));
	        //$('.toTime').data("DateTimePicker").setDate( new Date());
	        getApplyList(function(data){
	            console.log(data);
	            var param = {
	                encodeHtml: encodeHtml
	            };
	            $('.dataTable').html(applyTable({it : data, opt :param}));
	            bindEvent();
	        });


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

/***/ 144:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(_) {module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '', __j = Array.prototype.join;
	function print() { __p += __j.call(arguments, '') }
	with (obj) {


	    var len = it.item.length;

	    var statue = "";

	;
	__p += '\r\n';
	 if(len !=0){;
	__p += '\r\n<thead>\r\n<tr>\r\n    <!--<th><input class="tableSelectCheckBox parentCheckBox" type="checkbox"/></th>-->\r\n    <th>#</th>\r\n    <th style="width:80px;">上报id</th>\r\n    <th style="width:80px;">appkey</th>\r\n    <th >名称</th>\r\n    <th>申请人</th>\r\n    <th style="width:120px;">申请时间</th>\r\n   <!-- <th >业务描述</th>-->\r\n    <th >详情</th>\r\n    <th style="width:120px;">' +
	((__t = ( it.role ==1 ? '操作' : '状态')) == null ? '' : __t) +
	'</th>\r\n    ';
	if (it.role != 1) { ;
	__p += '\r\n    <th style="width:120px;">操作</th>\r\n    ';
	 };
	__p += '\r\n\r\n\r\n</tr>\r\n</thead>\r\n\r\n<tbody id="applyList">\r\n';

	var one ;
	for(var i = 0; i<len ; i++){
	    one = it.item[i];
	    one.status -= 0;
	    var STATUS_BLOCK_HEIGHT = 24;
	    var status = 'applying-active';
	    var statusText = '待审核';
	    var statusClass = 'applyingBtn'
	    var blacklistIPStr = '';
	    var blacklistUAStr = '';

	    try {
	        one.blacklist = JSON.parse(one.blacklist || {})
	    }catch(e){
	        one.blacklist = {};
	    }
	    blacklistIPStr =  one.blacklist.ip ? one.blacklist.ip.join(',') : ''
	    blacklistUAStr =  one.blacklist.ua ? one.blacklist.ua.join(',') : ''

	    if(one.status != 0){
	        status = one.status ==1 ? 'agree-active' : 'disagree-active';
	        statusText = one.status ==1 ? '已通过' : '已拒绝';
	        statusClass = one.status ==1 ? 'passBtn' : 'rejectedBtn';
	    }

	;
	__p += '\r\n    <tr class="listRow" >\r\n        <!--<td><input class="tableSelectCheckBox" type="checkbox"/></td>-->\r\n        <td class="">' +
	((__t = ((i +1))) == null ? '' : __t) +
	'</td>\r\n        <td class="apply_id" style="text-align: center;">' +
	((__t = (one.id)) == null ? '' : __t) +
	'</td>\r\n        <td class="apply_appkey" style="text-align: center;" >\r\n            <a class="appkey_btn" href="javascript:void(0)" >appkey</a>\r\n            <div class="appkey-panel" style="text-align: left">\r\n                <div> appkey : <strong>' +
	((__t = (one.appkey)) == null ? '' : __t) +
	'</strong></div>\r\n            </div>\r\n        </td>\r\n        <td class="apply_name">\r\n            <span style="width:100px;" class="textOverflow" title="' +
	((__t = (one.name)) == null ? '' : __t) +
	'">' +
	((__t = (one.name)) == null ? '' : __t) +
	'</span>\r\n        </td>\r\n        <td class="apply_userName">' +
	((__t = (one.userName)) == null ? '' : __t) +
	'</td>\r\n        <td class="apply_createTime">' +
	((__t = ( _.formatDate( new Date(one.createTime) , 'YYYY-MM-DD' ))) == null ? '' : __t) +
	'</td>\r\n       <!-- <td  class="apply_description">\r\n            <span style="width:250px;" class="textOverflow" title="' +
	((__t = (one.description)) == null ? '' : __t) +
	'"> ' +
	((__t = (one.description)) == null ? '' : __t) +
	'</span>\r\n        </td>-->\r\n        <td class="apply_url" >\r\n            <span style="width:270px;" class="textOverflow" title="' +
	((__t = (one.url)) == null ? '' : __t) +
	'"><b>url：</b>' +
	((__t = (one.url)) == null ? '' : __t) +
	'</span>\r\n            <span style="width:270px;" class="textOverflow" >\r\n                <b>ip：</b>' +
	((__t = ( blacklistIPStr    )) == null ? '' : __t) +
	'\r\n            </span>\r\n             <span style="width:270px;" class="textOverflow" >\r\n                <b>userAgent：</b>' +
	((__t = ( blacklistUAStr    )) == null ? '' : __t) +
	'\r\n              </span>\r\n            <span style="width:270px;" class="textOverflow" title="' +
	((__t = (one.description)) == null ? '' : __t) +
	'"><b>描述：</b>' +
	((__t = (one.description)) == null ? '' : __t) +
	'</span>\r\n        </td>\r\n\r\n        <td class="apply_operation">\r\n            ';
	if(it.role == 1){;
	__p += '\r\n            <div  class="modifyBtn approveBtn ' +
	((__t = (statusClass)) == null ? '' : __t) +
	'">\r\n                ' +
	((__t = ( statusText)) == null ? '' : __t) +
	'\r\n            </div>\r\n            <div class="approveBlock" >\r\n                <div class="closeBtn">关闭</div>\r\n                <input  class="rowBlock replyText" type="text" name="description" placeholder="操作描述"/>\r\n                <div id="statusPanel" class="' +
	((__t = ( status)) == null ? '' : __t) +
	'" data-value="' +
	((__t = ( one.status)) == null ? '' : __t) +
	'">\r\n                    <div class="statusBtn applying" data-type="applying" data-value="0">待审核</div>\r\n                    <div class="statusBtn agree" data-type="agree" data-value="1">通过</div>\r\n                    <div class="statusBtn disagree" data-type="disagree" data-value="2">拒绝</div>\r\n                    <div class="statusBtn delete" data-type="delete" >删除</div>\r\n                </div>\r\n                <div class="operation" data-apply_id="' +
	((__t = (one.id)) == null ? '' : __t) +
	'">\r\n                    <button class="submitBtn" >确定</button>\r\n                </div>\r\n            </div>\r\n            ';
	} else {;
	__p += '\r\n            <div  class=" ' +
	((__t = (statusClass)) == null ? '' : __t) +
	'">\r\n                ' +
	((__t = ( statusText)) == null ? '' : __t) +
	'\r\n            </div>\r\n            ';
	};
	__p += '\r\n        </td>\r\n        ';
	if (it.role != 1) { ;
	__p += '\r\n        <td>\r\n            ';
	  if(true) {;
	__p += '\r\n            <button class="editBtn">\r\n                <a href="apply.html?applyId=' +
	((__t = (one.id)) == null ? '' : __t) +
	'">编辑</a>\r\n            </button>\r\n            ';
	 } ;
	__p += '\r\n            <button class="deleteBtn" data-applyid="' +
	((__t = (one.id)) == null ? '' : __t) +
	'">\r\n                <a href="javascript:void(0)">删除</a>\r\n            </button>\r\n        </td>\r\n        ';
	};
	__p += '\r\n    </tr>\r\n';
	};
	__p += '\r\n</tbody>\r\n';
	};
	__p += '\r\n';

	}
	return __p
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

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