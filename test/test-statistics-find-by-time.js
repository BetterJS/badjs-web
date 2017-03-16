  var mysql = require('mysql'),
    StatisticsService = require('../service/StatisticsService'),
    orm = require('orm');

GLOBAL.pjconfig = require('../project.json');
//GLOBAL.DEBUG = true;
var mysqlUrl = GLOBAL.pjconfig.mysql.url

orm.connect( mysqlUrl, function(err , db) {
    if(err){
        throw err;
    }

    global.models = {
        userDao : require('../dao/UserDao')(db),
        applyDao : require('../dao/ApplyDao')(db),
        approveDao : require('../dao/ApproveDao')(db),
        statisticsDao : require('../dao/StatisticsDao')(db),
        db : db
    }


    var ss = new StatisticsService();
    


    var startDate = new Date('2017-01-15 00:00:00');
    var endDate = new Date('2017-02-19 08:00:00');
    
    //fetch data until today
   var ss = new StatisticsService();
    


    var startDate = new Date('2017-01-15 00:00:00');
    var endDate = new Date('2017-02-19 08:00:00');
    
    //fetch data until today
    var fetch = function (id , startDate){
        ss.fetchAndSave(id , startDate , function (){ 
            console.log(id +" : "+  startDate.toLocaleDateString() + " ok ");
            if((startDate -0) > (endDate - 0)  ){  
                console.log("out today");
                return ;
            }   

            setTimeout(function (){ 
                    var a = new Date(startDate)
                    a.setDate( a.getDate() +1) 
                    fetch(id , a); 
            },100)

        })  
    }   


    global.models.applyDao.find({
                    status: 1
                }, function(err, items) {

                var count = 0;
                items.forEach(function (item){
                        count ++ ;
                        setTimeout(function (){
                                fetch(item.id , startDate)
                        },3500 * count )
                        //console.log(item.id)
                })

    })
   // fetch(8 , startDate);

});
