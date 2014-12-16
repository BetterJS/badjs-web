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
            keywords: [],
            debars: []
        },
        encodeHtml = function (str) {
            return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
        };

    function addKeyword() {
        var value = $.trim($('#keyword-ipt').val());
        if (value !== '') {
            if (!removeValue(value, logConfig.keywords)) {
                $('#keyword-group').append(keyword({
                    value: value
                }, {
                    encodeHtml: encodeHtml,
                    set: Delegator.set
                }));
            }
            logConfig.keywords.push(value);
            $('#keyword-ipt').val('');
        }
    }

    function addDebar() {
        var value = $.trim($('#debar-ipt').val());
        if (value !== '') {
            if (!removeValue(value, logConfig.debars)) {
                $('#debar-group').append(debar({
                    value: value
                }, {
                    encodeHtml: encodeHtml,
                    set: Delegator.set
                }));
            }
            logConfig.debars.push(value);
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
                logConfig.keywords.length = 0;
                $('#keyword-group').empty();
            }).on('click', 'removeKeyword', function (e, value) {
                $(this).closest('.keyword-tag').remove();
                removeValue(value, logConfig.keywords);
            }).on('click', 'addDebar', addDebar)
            .on('keyup', 'addDebar', function (e) {
                if (e.which === 13) addDebar();
            }).on('click', 'removeDebars', function () {
                logConfig.debars.length = 0;
                $('#debar-group').empty();
            }).on('click', 'removeDebar', function (e, value) {
                $(this).closest('.keyword-tag').remove();
                removeValue(value, logConfig.debars);
            }).on('click', 'showLogs', showLogs)
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
                
            });
    }

    function removeValue(value, arr) {
        for (var l = arr.length; l--;) {
            if (arr[l] === value) {
                return arr.splice(l, 1);
            }
        }
    }

    function showLogs() {
        //$.get('/mockup/log.json', function (data) {
        //    $('#log-table').html(logTable(data, {
        //        encodeHtml: encodeHtml,
        //        set: Delegator.set
        //    }));
        //});
        var url = 'http://localhost:3000/controller/action/queryLogList.do'
        $.ajax({
            url: url,
            data: {
                id:'990',
                startDate:1417104000000,
                endDate:1417190400000,
                include:[],
                exclude:[],
                index:0,
                level:[4]
            },
            success: function(data) {

                var ret = data.ret;

                if(ret==0){
                    $('#log-table').html(logTable(data.data, {
                        encodeHtml: encodeHtml,
                        set: Delegator.set
                    }));
                }

            },
            error: function() {

            }
        });

    }

    function init() {
        bindEvent();
        showLogs();
    }

    return {
        init: init
    }

});