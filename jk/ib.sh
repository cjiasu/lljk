#!/bin/bash
dhclient -r etho
rm -rf /var/lib/dhcp/*
dhclient eth0
