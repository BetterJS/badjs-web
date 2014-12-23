// Created by Mindon Feng @IBG, 7/3, 2012
// SMS/RTX appended by Warpigzhu 7/27, 2012

var http = require('http')
  , _APPKEY = '5d9ea7472a5c4645a617e4eaab72cfa5'; // apply at http://tof.oa.com/, enable IPs of your machine

// --------------------------------------
/*
POST /MessageService.svc HTTP/1.1
User-Agent: WePUSH/1.0
Accept-Encoding: identity
SOAPAction: http://tempuri.org/IMessageService/SendMail
Host: ws.tof.oa.com
Content-Type: text/xml; charset="utf-8"
Content-Length: ###
*/
var TPL_MAIL = '\
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tf="http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Context" xmlns:ts="http://tempuri.org/" xmlns:t="http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Messages.DataContract">\
  <soapenv:Header>\
    <Application_Context>\
      <tf:AppKey>{__APPKEY__}</tf:AppKey>\
    </Application_Context>\
  </soapenv:Header>\
  <soapenv:Body>\
<ts:SendMail>\
  <ts:mail>\
    <t:Bcc>{bcc}</t:Bcc>\
    <t:BodyFormat>Html</t:BodyFormat>\
    <t:CC>{cc}</t:CC>\
    <t:Content>{content}</t:Content>\
    <t:EmailType>SEND_TO_ENCHANGE</t:EmailType>\
    <t:EndTime>{endtime}</t:EndTime>\
    <t:From>{from}</t:From>\
    <t:Location></t:Location>\
    <t:MessageStatus>Queue</t:MessageStatus>\
    <t:Organizer></t:Organizer>\
    <t:Priority>Normal</t:Priority>\
    <t:StartTime>{starttime}</t:StartTime>\
    <t:Title>{title}</t:Title>\
    <t:To>{to}</t:To>\
  </ts:mail>\
</ts:SendMail>\
</soapenv:Body>\
</soapenv:Envelope>\n'.replace(/\s+</g, '<').replace(/\{__APPKEY__\}/g, _APPKEY);

/*
POST /services/passportservice.asmx HTTP/1.1
User-Agent: WePUSH/1.0
Accept-Encoding: identity
SOAPAction: http://indigo.oa.com/services/DecryptTicket
Host: passport.oa.com
Content-Type: text/xml; charset="utf-8"
Content-Length: ###
*/
var TPL_AUTH = '\
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"  xmlns:tns="http://indigo.oa.com/services/" xmlns:tm="http://microsoft.com/wsdl/mime/textMatching/">\
  <soap:Header></soap:Header>\
  <soap:Body>\
    <DecryptTicket xmlns="http://indigo.oa.com/services/">\
      <encryptedTicket xmlns="http://indigo.oa.com/services/">{ticket}</encryptedTicket>\
    </DecryptTicket>\
  </soap:Body>\
</soap:Envelope>\n'.replace(/\s+</g, '<');

//RESPONSE: <DecryptTicketResult><Key></Key><Expiration></Expiration><IsPersistent></IsPersistent><IssueDate></IssueDate><StaffId></StaffId><LoginName></LoginName><ChineseName></ChineseName><DeptId></DeptId><DeptName></DeptName><Version>1</Version><Token></Token></DecryptTicketResult>


var TPL_STAFF = '\
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">\
  <s:Header>\
    <Application_Context xmlns:i="http://www.w3.org/2001/XMLSchema-instance">\
      <AppKey xmlns="http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Context">{__APPKEY__}</AppKey>\
    </Application_Context>\
  </s:Header>\
  <s:Body>\
    <GetStaffInfoByName xmlns="http://tempuri.org/">\
      <loginName>{user}</loginName>\
    </GetStaffInfoByName>\
  </s:Body>\
</s:Envelope>\n'.replace(/\s+</g, '<').replace(/\{__APPKEY__\}/g, _APPKEY);


var TPL_RTX = '\
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tf="http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Context" xmlns:ts="http://tempuri.org/" xmlns:t="http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Messages.DataContract">\
  <soapenv:Header>\
    <Application_Context>\
      <tf:AppKey>{__APPKEY__}</tf:AppKey>\
    </Application_Context>\
  </soapenv:Header>\
  <soapenv:Body>\
    <ts:SendRTX>\
    <ts:message>\
      <t:MsgInfo>{msginfo}</t:MsgInfo>\
      <t:Priority>Normal</t:Priority>\
      <t:Receiver>{receiver}</t:Receiver>\
      <t:Sender>{sender}</t:Sender>\
      <t:Title>{title}</t:Title>\
    </ts:message>\
    </ts:SendRTX>\
  </soapenv:Body>\
</soapenv:Envelope>\n'.replace(/\s+</g, '<').replace(/\{__APPKEY__\}/g, _APPKEY);

