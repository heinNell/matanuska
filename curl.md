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


curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $YOUR_ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20240620","max_tokens":8,"messages":[{"role":"user","content":"ping"}]}'




import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.VITE_MORPH_API_KEY,
  baseURL: "https://api.morphllm.com/v1",
});

const response = await openai.chat.completions.create({
  model: "morph-v3-large",
  messages: [
    {
      role: "user",
      content: `<instruction>${instructions}</instruction>\n<code>${initialCode}</code>\n<update>${codeEdit}</update>`,
    },
  ],
});

const mergedCode = response.choices[0].message.content;


curl -X POST "https://api.morphllm.com/v1/chat/completions" \
  -H "Authorization: Bearer $sk-WDqGHerNUY-WQjzpeqPGVQfBUVRogJbjHbHkAHWx0pvjH34" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "morph-v3-large",
    "messages": [
      {
        "role": "user",
        "content": "<instruction>INSTRUCTIONS</instruction>\n<code>INITIAL_CODE</code>\n<update>CODE_EDIT</update>"
      }
    ]
  }'
