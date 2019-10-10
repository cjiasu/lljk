#!/bin/bash
clear
function check_ip() {
    if [[ $IP =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        FIELD1=$(echo $IP|cut -d. -f1)
        FIELD2=$(echo $IP|cut -d. -f2)
        FIELD3=$(echo $IP|cut -d. -f3)
        FIELD4=$(echo $IP|cut -d. -f4)
        if [ $FIELD1 -eq 42 -a $FIELD2 -le 200 -a $FIELD3 -le 255 -a $FIELD4 -le 255 ]; then
            echo 1
        elif [ $FIELD1 -eq 112 -a $FIELD2 -le 255 -a $FIELD3 -le 255 -a $FIELD4 -le 255 ]; then
            echo 1
        elif [ $FIELD1 -eq 203 -a $FIELD2 -le 218 -a $FIELD3 -le 123 -a $FIELD4 -le 255 ]; then
            echo 1
        elif [ $FIELD1 -eq 168 -a $FIELD2 -le 255 -a $FIELD3 -le 255 -a $FIELD4 -le 255 ]; then
            echo 1
        elif [ $FIELD1 -eq 116 -a $FIELD2 -le 255 -a $FIELD3 -le 255 -a $FIELD4 -le 255 ]; then
            echo 1
        elif [ $FIELD1 -eq 218 -a $FIELD2 -le 255 -a $FIELD3 -le 255 -a $FIELD4 -le 255 ]; then
            echo 1
        else
            echo 0
        fi
    else
        echo 0
    fi
}

for (( i=0; i < 999 ; i++))
do

IP=$(curl -ks ip.sb)
test=$(curl -ks https://cn-shenzhen-aliyun-tcping.torch.njs.app/$IP/22 | grep null)
flag=$(check_ip)

if [[ $test =~ "null" ]];then
echo -e "\033[31mWARNING\033[0m No.$i \033[31m IP:$IP \033[0m TCP block" 
count=$count+1
elif [ $flag -eq 0 ];then
echo -e "\033[31mWARNING\033[0m No.$i \033[31m IP:$IP \033[0m wrong range" 
count=$count+1
else
echo -e "\033[32mTIP\033[0m No.$i Now \033[32m IP:$IP \033[0m"
break
fi

dhclient -r -v
rm -rf /var/lib/dhcp/*
dhclient -v

done
