#!/bin/bash
dhclient -r ens18
rm -rf /var/lib/dhcp/*
dhclient ens18
