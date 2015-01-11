/**
 * @info 申请列表js
 * @author coverguo
 * */

define([ '../dialog',
         'template/applyTable.tpl'
], function ( Dialog, applyTable ) {


    var   encodeHtml = function (str) {
        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
    };
    function bindEvent() {

    }

    //获取列表页信息
    function getApplyList(cb){
        var params = {
            cmd: "get_all_applyList"
        };
        $.get('./controller/action/queryApplyList.do',params, function (data) {
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

        getApplyList(function(data){
            console.log(data);
            var param = {
                encodeHtml: encodeHtml
            };
            $('.dataTable').html(applyTable(data, param));
        });
        bindEvent();

    }

    return {
        init: init
    }

});