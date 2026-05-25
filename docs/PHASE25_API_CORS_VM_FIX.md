# Phase 25 API CORS / VM Browser Fix

When Web runs on `:3000` and API runs on `:4000`, browser fetches are cross-origin.

Directly opening the API URL in the browser can work while frontend fetches fail because of CORS.

Test:

```bash
curl -i \
  -H "Origin: http://192.168.133.131:3000" \
  http://192.168.133.131:4000/api/setup/status
```

The response must include:

```txt
access-control-allow-origin: http://192.168.133.131:3000
```
