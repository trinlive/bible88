#!/bin/bash
# Author: Alan Fuller, Fullworks
# loop through all disks within this project  and create a snapshot
gcloud compute disks snapshot vm-iam7 --snapshot-names auto-daily-vm-iam7-$(date "+%Y-%m-%d-%s") --zone asia-southeast1-c
#
# snapshots are incremental and dont need to be deleted, deleting snapshots will merge snapshots, so deleting doesn't loose anything
# having too many snapshots is unwiedly so this script deletes them after 60 days
#
if [[ $(uname) == "Linux" ]]; then
  from_date=$(date -d "-7 days" "+%Y-%m-%d")
else
  from_date=$(date -v -7d "+%Y-%m-%d")
fi
gcloud compute snapshots list --filter="creationTimestamp<$from_date" --regexp "(auto-daily.*)" --uri | while read SNAPSHOT_URI; do
   gcloud compute snapshots delete $SNAPSHOT_URI  --quiet
done
#