var TPL_SMS = '\
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tf="http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Context" xmlns:ts="http://tempuri.org/" xmlns:t="http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Messages.DataContract">\
  <soapenv:Header>\
    <Application_Context>\
      <tf:AppKey>{__APPKEY__}</tf:AppKey>\
    </Application_Context>\
  </soapenv:Header>\
  <soapenv:Body>\
    <ts:SendSMS>\
    <ts:message>\
      <t:MsgInfo>{msginfo}</t:MsgInfo>\
      <t:Priority>Normal</t:Priority>\
      <t:Receiver>{receiver}</t:Receiver>\
      <t:Sender>{sender}</t:Sender>\
    </ts:message>\
    </ts:SendSMS>\
  </soapenv:Body>\
</soapenv:Envelope>\n'.replace(/\s+</g, '<').replace(/\{__APPKEY__\}/g, _APPKEY);


var TPL_WEIXIN = '\
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tf="http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Context" xmlns:ts="http://tempuri.org/" xmlns:t="http://schemas.datacontract.org/2004/07/Tencent.OA.Framework.Messages.DataContract">\
  <soapenv:Header>\
    <Application_Context>\
      <tf:AppKey>{__APPKEY__}</tf:AppKey>\
    </Application_Context>\
  </soapenv:Header>\
  <soapenv:Body>\
    <ts:SendWeiXinMessage>\
    <ts:message>\
      <t:MsgInfo>{msginfo}</t:MsgInfo>\
      <t:Priority>Normal</t:Priority>\
      <t:Receiver>{receiver}</t:Receiver>\
      <t:Sender>{sender}</t:Sender>\
    </ts:message>\
    </ts:SendWeiXinMessage>\
  </soapenv:Body>\
</soapenv:Envelope>\n'.replace(/\s+</g, '<').replace(/\{__APPKEY__\}/g, _APPKEY);


var TPL_SIGNIN = '\
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\
  <soap:Body>\
    <AuthenticateViaToken xmlns="http://indigo.oa.com/services/">\
      <loginName>{user}</loginName>\
      <password>{password}</password>\
    </AuthenticateViaToken>\
  </soap:Body>\
</soap:Envelope>\n'.replace(/\s+</g, '<').replace(/\{__APPKEY__\}/g, _APPKEY);
//http://indigo.oa.com/services/AuthenticateViaToken

// --------------------------------------

// soap
function iSOAP(host, uri, task, data, cb) {
  var port
    , i = host.indexOf(':');
  if( i > -1 ) {
    port = parseInt( host.substr(i +1) );
    host = host.substr(0, i);
  }
  if( !port || port < 0 )
    port = 80;

  var buff = new Buffer(data);

  var options = {
      host: host
    , port: port
    , path: uri
    , method: 'POST'
    , headers: {
      'User-Agent': 'WePUSH/1.0'
     ,'Accept-Encoding': 'UTF-8'
     ,'SOAPAction': task
     ,'Content-Type': 'text/xml; charset="UTF-8"'
     ,'Content-Length': buff.length
     ,'Connection': 'Closed'
    }
  };

  var request = http.request(options, function(response){
    response.setEncoding('utf8');
    var body = '';
    response.on('data', function (chunk) {
      body += chunk;
    });
    response.on('end', function(){
      cb(body);
    });
    request = null;
  });

  request.on('error', function(e){
    cb();
  });

  request.write(buff);
  request.end();
  buff = data = null;
}

// escape xml
function encode( s ) {
  if( !s && !s.toString )
    return '';

  if( typeof(s) !== 'string' )
    s = s.toString();

  return s.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;')        
}

// decode
function decode( s ) {
  if( !s && !s.toString )
    return '';

  if( typeof(s) !== 'string' ) {
    s = s.toString();
  }

  return s.replace(/&gt;/g, '>')
          .replace(/&lt;/g, '<')
          .replace(/&quot;/g, '"')
          .replace(/&apos;/g, '\'')
          .replace(/&amp;/g, '&')        
}

