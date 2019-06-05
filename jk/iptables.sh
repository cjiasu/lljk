#!/bin/sh

local_ip="10.0.0.4"
s_port="80"
d_port="465"
d_domain="hkt-cna.mailgung.ml"
l_log="dyn_ip"


get_ip=`ping -c 1 $d_domain | grep 'PING' | awk '{print $3}' | sed 's/[(,)]//g'`

cd `dirname $0`

if [ -e './$l_log.txt' ]; then
	old_ip=`tail ./$l_log.txt -n 1`
	if ! [ "$old_ip" = "$get_ip"  ]; then
	`/sbin/iptables -t nat -D PREROUTING -d $local_ip/32 -p tcp -m tcp --dport $s_port -j DNAT --to-destination $old_ip:$d_port`
	`/sbin/iptables -t nat -D POSTROUTING -d $old_ip/32 -p tcp -m tcp --dport $d_port -j SNAT --to-source $local_ip`
        `/sbin/iptables -t nat -D PREROUTING -d $local_ip/32 -p udp -m udp --dport $s_port -j DNAT --to-destination $old_ip:$d_port`
        `/sbin/iptables -t nat -D POSTROUTING -d $old_ip/32 -p udp -m udp --dport $d_port -j SNAT --to-source $local_ip`

	`/sbin/iptables -t nat -A PREROUTING -d $local_ip/32 -p tcp -m tcp --dport $s_port -j DNAT --to-destination $get_ip:$d_port`
	`/sbin/iptables -t nat -A POSTROUTING -d $get_ip/32 -p tcp -m tcp --dport $d_port -j SNAT --to-source $local_ip`
        `/sbin/iptables -t nat -A PREROUTING -d $local_ip/32 -p udp -m udp --dport $s_port -j DNAT --to-destination $get_ip:$d_port`
	`/sbin/iptables -t nat -A POSTROUTING -d $get_ip/32 -p udp -m udp --dport $d_port -j SNAT --to-source $local_ip`

		echo $get_ip >> ./$l_log.txt
	fi
else
	echo $get_ip >> ./$l_log.txt
	`/sbin/iptables -t nat -A PREROUTING -d $local_ip/32 -p tcp -m tcp --dport $s_port -j DNAT --to-destination $get_ip:$d_port`
	`/sbin/iptables -t nat -A POSTROUTING -d $get_ip/32 -p tcp -m tcp --dport $d_port -j SNAT --to-source $local_ip`
        `/sbin/iptables -t nat -A PREROUTING -d $local_ip/32 -p udp -m udp --dport $s_port -j DNAT --to-destination $get_ip:$d_port`
        `/sbin/iptables -t nat -A POSTROUTING -d $get_ip/32 -p udp -m udp --dport $d_port -j SNAT --to-source $local_ip`	
fi
