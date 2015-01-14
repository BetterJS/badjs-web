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
        $(".infoWrapper .closeBtn").on("click", function(){
           $(this).parent().parent().hide();
        });
        //审核
        $(".modifyBtn").on("click", function(){
            var parent =  $(this).parent();
            $(".approvePanel .apply_id").text(parent.siblings(".apply_id").text());
            $(".approvePanel .apply_name").text(parent.siblings(".apply_name").text());
            $(".approvePanel .apply_userName").text(parent.siblings(".apply_userName").text());
            $(".approvePanel .apply_createTime").text(parent.siblings(".apply_createTime").text());
            $(".approvePanel .apply_description").text(parent.siblings(".apply_description").text());
            $(".approvePanel .apply_url").text(parent.siblings(".apply_url").text());
            $(".approvePanel").show();
        });

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
        $(".datetimepicker").datetimepicker({format: 'YYYY-MM-DD HH:mm'}).data("DateTimePicker").setMaxDate(new Date());

        $('.fromTime').data("DateTimePicker").setDate( new Date(new Date() - maxDate));
        $('.toTime').data("DateTimePicker").setDate( new Date());
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