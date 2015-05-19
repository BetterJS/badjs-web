/**
 * @info 用户列表js
 * @author coverguo
 * */

var userTable = require("./template/userTable.ejs");


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
