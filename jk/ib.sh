#!/bin/bash
dhclient -r -v
rm -rf /var/lib/dhcp/*
dhclient eth0
