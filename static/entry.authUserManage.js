webpackJsonp([5],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var usermanger = __webpack_require__(10);

	usermanger.init();

/***/ },

/***/ 10:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function($) {/**
	 * @info 用户列表js
	 * @author coverguo
	 * */

	var userTable = __webpack_require__(145);


	    var encodeHtml = function (str) {
	        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
	    };
	    function bindEvent() {

	        $(".searchBtn").on("click", function (){
	            fetch();
	        });


	        var submiting =  false;

	        $("#userList").on("click",'.user-authBtn', function (){
	            if(submiting){
	                return;
	            }
	            submiting = true;
	            var params = {
	                id : $(this).data("uaid"),
	                role : $(this).data("role")
	            };
	            $ajax("/controller/userAction/authUser.do", params, function(data){
	                fetch();
	                submiting = false;
	            });

	        });
	    };

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
	    function fetch() {
	        var params ={
	            roleType : $('.search-userType').val()
	        };
	        $ajax("controller/userAction/queryUserByCondition.do",params,function(items){
	            var param = {
	                encodeHtml: encodeHtml
	            };
	            $('#userList').html(userTable({it : items.data, opt : param}));

	        });


	    }

	module.exports = {
	        init: function (){
	            fetch();
	            bindEvent();
	        }
	}

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },

/***/ 145:
/***/ function(module, exports, __webpack_require__) {

	module.exports = function (obj) {
	obj || (obj = {});
	var __t, __p = '', __j = Array.prototype.join;
	function print() { __p += __j.call(arguments, '') }
	with (obj) {

	 for(var i =0, len = it.length;i<len; i++){
	    var role ="普通用户";
	    var operationType = 0;
	    if(it[i].role == 1){
	        if(it[i].loginName == "admin") {
	            role = "超级管理员";
	            operationType = 2;
	        }else {
	            role ="管理员";
	            operationType = 1;
	        }
	    }
	;
	__p += '\r\n<tr class="listRow">\r\n    <td>' +
	((__t = ( i+1)) == null ? '' : __t) +
	'</td>\r\n    <td>' +
	((__t = ( it[i].loginName)) == null ? '' : __t) +
	'</td>\r\n    <td>' +
	((__t = ( it[i].chineseName?it[i].chineseName:"无")) == null ? '' : __t) +
	'</td>\r\n    <td>' +
	((__t = ( it[i].email)) == null ? '' : __t) +
	'</td>\r\n    <td>' +
	((__t = ( role)) == null ? '' : __t) +
	' </td>\r\n    <td>\r\n        ';
	if(operationType == 1 ){;
	__p += '\r\n            <button class="user-authBtn btn-default modifyBtn" data-uaid="' +
	((__t = ( it[i].id)) == null ? '' : __t) +
	'" data-role="0">转为普通成员</button>\r\n        ';
	} else if(operationType == 0) {;
	__p += '\r\n            <button class="user-authBtn btn-default modifyBtn" data-uaid="' +
	((__t = ( it[i].id)) == null ? '' : __t) +
	'" data-role="1" >授权管理员</button>\r\n        ';
	};
	__p += '\r\n\r\n\r\n    </td>\r\n</tr>\r\n';
	};
	__p += '\r\n';

	}
	return __p
	}

/***/ }

});