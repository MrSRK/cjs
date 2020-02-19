# CJS
## Vision Group CoreJS

Πλατφόρμα εταιρικής παρουσίασης με δυνατότητα προσθήκης υπηρεσιών ως (Modules)

Base: web.visionadv.gr/cjs

## Installation
Μπορείτε να βρείτε την εγκατάσταση στα:
```git
https://github.com/MrSRK/cjs
```
```bash
npm vision-corejs
```
## Initialize
### app.js
```javascript
    "use strict"
    const dotenv=require('dotenv')
    dotenv.config()
    var CJS=require('./src/cjs')
    var config=require('./config.json')
    const app=new CJS(config)
```
### config.json
```json
    {
        "modules":
        {
            "path":"../modules"
        },
        "lusca":
        {
            "csrf":{
                "angular":true
            },
            "xframe":"SAMEORIGIN",
            "csp":
            {
                "policy":
                [
                    "connect-src 'self'",
                    "default-src 'none'",
                    "img-src 'self'",
                    "script-src 'self'",
                    "style-src 'self'",
                    "font-src 'self'"
                ]

            },
            "p3p":null,
            "hsts":
            {
                "maxAge":31536000,
                "includeSubDomains":true,
                "preload":true
            },
            "xssProtection":true,
            "nosniff":true,
            "referrerPolicy":"same-origin"
        },
        "sass":
        {
            "outputStyle":"compressed",
            "src":"public",
            "dest":"public",
            "maxAge":3888000
        }
    }
```
### .env
```env
    NODE_ENV=development
    NODE_LOG_PATH=log/
    NODE_LOG_INTERVAL=1d
    EXPRESS_PORT=80
    MONGODB_URI=mongodb://localhost:27017/vcjs
    SESSION_SECRET={P45w0rd}
    COOKIE_AGE=604800000
    COOKIE_SECRET={P45w0rd}
```

License
[MIT](https://github.com/MrSRK/cjs/blob/master/license)