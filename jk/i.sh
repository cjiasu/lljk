#!/bin/bash
dhclient -r -v ens18
rm -f /var/lib/dhclient/dhclient.leases
dhclient -v ens18
