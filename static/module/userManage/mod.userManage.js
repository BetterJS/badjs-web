/**
 * @info 用户列表js
 * @author coverguo
 * */

var Dialog = require("dialog/dialog");
var userTable = require("./template/userTable.ejs");


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
