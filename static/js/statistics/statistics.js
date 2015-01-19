/**
 * @info 用户列表js
 * @author coverguo
 * */

define([ '../dialog',
    'template/statistics.tpl'
], function ( Dialog, statisticsTpl ) {



    var statistics = {
        init : function (){

            var maxDate = 60*60*1000*24 *1;

            $(".datetimepicker").datetimepicker({format: 'YYYY-MM-DD'}).data("DateTimePicker").setMaxDate(new Date());

            $('#startTime').data("DateTimePicker").setDate( new Date(new Date() - maxDate));

            this.bindEvent();

        },
        bindEvent : function (){
            $('#showLogs').bind("click" , function(e){
                var projectId = $("#select-business").val();

                if(isNaN(projectId) || projectId<0){
                    return ;
                }

                $.getJSON("/controller/statisticsAction/queryById.do" , {projectId : projectId , startDate : $('#startTime').val()} , function (data){
                        $('#table-content').html(statisticsTpl(data));
                });
            });
        }

    }

    return statistics;

});