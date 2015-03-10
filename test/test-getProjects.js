var http = require('http');

var strParams = '';

_.each( item , function (value , ke){
    strParams+=value.id+"_";
});

if(strParams.length >0){
    strParams = "projectsId="+strParams.substring(0 , strParams.length-1   ) + "&";
}

strParams +="auth=badjsAccepter";


http.get( "http://10.143.132.205:9001/getProjects" + '?' + strParams , function (res){
    var buffer = '';
    res.on('end' , function (){
        console.log('ok')
    })

}).on('error' , function (err){
    logger.warn('push project error :' + err);
    callback(err)
})




