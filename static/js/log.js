define([
    'require',
    'jquery', 
    './delegator', 
    './dialog', 
    './logTable.tpl',
    './keyword.tpl', 
    './debar.tpl'
], function (require, $, Delegator, Dialog, logTable, keyword, debar) {
    var logConfig = {
            id: 0,
            startDate: 1417104000000,
            endDate: 1417190400000,
            include: [],
            exclude: [],
            index: 0,
            level:[4],
        },

        encodeHtml = function (str) {
            return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
        };


    var currentSelectId = -1, currentIndex = 0  , noData = false , MAX_LIMIT = 500;

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
            }).on('click', 'addBusiness', function () {
                // add business
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
                var startTime = $('#startTime').val(),
                    endTime = $('#endTime').val();
                logConfig.startDate = new Date(startTime).getTime();
                logConfig.endDate = new Date(endTime).getTime();
                showLogs(logConfig);
            })
            .on('click', 'showSource', function (e, data) {
                require([
                    './beautify',
                    function (done) {
                        $.get('/code?target=' + encodeURIComponent(data.target), function (code) {
                            done(null, code);
                        }).error(function (xhr, type, msg) {
                            done(msg);
                        });
                    }
                ], function (beautify, code) {
                    var codes = code.split(/\r?\n/),
                        line = beautify.js_beautify(codes[+data.rowNum]),
                        current;

                    for (var i = 0, c = 0, l = line.length; i < l; i++) {
                        if (c === +data.colNum) {
                            current = i;
                            break;
                        }
                        if (line[i] !== '\n' && line[i] !== '\r') {
                            c++;
                        }
                    }

                    line = [
                        '<pre>',
                        line.slice(0, current - 1),
                        '<strong>',
                        line.slice(current - 1),
                        '</strong>', 
                        '</pre>',
                        '<button type="button" class="btn btn-default" data-event-click="uploadSourceMap">上传SourceMap</button>',
                        '<button type="button" class="btn btn-default" data-event-click="uploadSrc">上传源文件</button>'
                    ].join('')

                    Dialog({
                        header: '错误定位',
                        body: line,
                        on: {
                            'click/uploadSourceMap': function () {
                                console.log('upload sourceMap');
                            },
                            'click/uploadSrc': function () {
                                console.log('upload src');
                            }
                        }
                    });
                }, function (err) {
                    Dialog({
                        header: err,
                        body: err
                    });
                });
                
            }).on('change' ,'selectBusiness' , function (){
                var val = $(this).val()-0;

                currentSelectId = val;
                $('#log-table').html('');
                currentIndex = 0;
                noData = false;
                logConfig.id = val;
                showLogs(logConfig);
            }).on('click', 'errorTypeClick', function () {
                if($(this).hasClass('msg-dis')){
                    logConfig.level.push(4);
                    $(this).removeClass('msg-dis');
                }else{
                    logConfig.level.pop(4);
                    $(this).addClass('msg-dis');
                }
                showLogs(logConfig);

            }).on('click', 'logTypeClick', function(){
                if($(this).hasClass('msg-dis')){
                    logConfig.level.push(2);
                    $(this).removeClass('msg-dis');
                }else{
                    logConfig.level.pop(2);
                    $(this).addClass('msg-dis');
                }
                showLogs(logConfig);

            }).on('click', 'debugTypeClick', function () {
                if($(this).hasClass('msg-dis')){
                    logConfig.level.push(1);
                    $(this).removeClass('msg-dis');
                }else{
                    logConfig.level.pop(1);
                    $(this).addClass('msg-dis');
                }
                showLogs(logConfig);
            });


        var throttled = _.throttle(function (e){
            var $this = $(this);
            var top = $this.scrollTop();
            var height = $this.height();
            var scrollHeight =  $this.prop('scrollHeight');

            if(scrollHeight - height - top <= 200 &&　!noData){
                logConfig.id = currentSelectId;
                addLogs(logConfig);
            }


        }, 100);
        $('.main-mid').scroll(throttled);

    }


    function removeValue(value, arr) {
        for (var l = arr.length; l--;) {
            if (arr[l] === value) {
                return arr.splice(l, 1);
            }
        }
    }
    function addLogs(opts){
        if(opts.id <= 0){
            return ;
        }
        var url = '/controller/action/queryLogList.do'
        $.ajax({
            url: url,
            data: {
                id: opts.id,
                startDate: opts.startDate,
                endDate: opts.endDate,
                include: opts.include,
                exclude: opts.exclude,
                index: currentIndex ,
                _t: new Date()-0,
                level:opts.level
            },
            success: function(data) {
                var ret = data.ret;
                if(ret==0){
                    $('#log-table').append(logTable(data.data, {
                        encodeHtml: encodeHtml,
                        set: Delegator.set,
                        startIndex : currentIndex * MAX_LIMIT
                    }));
                    currentIndex ++;
                    if(data.data.length == 0){
                        noData = true;
                    }
                }
            },
            error: function() {
                console.log('error');
            }
        });
    }
    function showLogs(opts) {
        console.log(opts);
        if(opts.id <= 0){
            return ;
        }
        var url = '/controller/action/queryLogList.do'
        $.ajax({
            url: url,
            data: {
                id: opts.id,
                startDate: opts.startDate,
                endDate: opts.endDate,
                include: opts.include,
                exclude: opts.exclude,
                index: 0 ,
                _t: new Date()-0,
                level:opts.level
            },
            success: function(data) {
                currentIndex =0;
                var ret = data.ret;
                if(ret==0){
                    $('#log-table').html(logTable(data.data, {
                        encodeHtml: encodeHtml,
                        set: Delegator.set,
                        startIndex : currentIndex * MAX_LIMIT
                    }));
                    currentIndex ++;
                    if(data.data.length == 0){
                        noData = true;
                    }
                }
                console.log(data);

            },
            error: function() {
                console.log(1);
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