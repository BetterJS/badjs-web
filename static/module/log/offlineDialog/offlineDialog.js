var Delegator = require("delegator");
var offline_monitor_row = require("./tpl/offline_monitor_row.ejs");
var dialogTpl = require("./tpl/dialog.ejs");

    var container;

    function hide() {
        container.removeClass('in');
        container.find('.modal-backdrop').removeClass('in');
        setTimeout(function () {
            container.remove();
            container = undefined;
        }, 300);
    }

    function showOfflineLogConfig(logConfig){
        $.ajax({
            url: "/controller/logAction/getOfflineLogConfig.do",
            data: {
                id: logConfig.id,
            },
            success : function (data){
                $("#offlineConfigModal table").html("")
                _.each(data.data , function (value ,key){
                    $("#offlineConfigModal table").append(offline_monitor_row({uin : key}))
                })
            },
            error : function (){

            }
        })
    }

    function Dialog (param) {
        if (container) {
            container.remove();
            container = undefined;
        }
        container = $(dialogTpl())
            .appendTo(document.body)
            .show();

        var key,
            action,
            delegator,
            on =  {};

        delegator = (new Delegator(container))
            .on('click', 'close', hide)
            .on('click', 'addUin', function (){
                var val = $("#addUin").val();

                if(val.length <=0){
                    return ;
                }
                $.ajax({
                    url: "/controller/logAction/addOfflineLogConfig.do",
                    data: {
                        uin: val,
                        id : param.id
                    },
                    success : function (data){
                        if(!data.data.hadAdd && data.ret == 0){
                            $("#offlineConfigModal table").append(offline_monitor_row({uin : val}))
                        }

                        $("#addUin").val("")
                    },
                    error : function (){

                    }
                })
            })
            .on('click', 'deleteUin', function (e){
                var val = $(e.currentTarget).attr("uin");

                if(val.length <=0){
                    return ;
                }
                $.ajax({
                    url: "/controller/logAction/deleteOfflineLogConfig.do",
                    data: {
                        uin: val,
                        id : param.id
                    },
                    success : function (){
                        $(e.currentTarget).parents("tr").remove();
                    },
                    error : function (){

                    }
                })
            });

        for (key in on) {
            action = key.split('/');
            delegator.on(action[0], action[1], on[key]);
        }

        setTimeout(function () {
            container.addClass('in');
            container.find('.modal-backdrop').addClass('in');

            showOfflineLogConfig(param);
        }, 0);
    }

    Dialog.hide = hide;

module.exports =  Dialog;
