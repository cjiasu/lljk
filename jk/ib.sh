#!/bin/bash
dhclient -r -v
rm -rf /var/lib/dhclient/*
dhclient -v
