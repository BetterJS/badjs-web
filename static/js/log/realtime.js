define([
    '../delegator',
    '../dialog',
    'template/logTable.tpl',
    'template/keyword.tpl',
    'template/debar.tpl'
], function ( Delegator, Dialog, logTable, keyword, debar) {
    var logConfig = {
            id: 0,
            startDate: 0,
            endDate: 0,
            include: [],
            exclude: [],
            index: 0,
            level:[4]
        },

        encodeHtml = function (str) {
            return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
        };




    var currentSelectId = -1, currentIndex = 0  , noData = false , MAX_LIMIT = 500 , loading = false, monitorTimeId;

    function addKeyword() {
        var value = $.trim($('#keyword-ipt').val());
        if (value !== '') {
            if (!removeValue(value, logConfig.include)) {
                $('#keyword-group').append(keyword({
                    value: value
                }, {
                    encodeHtml: encodeHtml,
                    set: Delegator.set
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
                    value: value
                }, {
                    encodeHtml: encodeHtml,
                    set: Delegator.set
                }));
            }
            logConfig.exclude.push(value);
            $('#debar-ipt').val('');
        }
    }



    function bindEvent() {
        new Delegator(document.body)
            .on('click', 'searchBusiness', function () {
                // search business
            }).on('click', 'addKeyword', addKeyword)
            .on('keyup', 'addKeyword', function (e) {
                if (e.which === 13) addKeyword();
            }).on('click', 'removeKeywords', function () {
                logConfig.include.length = 0;
                $('#keyword-group').empty();
            }).on('click', 'removeKeyword', function (e, value) {
                $(this).closest('.keyword-tag').remove();
                removeValue(value, logConfig.include);
            }).on('click', 'addDebar', addDebar)
            .on('keyup', 'addDebar', function (e) {
                if (e.which === 13) addDebar();
            }).on('click', 'removeDebars', function () {
                logConfig.exclude.length = 0;
                $('#debar-group').empty();
            }).on('click', 'removeDebar', function (e, value) {
                $(this).closest('.keyword-tag').remove();
                removeValue(value, logConfig.exclude);
            }).on('click', 'showLogs', function () {
                if(logConfig.id <= 0 || loading){
                    !loading && Dialog({
                        header: '警告',
                        body:'请选择一个项目'
                    });
                    return ;
                }

                clearTimeout(monitorTimeId);
                $('#log-table').html('');
                startTime = undefined;
                startMonitor();
                $(this).text('重新监听')

            })
            .on('click', 'showSource', function (e, data) {
                // 内网服务器，拉取不到 外网数据,所以屏蔽掉请求
                return ;

            }).on('change' ,'selectBusiness' , function (){
                var val = $(this).val()-0;
                currentSelectId = val;
                $('#log-table').html('');
                currentIndex = 0;
                noData = false;
                logConfig.id = val;

            }).on('click', 'errorTypeClick', function () {
                if($(this).hasClass('msg-dis')){
                    logConfig.level.push(4);
                    $(this).removeClass('msg-dis');
                }else{
                    logConfig.level.splice($.inArray(4,logConfig.level),1);
                    $(this).addClass('msg-dis');
                }
                console.log('log', logConfig.level);

            }).on('click', 'logTypeClick', function(){
                if($(this).hasClass('msg-dis')){
                    logConfig.level.push(2);
                    $(this).removeClass('msg-dis');
                }else{
                    logConfig.level.splice($.inArray(2,logConfig.level),1);
                    $(this).addClass('msg-dis');
                }


            }).on('click', 'debugTypeClick', function () {
                if($(this).hasClass('msg-dis')){
                    logConfig.level.push(1);
                    $(this).removeClass('msg-dis');
                }else{
                    logConfig.level.splice($.inArray(1,logConfig.level),1);
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


    var startMonitor = function (){
        monitorTimeId = setTimeout(function (){
            showLogs(logConfig);
            startMonitor();
        },3000);
    }


    var startTime, endTime;

    function showLogs(opts) {

        loading = true;


        if(startTime){
            startTime = endTime;
        }else {
            startTime = new Date - diffTime - (5* 1000);
        }
        endTime = new Date - diffTime ;


        var url = '/controller/logAction/queryLogList.do';
        $.ajax({
            url: url,
            data: {
                id: opts.id,
                startDate: startTime,
                endDate: endTime,
                include: opts.include,
                exclude: opts.exclude,
                index: 0 ,
                _t: new Date()-0,
                level:opts.level
            },
            success: function(data) {
                var ret = data.ret;
                if(ret==0){
                    var param = {
                        encodeHtml: encodeHtml,
                        set: Delegator.set,
                        startIndex : currentIndex
                    }

                    if(data.data.length > 0){
                        $('#log-table').prepend(logTable(data.data.reverse(), param));
                    }

                    currentIndex += data.data.length;
                    if(data.data.length == 0){
                        noData = true;
                    }
                }
                loading = false;
            },
            error: function() {
                loading = false;
            }
        });
    }

    function init() {
        bindEvent();
    }

    return {
        init: init
    }

});