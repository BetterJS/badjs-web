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
    //选择的状态
    var tempStatus,
        oldClass;


    function doApprove(params , cb){
        $.post('/controller/approveAction/doApprove.do',params, function (data) {
            var ret = data.ret;
            switch(ret){
                case 0://成功
                    //执行成功回调函数.
                    cb(data);
                    break;
                case 1://没有登陆态或登陆态失效
                    alert(data.msg);
            }
        }).fail(function () {
            // 错误处理
        });
    }
    function bindEvent() {

        //审核
        $(".modifyBtn").on("click", function(){
            $(this).siblings(".approveBlock").show();
            tempStatus = $(this).siblings(".approveBlock").find("#statusPanel").data("value");
            oldClass = $(this).siblings(".approveBlock").find("#statusPanel").attr("class");
            console.log(tempStatus);
        });
        $(".approveBlock .closeBtn").on("click", function(e){
            $(this).parent().hide();
            //取消则返回之前的class
            $(this).siblings("#statusPanel").removeClass().addClass(oldClass);
            e.stopPropagation();
        });
        $("#statusPanel .statusBtn").on("click", function(e){
            var type = $(this).data("type");
            oldClass = $(this).parent().attr("class");
            tempStatus = $(this).data("value");
            $(this).parent().removeClass().addClass(type +"-active");
            e.stopPropagation();
        });
        $(".approveBlock .operation").on("click", function (e) {
            //只有提交了才改变状态值
            $(this).siblings("#statusPanel").data().value = tempStatus;
            var param = {
                reply       : $(this).siblings(".replyText").val(),
                applyId     : $(this).data("apply_id"),
                applyStatus : tempStatus
            };
            var $self = $(this);
            doApprove(param, function (data) {
                alert(data.msg);
                $self.parent().hide();
                location.reload();
            });
            e.stopPropagation();
        })

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