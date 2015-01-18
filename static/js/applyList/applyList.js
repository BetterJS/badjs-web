/**
 * @info 申请列表js
 * @author coverguo
 * */

define([
         '../dialog',
         'template/applyTable.tpl'
], function ( Dialog, applyTable ) {

    var maxDate = 60*60*1000*24 *2;
    var   encodeHtml = function (str) {
        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
    };
    function doApprove(params , cb){
        $.post('./controller/action/approve.do',params, function (data) {
            var ret = data.ret;
            switch(ret){
                case 0://成功
                    //执行成功回调函数.
                    cb(data);
                    break;
                case 1://没有登陆态或登陆态失效
                    console(data.msg);
            }
        }).fail(function () {
            // 错误处理
        });
    }
    function bindEvent() {

        //审核
        $(".modifyBtn").on("click", function(){
            $(this).siblings(".approveBlock").show();
            console.log(112);
        });
        $(".approveBlock .closeBtn").on("click", function(e){
            $(this).parent().hide();
            console.log(11);
            e.stopPropagation();
        });
        $("#statusPanel .statusBtn").on("click", function(e){
            $(this).parent().removeClass().addClass($(this).data("type") +"-active");
            e.stopPropagation();
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
            $('.dataTable').html(applyTable(data, param));
            bindEvent();
        });


    }

    return {
        init: init
    }

});