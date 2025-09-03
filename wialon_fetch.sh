#!/bin/bash

# 1. Get login/session JSON
curl -s -X POST 'https://hst-api.wialon.com/wialon/ajax.html' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'svc=token/login' \
  --data-urlencode 'params={"token":"c1099bc37c906fd0832d8e783b60ae0dFB204570A7D9753A37B331BA7C74FE035A292DC3"}' \
  -o login_response.json

# 2. Extract eid (session id)
sid=$(jq -r '.eid' < login_response.json)
echo "Session ID: $sid"

# 3. Search for AVL units and save result
curl -s -X POST 'https://hst-api.wialon.com/wialon/ajax.html' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'svc=core/search_items' \
  --data-urlencode 'params={"spec":{"itemsType":"avl_unit","propName":"sys_name","propValueMask":"*","sortType":"sys_name"},"force":1,"flags":1,"from":0,"to":0}' \
  --data-urlencode "sid=$sid" \
  -o units_response.json
