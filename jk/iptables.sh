#!/bin/sh

local_ip=""
s_port=""
d_port=""
d_domain=""

get_ip=`ping -c 1 $d_domain | grep 'PING' | awk '{print $3}' | sed 's/[(,)]//g'`

cd `dirname $0`

if [ -e './dyn_ip.txt' ]; then
	old_ip=`tail ./dyn_ip.txt -n 1`
	if ! [ "$old_ip" = "$get_ip"  ]; then
		`iptables -t nat -D PREROUTING -d $local_ip/32 -p tcp -m tcp --dport $s_port -j DNAT --to-destination $old_ip:$d_port`
		`iptables -t nat -D POSTROUTING -d $old_ip/32 -p tcp -m tcp --dport $d_port -j SNAT --to-source $local_ip`
		`iptables -t nat -A PREROUTING -d $local_ip/32 -p tcp -m tcp --dport $s_port -j DNAT --to-destination $get_ip:$d_port`
		`iptables -t nat -A POSTROUTING -d $get_ip/32 -p tcp -m tcp --dport $d_port -j SNAT --to-source $local_ip`
		`iptables -t nat -D PREROUTING -d $local_ip/32 -p udp -m udp --dport $s_port -j DNAT --to-destination $old_ip:$d_port`
		`iptables -t nat -D POSTROUTING -d $old_ip/32 -p udp -m udp --dport $d_port -j SNAT --to-source $local_ip`
		`iptables -t nat -A PREROUTING -d $local_ip/32 -p udp -m udp --dport $s_port -j DNAT --to-destination $get_ip:$d_port`
		`iptables -t nat -A POSTROUTING -d $get_ip/32 -p udp -m udp --dport $d_port -j SNAT --to-source $local_ip`
		
		echo $get_ip >> ./dyn_ip.txt
	fi
else
	echo $get_ip >> ./dyn_ip.txt
	`iptables -t nat -A PREROUTING -d $local_ip/32 -p tcp -m tcp --dport $s_port -j DNAT --to-destination $get_ip:$d_port`
	`iptables -t nat -A POSTROUTING -d $get_ip/32 -p tcp -m tcp --dport $d_port -j SNAT --to-source $local_ip` 
    `iptables -t nat -A PREROUTING -d $local_ip/32 -p udp -m udp --dport $s_port -j DNAT --to-destination $get_ip:$d_port`
	`iptables -t nat -A POSTROUTING -d $get_ip/32 -p udp -m udp --dport $d_port -j SNAT --to-source $local_ip`
fi
