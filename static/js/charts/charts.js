/**
 * @info 图表统计js
 * @author coverguo
 * */

define([ '../dialog',
], function ( Dialog) {



    var statistics = {
        init : function (){

            this.bindEvent();

        },
        setChart : function (data) {
            $('#chartsContainer').highcharts({                   //图表展示容器，与div的id保持一致
                chart: {
                    type: 'line'                         //指定图表的类型，默认是折线图（line）
                },
                title: {
                    text:  chart_title  //指定图表标题
                },
                xAxis: {
                    categories: chart_x
                },
                yAxis: {
                    title: {
                        text: 'something'                  //指定y轴的标题
                    }
                },
                series: [chart_series]
            });
        },
        bindEvent : function (){
            var self = this;
            $('#showCharts').bind("click" , function(e){
                var param = {
                    projectId : $("#select-chartBusiness").val(),
                    timeScope : $("#select-timeScope").val()
                };
                console.log(param);
                $.getJSON("/controller/statisticsAction/queryByChart.do" , param , function (data){

                    console.log(data);
                    sortChartData(data.data);
                    self.setChart();
                });
            });
        }

    };
    //
    var chart_x = [], chart_series = {},chart_title;
    function sortChartData(data){
        chart_title = $("#select-chartBusiness").find("option:selected").text() + $("#select-timeScope").find("option:selected").text()+"统计";
        var text = $("#select-chartBusiness").find("option:selected").text();
        chart_series.name = text;
        chart_series.data = [];
        console.log(chart_series);
        for(var i = 0;i<data.length; i++){
            chart_x.push(_.formatDate(new Date(data[i].startDate) , 'YYYY-MM-DD'));
            chart_series.data.push(data[i].total);
        };
    }

    return statistics;

});