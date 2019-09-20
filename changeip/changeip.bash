#!/bin/bash
dhclient -r ens18
sleep 3
rm -rf /var/lib/dhcp/*
sleep 3
dhclient ens18
