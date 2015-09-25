#badjs-storage

> badjs manage system . 


# 启动参数
--debug  log 采用debug 级别, 默认使用info 

--project 使用测试环境（ project.debug.json ）配置 ， 默认使用 project.json


# 配置说明
```
{
    "host" : "http://badjs.server.com/",   //配额管理服务器地址，用于邮件中的图片展示
    "mysql" : {
        "url" : "mysql://badjs:pass4badjs@10.134.5.103:3306/badjs"  // mysql 地址
    },
    "storage" : {         // 存储服务器的地址， 这里配置badjs-storage 的地址
        "errorMsgTopUrl" : "http://10.143.132.205:9000/errorMsgTop",
        "errorMsgTopCacheUrl" : "http://10.143.132.205:9000/errorMsgTopCache",
        "queryUrl" : "http://10.143.132.205:9000/query"
    },
    "acceptor": {     //badjs-acceptor 模块的地址， 这里用于同步审核通过的业务id 到接入层进行验证
        "pushProjectUrl" : "http://10.143.132.205:9001/getProjects"
    },
    "zmq" : {       // badjs-mq 的地址  
        "url" : "tcp://10.143.132.205:10000",
        "subscribe" : "badjs"     // 跟 badjs-aceptor 中的subscribe 对应
    },
    "email": {      // 发送 email 配置
        "homepage": "http://badjs.server.com/user/index.html",  // 邮件中的 快捷入口
        "from": "noreply-badjs@tencent.com",                    //邮件中的发送者名字
        "smtp": "smtp.tencent.com",                             // smtp 服务器
        "emailSuffix" : "@tencent.com",         //收件人的邮件后缀，收件人地址 username +  emailSuffix
        "time": "09:00:00",                     // 几点发送邮件
        "top": 20,                            //邮件只发送错误排名的配置的top20
        "module": "email_tof"                 // 邮件发送模块
    },
    "oos" : {                                 //接入公司的统一登录， 删掉使用系统自己的用户管理
        "module":"tencent/tencentoos"
    }
}
```
