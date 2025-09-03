#!/bin/bash

# === Set your API Token here ===
API_TOKEN="c1099bc37c906fd0832d8e783b60ae0dFB204570A7D9753A37B331BA7C74FE035A292DC3"

# --- 1. Login and extract session id ---
curl -s -X POST 'https://hst-api.wialon.com/wialon/ajax.html' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'svc=token/login' \
  --data-urlencode "params={\"token\":\"$API_TOKEN\"}" \
  -o login_response.json

SID=$(jq -r '.eid' login_response.json)
echo "Session ID: $SID"

# --- 2. Get all units (avl_unit) ---
curl -s -X POST 'https://hst-api.wialon.com/wialon/ajax.html' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'svc=core/search_items' \
  --data-urlencode 'params={"spec":{"itemsType":"avl_unit","propName":"sys_name","propValueMask":"*","sortType":"sys_name"},"force":1,"flags":1,"from":0,"to":0}' \
  --data-urlencode "sid=$SID" \
  -o units_response.json

# --- 3. Get all resources (avl_resource) ---
curl -s -X POST 'https://hst-api.wialon.com/wialon/ajax.html' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'svc=core/search_items' \
  --data-urlencode 'params={"spec":{"itemsType":"avl_resource","propName":"sys_name","propValueMask":"*","sortType":"sys_name"},"force":1,"flags":1,"from":0,"to":0}' \
  --data-urlencode "sid=$SID" \
  -o resources_response.json

# --- 4. Get all geofences for a resource (replace RESOURCE_ID) ---
RESOURCE_ID="YOUR_RESOURCE_ID"
curl -s -X POST 'https://hst-api.wialon.com/wialon/ajax.html' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'svc=resource/get_zone_data' \
  --data-urlencode "params={\"itemId\":$RESOURCE_ID,\"flags\":1}" \
  --data-urlencode "sid=$SID" \
  -o geofences_response.json

# --- 5. Get messages for a unit (replace UNIT_ID and TIME_FROM/TO) ---
UNIT_ID="YOUR_UNIT_ID"
TIME_FROM="START_UNIX_TIMESTAMP"
TIME_TO="END_UNIX_TIMESTAMP"
curl -s -X POST 'https://hst-api.wialon.com/wialon/ajax.html' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'svc=messages/load_last' \
  --data-urlencode "params={\"itemId\":$UNIT_ID,\"lastCount\":10,\"flags\":1,\"mode\":1,\"from\":$TIME_FROM,\"to\":$TIME_TO}" \
  --data-urlencode "sid=$SID" \
  -o messages_response.json

# --- Add more curl ... -o responseX.json sections for other endpoints/flags as needed ---

echo "All API calls completed."
