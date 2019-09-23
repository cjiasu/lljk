/**
 * Created by 良辰 2019/9/21.
 */
const http = require('http');
const https = require('https');
var exec = require("child_process").exec;
const schedule = require('node-schedule');
const cmdStr = "bash /root/changeip/changeip.bash";
const ng_req_headers = {
    'Content-Type':'application/json'
};

//************填写TELEGRAM群组id或者username****************
const group = "-1001215974610";
//************填写机器的名称**************
const server_name = 'HKT-A';
//************填写机器编号****************
const server_no = "1";
//************填写机器CNAME****************
const server_cname = "hk-cna";
//************填写TCP检测端口****************
const CHECK_PORT = 22;
//************填写推送内容****************
var send_message = "我们的"+server_name+"好像又被墙了，嘤嘤嘤\n"+
"机器名称: "+server_name+"    \n"+
"机器编号: "+server_no+"   \n"+
"机器CNAME: "+server_cname+"  \n"+
"垂死病中惊坐起，起来继续换IP\n"+
"（POWER BY 良辰）\n";
//定时器

schedule.scheduleJob('59/3 * * * * *', function (){
	start_server();
});

function start_server() {
	get_ip(function(err,data_ip){
            if(err){
                console.log(err);
            }else{
                //检测是否被墙
                old_ip = data_ip;
                get("http://tcping.singular.vip/api?ipaddr="+data_ip+"&port="+CHECK_PORT,function (res, status, headers) {
                    if (status==200) {
                        //console.log(res)
                        //callback(null,res);
                        //处理逻辑
                        if(res == "check_success"){
                            console.log("服务器没被墙");
                        }else{
                            //被墙了
                            //推送消息
                            sendMessage(group, send_message);
                            //执行换ip
                            change_new_ip();
                        }

                    }else {
                        console.log(res);
                        sendMessage(group, "TCP检测接口故障："+res);
                    }
                },"",'utf8').on('error', function (e) {
                    console.log("TCP检测接口故障：: " + e.message);
                    sendMessage(group, "TCP检测接口故障："+e.message);
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
function check_ip(num){
    get("http://ipinfo.io",function (res, status, headers) {
        if (status==200) {
            console.log("get_ip:"+JSON.parse(res).ip)
            var data = JSON.parse(res).ip;
            if(data == old_ip){
                change_new_ip(1);
				if(num == undefined){
					sendMessage(group, "似乎没更新IP，正在使劲刷IP");
				}
            }else{
                let temp_ip = old_ip;
                old_ip = data;
                sendMessage(group,"旧IP"+temp_ip+"的机器："+server_name+"更新IP成功："+data);
                start_server();
            }
            
        }else {
            check_ip();
        }
    },ng_req_headers,'utf8').on('error', function (e) {
        //console.log("xf error: " + e.message);
        console.log("get ip error: " + e.message);
        check_ip();
    });
}
function change_new_ip(num){
    exec(cmdStr, function(err,stdout,stderr){
        if(err) {
            console.log('error:'+stderr);
            sendMessage(group, "更换IP命令执行出错，请检查代码："+e.message);
        } else {
            //验证IP
            check_ip(num);
        }
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
