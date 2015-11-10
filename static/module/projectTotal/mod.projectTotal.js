/* global _ */
/**
 * @info 图表统计js
 * @author coverguo
 *
 */
require("jquery/jquery.datetimepicker");
require("charts/highcharts");
require("charts/sand-signika");
var Dialog = require("dialog/dialog");
var statisticsTpl = require("./template/statistics.ejs");

var dayNumber = 0,
    days = [];

var chart_title, chart_projects = [];
var statistics = {
    init: function() {

        this.bindEvent();

    },
    setChart: function(data) {
        $('#chartsContainer').highcharts({ //图表展示容器，与div的id保持一致
            chart: {
                type: 'line' //指定图表的类型，默认是折线图（line）
            },
            title: {
                text: "" //指定图表标题
            },
            xAxis: {
                categories: setChartX(dayNumber)
            },
            yAxis: {
                min: 0,
                title: {
                    text: '报错数量' //指定y轴的标题
                }
            },
            series: chart_projects
        });
    },
    renderTable: function() {
        $('#chart-table').html(statisticsTpl({
            item: chart_projects
        }));
    },
    bindEvent: function() {
        var self = this;
        $('#showCharts').bind("click", function(e) {
            var param = {
                projectId: $("#select-chartBusiness").val(),
                timeScope: $("#select-timeScope").val()
            };
            $.getJSON("/controller/statisticsAction/queryByChartForAdmin.do", param, function(data) {
                var $options = $("#select-chartBusiness option");
                var $selectedOption = $("#select-chartBusiness").find("option:selected");

                chart_projects = [];
                dayNumber = param.timeScope == 1 ? 7 : 30;
                days = setChartX(dayNumber);
                var project = null;
                if (param.projectId == -1) {
                    var projectLength = $options.length;
                    for (var i = 1; i < projectLength; i++) {
                        var defaultData1 = [];
                        setDefaultTotal(defaultData1, dayNumber);
                        project = {
                            name: $options.eq(i).text(),
                            projectId: $options.eq(i).val() - 0,
                            date: days,
                            data: defaultData1
                        };
                        chart_projects.push(project);
                    }
                } else {
                    var defaultData2 = [];
                    setDefaultTotal(defaultData2, dayNumber);
                    project = {
                        name: $selectedOption.text(),
                        projectId: $("#select-chartBusiness").val() - 0,
                        date: days,
                        data: defaultData2
                    };
                    chart_projects.push(project);
                }

                //设置表格title
                chart_title = $("#select-chartBusiness").find("option:selected").text() +
                    $("#select-timeScope").find("option:selected").text() + "统计";
                console.log(data);
                sortChartData(data.data);
                console.log('project', chart_projects);
                self.renderTable();
            });
        });
    }

};

function setChartX(number) {
    var days = [];
    var nowDay = new Date() - 0;

    for (var i = number; i > 0; i--) {
        var day = nowDay - i * 1000 * 60 * 60 * 24;
        days.push(_.formatDate(new Date(day), 'MM-DD'));
    }
    return days;
}

function setDefaultTotal(arr, number) {
    for (var i = number; i > 0; i--) {
        arr.push(0);
    }
}

function whichDayIndex(day1) {
    for (var i = 0, len = days.length; i < len; i++) {
        if (day1 == days[i]) {
            return i;
        }
    }
    return false;
}

function sortChartData(data) {
    for (var i = 0, len = data.length; i < len; i++) {
        data[i].startDate = _.formatDate(new Date(data[i].startDate), 'MM-DD');
        for (var j = 0, length = chart_projects.length; j < length; j++) {
            if (data[i].projectId == chart_projects[j].projectId) {
                chart_projects[j]['data'][whichDayIndex(data[i].startDate)] = data[i].total;
            }
        }
    }
}

module.exports = statistics;