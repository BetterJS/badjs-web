
if(!_){
    _={};
}

_.formatDate= function(date, formatString){
    /*
     * eg:formatString="YYYY-MM-DD hh:mm:ss";
     */
    var o = {
        "M+" : date.getMonth()+1,    //month
        "D+" : date.getDate(),    //day
        "h+" : date.getHours(),    //hour
        "m+" : date.getMinutes(),    //minute
        "s+" : date.getSeconds(),    //second
        "q+" : Math.floor((date.getMonth()+3)/3),    //quarter
        "S" : date.getMilliseconds()    //millisecond
    }

    if(/(Y+)/.test(formatString)){
        formatString = formatString.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o){
        if(new RegExp("("+ k +")").test(formatString)){
            formatString = formatString.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return formatString;
}