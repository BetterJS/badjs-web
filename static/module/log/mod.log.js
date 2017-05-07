/* global _ */
var dialog = require("dialog/dialog");
var Delegator = require("delegator");

var logTable = require("./template/logTable.ejs");
var keyword = require("./template/keyword.ejs");
var debar = require("./template/debar.ejs");

var logDetailDialog = require("./logDetailDialog/logDetailDialog");

require("jquery/jquery.datetimepicker");

var logConfig = {
        id: 0,
        startDate: 0,
        endDate: 0,
        include: [],
        exclude: [],
        index: 0,
        level: [1, 2, 4]
    },

    encodeHtml = function(str) {
        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
    },

    formatMsg = function (str){
        return str.replace(/@/gi , '<br/><b style="color:#A78830">@</b> ')
    };

var maxDate = 60 * 60 * 1000 * 24 * 2;

var currentSelectId = -1,
    currentIndex = 0,
    noData = false,
    MAX_LIMIT = 500,
    loading = false;

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
        }).on('click', 'showLogs', function() {
            var startTime = ($('#startTime').val() || '').replace(/-/g, '/'),
                endTime = ($('#endTime').val() || '').replace(/-/g, '/');
            logConfig.startDate = startTime === '' ?
                new Date().getTime() - maxDate :
                new Date(startTime).getTime();
            logConfig.endDate = endTime === '' ?
                new Date().getTime() :
                new Date(endTime).getTime();
            //测试时间是否符合
            if (isTimeRight(logConfig.startDate, logConfig.endDate)) {
                showLogs(logConfig, false);
            }
        })
        .on('click', 'alertModal', function(e) {
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
        });

    var throttled = _.throttle(function(e) {
        var $this = $(this);
        var top = $this.scrollTop();
        var height = $this.height();
        var scrollHeight = $this.prop('scrollHeight');

        if (scrollHeight - height - top <= 200 && !noData) {
            logConfig.id = currentSelectId;
            showLogs(logConfig, true);
        }
    }, 100);

    $('.main-mid').scroll(throttled);
}

function isTimeRight(begin, end) {
    if (begin > end) {
        dialog({
            header: '时间范围错误',
            body: '结束时间必须在开始时间之后！'
        });
        return false;
    } else if (end - maxDate > begin) {
        dialog({
            header: '时间范围错误',
            body: '结束时间和开始时间间隔需在三天之内！'
        });
        return false;
    }
    return true;

}

function removeValue(value, arr) {
    for (var l = arr.length; l--;) {
        if (arr[l] === value) {
            return arr.splice(l, 1);
        }
    }
}

function showLogs(opts, isAdd) {
    opts.id = $('#select-business').val() >> 0; // jshint ignore:line
    if (opts.id <= 0 || loading) {
        !loading && dialog({
            header: '警告',
            body: '请选择一个项目'
        });
        return;
    }

    loading = true;

    $(".setting-search").text("正在加载...")


    if (!isAdd) {
        currentIndex = 0;
        noData = false;
    }

    var url = '/controller/logAction/queryLogList.do';
    $.ajax({
        url: url,
        data: {
            id: opts.id,
            startDate: opts.startDate,
            endDate: opts.endDate,
            include: opts.include,
            exclude: opts.exclude,
            index: currentIndex,
            _t: new Date() - 0,
            level: opts.level
        },
        success: function(data) {
            $(".setting-search").text("查询日志")
            var ret = data.ret;
            if (ret === 0) {
                var param = {
                    encodeHtml: encodeHtml,
                    set: Delegator.set,
                    startIndex: currentIndex * MAX_LIMIT,
                    formatMsg : formatMsg
                };

                if (isAdd) {
                    $('#log-table').append(logTable({
                        it: data.data,
                        opt: param,
                        classes: window.classes
                    }));
                } else {
                    $('#log-table').html(logTable({
                        it: data.data,
                        opt: param,
                        classes: window.classes
                    }));
                }

                currentIndex++;
                if (data.data.length === 0) {
                    noData = true;
                }
            }else {
                dialog({
                    header: '查询失败',
                    body: JSON.stringify(data.msg)
                });
            }
            loading = false;
        },
        error: function() {
            $(".setting-search").text("查询日志")
            loading = false;
        }
    });
}

function init() {
    bindEvent();
    //读取用户偏好
    var items=$("#content .right-side .setting-show .item");
    window.classes={};
    //console.log(localStorage);
    for(var i=0;i<items.length;i++){
        var item=$(items[i]);
        if(localStorage.getItem(item.data("td"))==='true'){
            item.removeClass('active');
            $('.main-table .'+item.data('td')).removeClass('active');
            window.classes[item.data('td')]='';
        }else{
            window.classes[item.data('td')]='active';
        }
    }
    $('#content .mid-side .main-table thead tr').show();
    $('#content .right-side .setting-show').show();

    $(".datetimepicker").datetimepicker({
        format: 'YYYY-MM-DD HH:mm'
    }).data("DateTimePicker").setMaxDate(new Date());

    $('#startTime').data("DateTimePicker").setDate(new Date(new Date() - maxDate));
    $('#endTime').data("DateTimePicker").setDate(new Date());
}

exports.init = init;
