var dialog = require("dialog/dialog");
var Delegator = require("delegator");

var logTable = require("./template/logTable.ejs");
var keyword = require("./template/keyword.ejs");
var debar = require("./template/debar.ejs");
var offlineDialog = require("./offlineDialog/offlineDialog");
var logDetailDialog = require("./logDetailDialog/logDetailDialog");

var offlineLogCache = {};


var logConfig = {
        id: 0,
        startDate: 0,
        endDate: 0,
        include: [],
        exclude: [],
        index: 0,
        level: [1, 2, 4 , 20]
    },

    encodeHtml = function(str) {
        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
    },

    formatMsg = function (str){
        return str.replace(/@/gi , '<br/><b style="color:#A78830;">@</b> ')
    };


var currentSelectId = -1,
    currentIndex = 0,
    noData = false,
    MAX_LIMIT = 500,
    loading = false,
    monitorTimeId;

function addKeyword() {
    var value = $.trim($('#keyword-ipt').val());
    if (value !== '') {
        if (!removeValue(value, logConfig.include)) {
            $('#keyword-group').append(keyword({
                it: {
                    value: value
                },
                opt: {
                    encodeHtml: encodeHtml,
                    set: Delegator.set
                }
            }));
        }
        logConfig.include.push(value);
        $('#keyword-ipt').val('');
    }
}

function addDebar() {
    var value = $.trim($('#debar-ipt').val());
    if (value !== '') {
        if (!removeValue(value, logConfig.exclude)) {
            $('#debar-group').append(debar({
                it: {
                    value: value
                },
                opt: {
                    encodeHtml: encodeHtml,
                    set: Delegator.set
                }
            }));
        }
        logConfig.exclude.push(value);
        $('#debar-ipt').val('');
    }
}



function bindEvent() {
    new Delegator(document.body)
        .on('click', 'searchBusiness', function() {
            // search business
        }).on('click', 'addKeyword', addKeyword)
        .on('keyup', 'addKeyword', function(e) {
            if (e.which === 13) addKeyword();
        }).on('click', 'removeKeywords', function() {
            logConfig.include.length = 0;
            $('#keyword-group').empty();
        }).on('click', 'removeKeyword', function(e, value) {
            $(this).closest('.keyword-tag').remove();
            removeValue(value, logConfig.include);
        }).on('click', 'addDebar', addDebar)
        .on('keyup', 'addDebar', function(e) {
            if (e.which === 13) addDebar();
        }).on('click', 'removeDebars', function() {
            logConfig.exclude.length = 0;
            $('#debar-group').empty();
        }).on('click', 'removeDebar', function(e, value) {
            $(this).closest('.keyword-tag').remove();
            removeValue(value, logConfig.exclude);
        }).on('click', 'configOfflineMonitor', function(e, value) {

            if ( logConfig.id <= 0 ) {
                !loading && dialog({
                    header: '警告',
                    body: '请选择一个项目'
                });
                return;
            }

            offlineDialog(logConfig)


        }).on('click', 'showLogs', function() {
            var fileId = logConfig.fileId = $('#select-offline-logs').val(); // jshint ignore:line

            if(loading){
                return ;
            }

            if (logConfig.fileId <= 0 || logConfig.id <= 0 ) {
                !loading && dialog({
                    header: '警告',
                    body: '请选择一个离线日志'
                });
                return;
            }


            loading = true;
            $(".setting-search").text("正在加载...")

            if(offlineLogCache[fileId]){
                showLogs(offlineLogCache[fileId] , logConfig)
                $(".setting-search").text("查询日志");
                loading = false;
                return ;
            }

            var url = '/controller/logAction/showOfflineLog.do';
            $.ajax({
                url: url,
                data: {
                    id: logConfig.id,
                    fileId: fileId,
                },
                success : function (data){
                    loading = false;

                    $(".setting-search").text("查询日志")
                    var offlineLogs = JSON.parse(data.data);
                    var newLogs = []
                    offlineLogs.logs.forEach(function (item){
                        var  date = new Date(item.time);
                        item.userAgent = offlineLogs.userAgent;
                        item.date = _.formatDate(date , 'YYYY-MM-DD hh:mm:ss');
                        var all = "";
                        for(var key in item ) {
                            if(key == 'time'){
                                continue
                            }
                            all += ';'+key+'=' + item[key];
                        }
                        item.date = date;
                        item.all = all;
                        newLogs.push(item)
                    })

                    offlineLogCache[fileId] = newLogs

                    showLogs(offlineLogCache[fileId] , logConfig)
                },
                error : function (){

                }
            })




        })
        .on('click', 'alertModal', function(e, data) {
            var $target=$(e.currentTarget);

            logDetailDialog({
                id :$target.text(),
                time :$target.siblings('.td-2').text(),
                info :$target.siblings('.td-3').html(),
                uin :$target.siblings('.td-4').text(),
                ip :$target.siblings('.td-5').text(),
                agent : $target.siblings('.td-6').attr("title"),
                source :   $target.siblings('.td-7').html() ,
            })
        }).on('change', 'selectBusiness', function() {
            var val = $(this).val() - 0;
            currentSelectId = val;
            $('#log-table').html('');
            currentIndex = 0;
            noData = false;
            logConfig.id = val;
            fetchOfflineFile(val)
        }).on('click', 'showTd', function(e) {
            var $target=$(e.currentTarget).toggleClass('active');
            $('.main-table .'+$target.data('td')).toggleClass('active');
            //保存用户偏好，隐藏为true
            //console.log($target.data('td'));
            localStorage.setItem($target.data('td'),!$target.hasClass('active'));
            //console.log(localStorage);
            window.classes[$target.data('td')]=$target.hasClass('active')?'active':'';
        }).on('click', 'errorTypeClick', function() {
            if ($(this).hasClass('msg-dis')) {
                logConfig.level.push(4);
                $(this).removeClass('msg-dis');
            } else {
                logConfig.level.splice($.inArray(4, logConfig.level), 1);
                $(this).addClass('msg-dis');
            }
            console.log('log', logConfig.level);

        }).on('click', 'logTypeClick', function() {
            if ($(this).hasClass('msg-dis')) {
                logConfig.level.push(2);
                $(this).removeClass('msg-dis');
            } else {
                logConfig.level.splice($.inArray(2, logConfig.level), 1);
                $(this).addClass('msg-dis');
            }


        }).on('click', 'debugTypeClick', function() {
            if ($(this).hasClass('msg-dis')) {
                logConfig.level.push(1);
                $(this).removeClass('msg-dis');
            } else {
                logConfig.level.splice($.inArray(1, logConfig.level), 1);
                $(this).addClass('msg-dis');
            }
        }).on('click', 'offlineTypeClick', function() {
            if ($(this).hasClass('msg-dis')) {
                logConfig.level.push(20);
                $(this).removeClass('msg-dis');
            } else {
                logConfig.level.splice($.inArray(20, logConfig.level), 1);
                $(this).addClass('msg-dis');
            }
        });


}

