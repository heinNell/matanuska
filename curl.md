curl -X POST 'https://hst-api.wialon.com/wialon/ajax.html' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'svc=token/login' \
  --data-urlencode 'params={"token":"c1099bc37c906fd0832d8e783b60ae0dFB204570A7D9753A37B331BA7C74FE035A292DC3"}'


sid=$(curl -s -X POST 'https://hst-api.wialon.com/wialon/ajax.html' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'svc=token/login' \
  --data-urlencode 'params={"token":"c1099bc37c906fd0832d8e783b60ae0dFB204570A7D9753A37B331BA7C74FE035A292DC3"}' | jq -r '.eid')

curl -X POST 'https://hst-api.wialon.com/wialon/ajax.html' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'svc=core/search_items' \
  --data-urlencode 'params={"spec":{"itemsType":"avl_unit","propName":"sys_name","propValueMask":"*","sortType":"sys_name"},"force":1,"flags":1,"from":0,"to":0}' \
  --data-urlencode "sid=$sid"
