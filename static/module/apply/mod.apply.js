/**
 * @info 申请新页面页面js
 * @author coverguo
 * */

var REG_REFERER = /^https?:\/\/[^\/]+\//i;
var REG_DOMAIN_STAR = /^\*(\.[^\/]+)?$/;

var Dialog = require("dialog/dialog");


var applyBox = $("#applyContainer");

function bindEvent() {
    applyBox.on('click', '.apply-submit', function(e) {
        e.preventDefault();
        var mainpage = $.trim($(".apply-url").val());
        if ($('.apply-name').val().length <= 0) {
            alert("请填写业务名称");
            return;
        }
        if (!REG_DOMAIN_STAR.test(mainpage) && !REG_REFERER.test(mainpage)) {
            alert("业务URL格式错误 , eg: http://www.qq.com/");
            return;
        }

    var blackListIP = $('.apply-blacklist-ip').val();
    var blackListUA = $('.apply-blacklist-ua').val();
    var blackList = {ip : blackListIP ? blackListIP.split(",") : [] , ua : blackListUA ? blackListUA.split(","): [] }



    var params = {};
        //申请数据
        $.extend(params, {
            name: $('.apply-name').val(),
            description: $('.apply-description').val(),
            url: mainpage,
            blacklist: JSON.stringify(blackList),
            id: $("#applyId").val()
        });

        $.post('./controller/applyAction/addApply.do', params, function(data) {
            var ret = data.ret;
            switch (ret) {
                case 0: //成功
                    //执行成功回调函数.
                    alert("成功");
                    location.href = '/user/applyList.html';
                    break;
                case 1: //没有登陆态或登陆态失效
                    alert("失败");
            }
        }).fail(function() {
            // 错误处理
        });
    });
}


function init() {
    bindEvent();
}

module.exports = {
    init: init
};