function removeValue(value, arr) {
    for (var l = arr.length; l--;) {
        if (arr[l] === value) {
            return arr.splice(l, 1);
        }
    }
}



function fetchOfflineFile (id){
    if(id == -1 || !id){
        $("#select-offline-logs").attr("disabled").html('<option value="-1">-- 选择离线日志 --</option>')
        return;
    }
    var url = '/controller/logAction/showOfflineFiles.do';
    $.ajax({
        url: url,
        data: {
            id: id,
        },
        success : function (data){
            if(data.data.length <= 0){
                $("#select-offline-logs").attr("disabled" , "disabled").html('<option value="-1">-- 无离线日志 --</option>')
            }else {
                $("#select-offline-logs").removeAttr("disabled").html("")
                $.each(data.data, function (key , item){
                    var arr = item.id.split("_");
                    var itemName = arr[0];
                    if(arr[2]  ){
                        var dateStr = _.formatDate(new Date(arr[2]-0) , 'YYYY-MM-DD');
                        itemName += " (" + dateStr +")";
                    }


                    $("#select-offline-logs").append('<option value="'+item.id +'">'+itemName+'</option>')
                })
            }
        },
        error : function (){

        }
    })
}

function showLogs(data , opt) {



    var includeJSON = [];
    opt.include.forEach(function(value, key) {
        includeJSON.push(value);
    });


    var excludeJSON = [];
    opt.exclude.forEach(function(value, key) {
        excludeJSON.push(value);
    });


    var newData = [];
    data.forEach(function (value){
        var matched = false;

        if($.inArray( value.level , opt.level ) == -1){
            return ;
        }
        if(includeJSON.length || excludeJSON.length){
            for(var i = 0 ; i < includeJSON.length ; i++){
                if(value.all.indexOf(includeJSON[i]) > -1){
                    matched = true;
                }
            }

            for(var i = 0 ; i < excludeJSON.length ; i++){
                if(value.all.indexOf(excludeJSON[i]) > -1){
                   matched = false;
                }else {
                    matched = true;
                }
            }
        }else  {
            matched = true;
        }

        if(matched){
            newData.push(value)
        }


    });

    var param = {
        encodeHtml: encodeHtml,
        set: Delegator.set,
        startIndex: 1,
        formatMsg : formatMsg
    };

    $('#log-table').html(logTable({
        it: newData,
        opt: param,
        classes: {
            'td-1':'active',
            'td-2':'active',
            'td-3':'active',
            'td-6':'active',
            'td-7':'active',
        }
    }));
}

function init() {
    bindEvent();
    //读取用户偏好

    $('.main-table .td-4').removeClass('active');
    $('.main-table .td-5').removeClass('active');


    $('#content .mid-side .main-table thead tr').show();
    $('#content .right-side .setting-show').show();
}

exports.init = init;
