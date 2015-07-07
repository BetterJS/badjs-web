var http = require('http');



var strParams="auth=badjsAccepter&projectsId=6_7_911_4_3_5";


http.get( "http://10.143.132.205:9001/getProjects" + '?' + strParams , function (res){
    var buffer = '';
    res.on('end' , function (){
        console.log('ok')
    })

}).on('error' , function (err){
    console.log('push project error :' + err);
})