// mail
exports.mail = function(to, title, content, opts, cb) {
  if( content ) {
    if( typeof opts == 'function') {
      cb = opts;
      opts = undefined;
    }
    var data = TPL_MAIL;
    if( opts ) {
      for(var k in opts) {
        data = data.replace('{'+k +'}', encode(opts[k]));
      }
    }
    if( !opts || !opts.from ) {
      console.log( 'opts.from is required' );
      return cb();
    }
    var ts = new Date().toJSON();
    data = data.replace('{endtime}', ts);
    data = data.replace('{starttime}', ts);
    data = data.replace('{to}', encode(to));
    data = data.replace('>{title}<', '>' +encode(title) +'<');
    data = data.replace(/>\{content\}</, '>' + encode(content) +'<');

    data = data.replace(/>\{\w+\}</g, '><'); // trim parameters left

    iSOAP( 'ws.tof.oa.com'
      , '/MessageService.svc'
      , 'http://tempuri.org/IMessageService/SendMail'
      , data, function( res ) {
      if( res ) {
        cb( /<SendMailResult>true<\/SendMailResult>/.test(res) );

      } else {
        cb();
      }
    });
    data = null;

  } else {
    console.log( 'content is required' );
    cb();
  }
};

// passport
exports.passport = function(ticket, cb) {
  if(ticket) {
    var data = TPL_AUTH.replace(/\{ticket\}/gi, encode(ticket));

    iSOAP( 'passport.oa.com'
      , '/services/passportservice.asmx'
      , 'http://indigo.oa.com/services/DecryptTicket'
      , data, function( res ) {
      if( res ) {
        //console.log(res);
        var info = {}
          , m = res.match(/<LoginName>([^<]+)<\/LoginName>/);

        info.LoginName = m ? decode(m[1]) : '';

        m = res.match(/<ChineseName>([^<]+)<\/ChineseName>/);
        if(m) 
          info.ChineseName = decode(m[1]);

        cb(info.LoginName ? info : undefined);

      } else {
        cb();
      }
    });
    data = null;
  } else {
    cb();
  }
};


// staff
exports.staff = function(uid, cb) {
  if( !uid )
    return cb();
  
  var data = TPL_STAFF;
 
  data = data.replace('{user}', uid);

  iSOAP( 'ws.tof.oa.com'
    , '/StaffService.svc'
    , 'http://tempuri.org/IStaffService/GetStaffInfoByName'
    , data, function( res ) {
    cb( res );
  });
  data = null;
};

//RTX
exports.rtx = function(sender, receiver, content, title, cb) {
  if( !content )
    return cb();

  var data = TPL_RTX;
  data = data.replace('{sender}', sender);
  data = data.replace('{receiver}', receiver);
  data = data.replace('>{title}<', '>' +encode(title) +'<');
  data = data.replace('>{msginfo}<', '>' +encode(content) +'<');
  data = data.replace(/>\{\w+\}</g, '><'); // trim parameters left
  iSOAP( 'ws.tof.oa.com'
    , '/MessageService.svc'
    , 'http://tempuri.org/IMessageService/SendRTX'
    , data, function( res ) {
      cb( res );
  });
  data = null;
};

// SMS
exports.sms = function(sender, receiver, content, cb) {
  if( !content )
    return cb();

  var data = TPL_SMS;
  data = data.replace('{sender}', sender);
  data = data.replace('{receiver}', receiver);
  data = data.replace('>{msginfo}<', '>' +encode(content) +'<');
  data = data.replace(/>\{\w+\}</g, '><'); // trim parameters left
  iSOAP( 'ws.tof.oa.com'
    , '/MessageService.svc'
    , 'http://tempuri.org/IMessageService/SendSMS'
    , data, function( res ) {
      cb( res );
  });
  data = null;
};

// WEIXIN
exports.weixin = function(sender, receiver, content, cb) {
  if( !content )
    return cb();

  var data = TPL_WEIXIN;
  data = data.replace('{sender}', sender);
  data = data.replace('{receiver}', receiver);
  data = data.replace('>{msginfo}<', '>' +encode(content) +'<');
  data = data.replace(/>\{\w+\}</g, '><'); // trim parameters left
  iSOAP( 'ws.tof.oa.com'
    , '/MessageService.svc'
    , 'http://tempuri.org/IMessageService/SendWeiXinMessage'
    , data, function( res ) {
      cb( res );
  });
  data = null;
};

// SIGN IN
exports.signin = function(user, password, cb) {
  if( !user || !password )
    return cb();

  var data = TPL_SIGNIN;
  data = data.replace('{user}', user);
  data = data.replace('{password}', password);
  iSOAP( 'passport.oa.com'
    , '/services/passportservice.asmx'
    , 'http://indigo.oa.com/services/AuthenticateViaToken'
    , data, function( res ) {
      cb( res );
  });
  data = null;
};
