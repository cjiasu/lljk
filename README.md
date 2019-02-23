# lljk
流量监控
git clone -b master https://github.com/cjiasu/lljk.git lljk  && mv /root/lljk/jk/ /root && mv -b /root/jk/rc.local /etc/ && chmod +x /etc/rc.local && rm -rf lljk

cd jk 

chmod +x jk.py

python jk.py &


查看任务 

ps -ef|grep python

查看流量

cat /root/newnetcardtransdata.txt

清空流量

rm -f /root/newnetcardtransdata.txt

设置流量上限

vi /root/jk.py



