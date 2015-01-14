/**
 * @info 用户列表js
 * @author coverguo
 * */

define([ '../dialog',
    'template/userTable.tpl'
], function ( Dialog, userTable ) {


    var   encodeHtml = function (str) {
        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
    };
    function bindEvent() {
        $(".userEditor .modifyBtn").on("click", function (){
            var params ={
                userid: $(this).data("userid")
            };

        })
    }

    //获取列表页信息
    function getUserList(cb){
        var params = {
        };
        $.get('/controller/action/queryUserList.do',params, function (data) {
            var ret = data.ret;
            switch(ret){
                case 0://成功
                    //执行成功回调函数.
                    cb(data.data);
                    break;
                default ://没有登陆态或登陆态失效
                    alert(data.msg);
            }
        }).fail(function () {
            // 错误处理
        });
    }

    function init() {

        getUserList(function(data){
            console.log(data);
            var param = {
                encodeHtml: encodeHtml
            };
            $('#userList').html(userTable(data, param));
        });
        bindEvent();

    }

    return {
        init: init
    }

});