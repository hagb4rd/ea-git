# ea-git

see also https://www.npmjs.com/package/ea-session-storage

`npm install --save ea-git`

Setup environment variables:

`GITHUB_CLIENT_ID`

`GITHUB_CLIENT_SECRET`

## Usage with express
```javascript
var http = require('http');
var express = require('express');
var git = require('ea-git');

var app=express();
var PORT=3000;

//bind to some route, providing a session secret, and cookie expiration date
app.use('/github', git({sessionSecret:'hello kitty',expireDays:90}));

//start server 
http.createServer(app).listen(PORT);
```
## In the browser
```html
<!-- Get (automatically generated) Client API -->
<a href="http://localhost:3000/github/login">github login</a>
```
