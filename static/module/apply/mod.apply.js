/**
 * @info 申请新页面页面js
 * @author coverguo
 * */

var Dialog = require("dialog/dialog");


    var isValid = true,
        applyBox = $("#applyContainer");

    function bindEvent() {
        applyBox.on('click', '.apply-submit', function(e){
            e.preventDefault();
            if(!isValid){
                console.log(isValid);
                alert("填写错误，请改正填写");
                return;
            }
            var params = {};
            //申请数据
            $.extend(params, {
                name: $('.apply-name').val(),
                description: $('.apply-description').val(),
                url: $(".apply-url").val(),
                id: $("#applyId").val()
                //mail: $(".apply-mail").val()
            });

            $.post('./controller/applyAction/addApply.do', params, function (data) {
                var ret = data.ret;
                switch(ret){
                    case 0://成功
                        //执行成功回调函数.
                        alert("成功");
                        location.reload();
                        break;
                    case 1://没有登陆态或登陆态失效
                        alert("失败");
                }
            }).fail(function () {
                // 错误处理
            });


        })


    }


    function init() {

        bindEvent();

    }

module.exports = {init: init}
