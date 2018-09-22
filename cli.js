#!/usr/bin/env node
var http=require('http')
var express=require('express');
var opn=require('opn');

//var storage = require('../src/storage');
var github = require('./lib/route');


var PORT=process.env['PORT']||process.argv[2]||3000;
var app=express();


//just bind module to some route
app.use('/github', github({sessionSecret:'23skidoo',expireDays:90}));
//app.use('/storage', storage({sessionSecret:'23skidoo',expireDays:90}));
app.get('/', function(req,res) {
	res.send('ok')
});

http.createServer(app).listen(PORT);

//Client 
var githubLogin=`http://localhost:${PORT}/github/`

opn(githubLogin);