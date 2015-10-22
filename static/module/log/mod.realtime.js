var dialog = require("dialog/dialog");
var Delegator = require("delegator");

var logTable = require("./template/logTable.ejs");
var keyword = require("./template/keyword.ejs");
var debar = require("./template/debar.ejs");


var logConfig = {
        id: 0,
        startDate: 0,
        endDate: 0,
        include: [],
        exclude: [],
        index: 0,
        level: [4]
    },

    encodeHtml = function(str) {
        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
    };


var websocket;



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
        }).on('click', 'showLogs', function() {
            logConfig.id = $('#select-business').val() >> 0; // jshint ignore:line
            if (logConfig.id <= 0 || loading) {
                !loading && dialog({
                    header: '警告',
                    body: '请选择一个项目'
                });
                return;
            }

            if (!$(this).data("stop")) {
                $(this).data("stop", true);
                $('#log-table').html('');
                startMonitor(logConfig.id);
                $(this).text('停止监听');
            } else {
                $(this).data("stop", false);
                websocket.close();
                $(this).text('开始监听');
            }

        })
        .on('click', 'showSource', function(e, data) {
            // 内网服务器，拉取不到 外网数据,所以屏蔽掉请求
            return;

        }).on('change', 'selectBusiness', function() {
            var val = $(this).val() - 0;
            currentSelectId = val;
            $('#log-table').html('');
            currentIndex = 0;
            noData = false;
            logConfig.id = val;

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
        });



}

function removeValue(value, arr) {
    for (var l = arr.length; l--;) {
        if (arr[l] === value) {
            return arr.splice(l, 1);
        }
    }
}

var keepAliveTimeoutId;
var currentIndex;
var maxShow = 100;
var startMonitor = function(id) {

    websocket = new WebSocket("ws://" + location.host + "/ws/realtimeLog");
    
    currentIndex = 0;
    websocket.onmessage = function(evt) {
        showLogs(JSON.parse(evt.data).message);
    };

    websocket.onclose = function() {
        clearTimeout(keepAliveTimeoutId);
    };

    websocket.onopen = function() {

        websocket.send(JSON.stringify({
            type: "INIT",
            include: logConfig.include,
            exclude: logConfig.exclude,
            level: logConfig.level,
            id: id
        }));

        keepAliveTimeoutId = setInterval(function() {
            websocket.send(JSON.stringify({
                type: "KEEPALIVE"
            }));
        }, 5000);
    };
};


function showLogs(data) {

    var param = {
        encodeHtml: encodeHtml,
        set: Delegator.set,
        startIndex: currentIndex
    };

    var $table = $('#log-table');

    if (maxShow % 100 === 0) {
        $table.html($table.html().split("</tr>").slice(0, maxShow).join("</tr>"));
    }
    $table.prepend(logTable({
        it: [data],
        opt: param
    }));
    currentIndex++;
}



function init() {
    bindEvent();
}

exports.init = init;