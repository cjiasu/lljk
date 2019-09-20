/**
 * Created by Administrator on 2018/4/7/007.
 */
const http = require('http');
//var urllib = require('url');
var exec = require("child_process").exec;
const schedule = require('node-schedule');
//const TelegramBot = require('node-telegram-bot-api');
const cmdStr = "bash /root/changeip/changeip.bash";
const https = require('https');
const ng_req_headers = {
    'Content-Type':'application/json'
};
// replace the value below with the Telegram token you receive from @BotFather
//const token = '953954024:AAFT1QolFvNj1P_B8N9RysBwdCMg9CwyiAc';
//************填写TELEGRAM群组id****************
const group = "-1001275825838";
var old_ip = ""
//************填写机器的名称**************
const server_name = 'HKT-G';
//************填写机器编号****************
const server_no = "G";
//************填写机器CNAME****************
const server_cname = "hkt-cng.mailgung.ml";
// Create a bot that uses 'polling' to fetch new updates
//const bot = new TelegramBot(token, {polling: true});
//填写检测url
//const host_url = "hk.hkt.4h8g.hk-yunying-work01.men";
var send_message = "喵喵喵，我们的HKT好像又被墙了哈哈哈,嗝\n"+
"机器名称: "+server_name+"    \n"+
"机器编号: "+server_no+"   \n"+
"机器CNAME: "+server_cname+"  \n"+
"正在尝试更换ip\n"+
"（POWER BY 良辰）\n"+
"https://taoluyun.cc";
//定时器

schedule.scheduleJob('59/3 * * * * *', function (){
        start_server(function(err,results){
                if(err){
                        console.log(err)
                }else{
                        if(results == "check_success"){
                                console.log("服务器没被墙");
                        }else{
                sendMessage(group, send_message);
                exec(cmdStr, function(err,stdout,stderr){
                    if(err) {
                        console.log('error:'+stderr);
                    } else {
                        //验证IP
                        check_ip(function(e,result){
                            if(e){
                                sendMessage(group, e);
                            }else{
                                sendMessage(group, result);
                            }
                        })
                    }
                });

                        }
                }
        })
});

function start_server(callback) {
        get_ip(function(err,data_ip){
            if(err){
                callback(err);
            }else{
                //data.content=data_ip;
                //console.log(data.content)
                old_ip = data_ip;
                get("http://tcping.singular.vip/api?ipaddr="+data_ip+"&port=22",function (res, status, headers) {
                    if (status==200) {
                        console.log(res)
                        callback(null,res);
                    }else {
                        console.log(res);
                        callback("get_ip fail server:");
                    }
                },"",'utf8').on('error', function (e) {
                    //console.log("xf error: " + e.message);
                    callback("get ip error: " + e.message);
                });
            }
        })
}
function get_ip(callback){
    get("https://ipinfo.io",function (res, status, headers) {
        if (status==200) {
            console.log("get_ip:"+JSON.parse(res).ip)
            var data = JSON.parse(res).ip;
            callback(null,data)
        }else {
            console.log(res);
            callback("get_ip fail server:");
        }
    },ng_req_headers,'utf8').on('error', function (e) {
        //console.log("xf error: " + e.message);
        callback("get ip error: " + e.message);
    });
}
function sendMessage(groupid,message){
    get("http://sendbot.singular.vip/send.php?groupid="+groupid+"&message="+encodeURIComponent(message),function (res, status, headers) {
        if (status==200) {
            console.log("SEND MESSAGE SUCCESS:");
            console.log(res);
        }else {
            console.log("SEND MESSAGE FAILED:");
            console.log(res);
        }
    },ng_req_headers,'utf8').on('error', function (e) {
        //console.log("xf error: " + e.message);
        console.log("SEND MESSAGE fail: " + e.message);
    });
}
function check_ip(callback){
    get("http://ipinfo.io",function (res, status, headers) {
        if (status==200) {
            console.log("get_ip:"+JSON.parse(res).ip)
            var data = JSON.parse(res).ip;
            if(data == old_ip){
                exec(cmdStr, function(err,stdout,stderr){
                    if(err) {
                        console.log('error:'+stderr);
                    } else {
                        console.log(stdout);
                    }
                });
                callback(null,"似乎没更新IP，再尝试一次更换IP(不再通知)")
            }else{
                old_ip = data;
                callback(null,"机器："+server_name+"更新IP成功："+data)
            }

        }else {
            check_ip(callback);
        }
    },ng_req_headers,'utf8').on('error', function (e) {
        //console.log("xf error: " + e.message);
        console.log("get ip error: " + e.message);
        check_ip(callback);
    });
}
function get(url,callback, reqheaders, charset){
    var protocol = getProtocol(url);
    var _defaultCharSet = 'utf8';

    if(typeof charset === 'string' ){
        _defaultCharSet = charset;
    }
    if(typeof(reqheaders) === "string" && charset === undefined) {
        _defaultCharSet = reqheaders;
    }
    var newheader = {};
    if(reqheaders !== undefined && typeof(reqheaders) === "object") {
        for(var ele in reqheaders) {
            newheader[ele.toLowerCase()] = reqheaders[ele];
        }
    }
    newheader["content-length"] = 0;
    var options = {
        host:getHost(url),
        port:getPort(url),
        path:getPath(url),
        method:'GET',
        headers:newheader
    };

    if(protocol === http || protocol === https){
        return _sendReq(protocol,null,options,_defaultCharSet,callback);
    }else{
        throw "sorry,this protocol do not support now";
    }

}

function _sendReq(protocol,data,options,_defaultCharSet,callback){
    var content = "";
    var req = protocol.request(options,function(res){
        var status = res.statusCode;
        var headers = res.headers;
        if(_defaultCharSet==="gbk"){
            res.setEncoding('binary');
        }else{
            res.setEncoding(_defaultCharSet);
        }
        res.on('data',function(chunk){
            content+=chunk;
        });
        res.on('end',function(){
            if(_defaultCharSet==="gbk"){
                content = iconv.decode(new Buffer(content,'binary'),'gbk');
            }
            callback(content,status,headers);
        });
    });
    if(null != data){
        req.write(data+"\n");
    }
    req.end();
    return req;
}
function getProtocol(url){
    return url.substring(0,url.indexOf(":")) === 'https' ? https : http;;
}
function getPort(url) {
    var hostPattern = /\w+:\/\/([^\/]+)(\/)?/i;
    var domain = url.match(hostPattern);

    var pos = domain[1].indexOf(":");
    if(pos !== -1) {
        domain[1] = domain[1].substr(pos + 1);
        return parseInt(domain[1]);
    } else if(url.toLowerCase().substr(0, 5) === "https") return 443;
    else return 80;
}
function getHost(url){
    var hostPattern = /\w+:\/\/([^\/]+)(\/)?/i;
    var domain = url.match(hostPattern);

    var pos = domain[1].indexOf(":");
    if(pos !== -1) {
        domain[1] = domain[1].substring(0, pos);
    }
    return domain[1];
}
function getPath(url){
    var pathPattern = /\w+:\/\/([^\/]+)(\/.+)(\/$)?/i;
    var fullPath = url.match(pathPattern);
    return fullPath?fullPath[2]:'/';
}
