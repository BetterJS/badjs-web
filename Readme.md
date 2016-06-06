#badjs-storage

> badjs manage system .

# 运行
```javascript
node app.js
```

# 启动参数
--debug  log 采用debug 级别, 默认使用info

--project 使用测试环境（ project.debug.json ）配置 ， 默认使用 project.json

# 构建
静态页面使用webpack ，开发阶段使用
```javascript
webpack -w
```
上线阶段需要打包打包命令
```javascript
webpack
```

# 数据库初始化
db/create.sql 是需要初始化到 mysql 的中。其中默认的超级管理员帐号是 admin ， 密码是 admin
# 配置说明
```
{
    "host" : "http://badjs.server.com/",   //配额管理服务器地址，用于邮件中的图片展示
    "mysql" : {
           "url" : "mysql://root:root@localhost:3306/badjs" // mysql 地址
    },
    "storage" : {         // 存储服务器的地址， 这里配置badjs-storage 的地址
        "errorMsgTopUrl" : "http://127.0.0.1:9000/errorMsgTop",
      "errorMsgTopCacheUrl" : "http://127.0.0.1:9000/errorMsgTopCache",
        "queryUrl" : "http://127.0.0.1:9000/query"
    },
    "acceptor": {     //badjs-acceptor 模块的地址， 这里用于同步审核通过的业务的id 到接入层进行验证
          "pushProjectUrl" : "http://127.0.0.1:9001/getProjects"
    },
     "openapi": {        //badjs-acceptor 模块的地址， 这里用于同步审核通过的业务的appkey 到openapi 进行验证
        "pushProjectUrl" : "http://127.0.0.1:9002/getProjects"
    },
    "mq" : {       // badjs-mq 的地址
        "url" : "tcp://127.0.0.1:10000",
        "subscribe" : "badjs"     // 跟 badjs-aceptor 中的subscribe 对应
         "module": "axon"      // 指定 mq 模块， 
    },
    "email": {      // 发送 email 配置
        "homepage": "http://badjs.server.com/user/index.html",  // 邮件中的 快捷入口
        "from": "noreply-badjs@demo.com",                    //邮件中的发送者名字
        "smtp": "smtp.demo.com",                             // smtp 服务器
        "emailSuffix" : "@demo.com",         //收件人的邮件后缀，收件人地址 username +  emailSuffix
        "time": "09:00:00",                     // 几点发送邮件
        "top": 20,                            //邮件只发送错误排名的配置的top20
        "module": "email"                 // 邮件发送模块
    },
    "oos" : {                                 //接入公司的统一登录， 删掉使用系统自己的用户管理
        "module":"demo/demooos"
    }
}
```

# oos 接入
查看当前目录的 oos/demooos.js 如何处理。
> 腾讯内部接入可以[参考](https://github.com/BetterJS/oos-tencent)
