#!/bin/bash
clear
for (( i=1; i > 0 ; i++))
do

NIC=ens18
ip=$(curl -ks -m 10 ip.sb)
test=$(curl -ks -m 10 baidu.com | egrep -h "Empty|html")

if [[ $test =~ "null" ]];then
echo -e "\033[31mWARNING\033[0m $(date "+%Y-%m-%d %T") \033[31m IP:$ip \033[0m TCP block" 
count=$count+1
else
echo -e "\033[32mTip\033[0m $(date "+%Y-%m-%d %T") Now \033[32m IP:$ip \033[0m"
count=$count+1
sleep 30
continue
fi

dhclient -r $NIC
rm -rf /var/lib/dhcp/*
dhclient $NIC
sleep 30

done
