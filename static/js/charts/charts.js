/**
 * @info 申请列表js
 * @author coverguo
 * */

define([
    '../dialog'
], function ( Dialog ) {
    var maxDate = 60*60*1000*24 *2;
    var   encodeHtml = function (str) {
        return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
    };

    function bindEvent() {


    }

    function init() {
        $(".datetimepicker").datetimepicker({format: 'YYYY-MM-DD HH:mm'}).data("DateTimePicker").setMaxDate(new Date());

        $('#startTime').data("DateTimePicker").setDate( new Date(new Date() - maxDate));
        $('#endTime').data("DateTimePicker").setDate( new Date());

        $(function () {
            $('#chartsContainer').highcharts({                   //图表展示容器，与div的id保持一致
                chart: {
                    type: 'line'                         //指定图表的类型，默认是折线图（line）
                },
                title: {
                    text: '想回到过去2015-01-19至2015-01-21统计图表'      //指定图表标题
                },
                xAxis: {
                    categories: ['20-00am', '20-12am', '21-00am','20-00am', '20-12am', '21-00am','20-00am', '20-12am', '21-00am','20-00am', '20-12am', '21-00am']   //指定x轴分组
                },
                yAxis: {
                    title: {
                        text: 'something'                  //指定y轴的标题
                    }
                },
                series: [{                                 //指定数据列
                    name: 'Jane',                          //数据列名
                    data: [1, 100, 24, 31, 0, 4, 1, 0, 4, 1, 0, 4, 1, 0, 4]                        //数据
                }, {
                    name: 'John',
                    data: [5, 87, 23,34, 2, 1, 6, 4, 2, 7, 3, 7, 2, 7, 2]
                }]
            });
        });


    }

    return {
        init: init
    }

});