/**
 * @info 用户列表js
 * @author coverguo
 * */

define([ '../dialog',
    'template/userTable.tpl'
], function ( Dialog, userTable ) {


    var encodeHtml = function (str) {
        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
    };
    function bindEvent() {

        $(".searchBtn").on("click", function (){
            var params ={
                userText : $(".search-userText").val(),
                applyId  : $(".search-applyId").val() ,
                role : $(".search-userType").val()
            };
            //console.log(params);
            $ajax("/controller/userAction/queryListByCondition.do",params,function(data){
                console.log(data);
                var param = {
                    encodeHtml: encodeHtml
                };
                $('#userList').html(userTable(data, param));
            });
            //设置info
            if(params.applyId ==-1){
                $(".add-userName").attr("disabled","disabled");
                $("#add-btn").attr("disabled","disabled");
            }else{
                $(".add-userName").removeAttr("disabled");
                $("#add-btn").removeAttr("disabled");
            }
            $(".projectName").text( $(".search-applyId").find("option:selected").text());
        });

        $("#add-btn").on("click", function () {
            var params ={
                userName : $(".add-userName").val(),
                applyId  : $(".search-applyId").val()
            };
            $ajax("/controller/userApplyAction/addUserApply.do", params, function(){
                console.log(data);
            })
        });

        $(".user-deleteBtn").on("click", function (){
            var param = {
                id : $(this).data('uad')
            };
            console.log(param);
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
                        cb(data.data);

                        break;
                    default ://没有登陆态或登陆态失效
                        alert(data.msg);
                }
            },
            error: function() {
               alert(data.msg);
            }
        });
    }


    function init() {
        $ajax("controller/userAction/queryListByUserProject.do",{},function(data){
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