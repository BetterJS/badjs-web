define([
    '../delegator',
    '../dialog'//,
    './module/logTable.tpl',
    './module/keyword.tpl',
    './module/debar.tpl'
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


    var maxDate = 60*60*1000*24 *2;


    var currentSelectId = -1, currentIndex = 0  , noData = false , MAX_LIMIT = 500 , loading = false;

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
                window.location.href = "http://localhost/apply.html";
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
                console.log('data', endTime);
                logConfig.startDate =  startTime == '' ? new Date().getTime()-maxDate : new Date(startTime).getTime();
                logConfig.endDate = endTime == '' ? new Date().getTime() : new Date(endTime).getTime();
                console.log('data', logConfig);
                //测试时间是否符合
                if(isTimeRight(logConfig.startDate, logConfig.endDate)){
                    showLogs(logConfig, false);
                }

            })
            .on('click', 'showSource', function (e, data) {
                require([
                    './../beautify',
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
              //  showLogs(logConfig, false);

            }).on('click', 'errorTypeClick', function () {
                if($(this).hasClass('msg-dis')){
                    logConfig.level.push(4);
                    $(this).removeClass('msg-dis');
                }else{
                    logConfig.level.splice($.inArray(4,logConfig.level),1);
                    $(this).addClass('msg-dis');
                }
                console.log('log', logConfig.level);
               // showLogs(logConfig, false);

            }).on('click', 'logTypeClick', function(){
                if($(this).hasClass('msg-dis')){
                    logConfig.level.push(2);
                    $(this).removeClass('msg-dis');
                }else{
                    logConfig.level.splice($.inArray(2,logConfig.level),1);
                    $(this).addClass('msg-dis');
                }

             //   showLogs(logConfig, false);

            }).on('click', 'debugTypeClick', function () {
                if($(this).hasClass('msg-dis')){
                    logConfig.level.push(1);
                    $(this).removeClass('msg-dis');
                }else{
                    logConfig.level.splice($.inArray(1,logConfig.level),1);
                    $(this).addClass('msg-dis');
                }
           //     showLogs(logConfig, false);
            });


        var throttled = _.throttle(function (e){
            var $this = $(this);
            var top = $this.scrollTop();
            var height = $this.height();
            var scrollHeight =  $this.prop('scrollHeight');

            if(scrollHeight - height - top <= 200 &&　!noData){
                logConfig.id = currentSelectId;
                showLogs(logConfig, true);
            }


        }, 100);
        $('.main-mid').scroll(throttled);

    }

    function isTimeRight(begin, end){
        if(begin > end){
            Dialog({
                header: '时间范围错误',
                body:'结束时间必须在开始时间之后！'
            });
            return false;
        }else if(end - maxDate  > begin){
                Dialog({
                    header: '时间范围错误',
                    body:'结束时间和开始时间间隔需在三天之内！'
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



    function showLogs(opts,  isAdd) {

        if(opts.id <= 0 || loading){
            return ;
        }

        loading = true;

        if(!isAdd){
            currentIndex =0;
            noData = false;
        }

        var url = '/controller/action/queryLogList.do';
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
                    var param = {
                        encodeHtml: encodeHtml,
                        set: Delegator.set,
                        startIndex : currentIndex * MAX_LIMIT
                    }
                    if(isAdd){
                        $('#log-table').append(logTable(data.data, param));
                    }else{
                        $('#log-table').html(logTable(data.data, param));
                    }

                    currentIndex ++;
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
        $(".datetimepicker").datetimepicker({format: 'YYYY-MM-DD HH:mm'}).data("DateTimePicker").setMaxDate(new Date());

        $('#startTime').data("DateTimePicker").setDate( new Date(new Date() - maxDate));
        $('#endTime').data("DateTimePicker").setDate( new Date());

    }

    return {
        init: init
    }

});