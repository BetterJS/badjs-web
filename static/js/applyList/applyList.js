/**
 * @info 申请列表js
 * @author coverguo
 * */

define([ '../dialog'], function ( Dialog) {



    function bindEvent() {

    }

    //获取列表页信息
    function getApplyList(cb){
        $.post('./controller/action/queryApplyList.do', {}, function (data) {
            var ret = data.ret;
            switch(ret){
                case 0://成功
                    //执行成功回调函数.
                    cb(data);
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
        });
        bindEvent();

    }

    return {
        init: init
    }

});