var credentials=require('./credentials');
var express=require('express');
var url = require('url');
var querystring = require('querystring');
var path=require('path');
var express = require('express');

var session = require('express-session');
//var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var SQLiteStore = require('connect-sqlite3')(session);
var API=require('./api');
var hh=require('cli-highlight');



var readToEnd = (stream,lastcb) => new Promise((resolve, reject)=>{ 
	var text=[]; 
	stream.on("data", chunk=>{ 
		text.push(chunk); 
	});  
	stream.on("end", chunk=>{
		if(chunk) { 
			text.push(chunk);
		};
		resolve(text.join(""));
	});
	stream.on("error", e=>{
		reject(e);
	});
})


module.exports= ({sessionSecret,expireDays}) => {
	if(sessionSecret==null) 
		throw TypeError('Missing Argument: sessionSecret')

	expireDays=expireDays||90;


	var api=express.Router();


	api.use(function(req,res,next){
		readToEnd(req).then(body=>{ req.bodyText=body; next(); return req; });
	});
	api.use(cookieParser());
	//*
	api.use(session({
		store: new SQLiteStore,
		secret: sessionSecret,
		cookie: { maxAge: expireDays * (24 * 60 * 60 * 1000) }, // expires in n days
		saveUninitialized: true,
		resave: true
	}));
	/* */
	/*
	api.use(function(req,res,next){ 
		if(!req.session) {
			var sess=session({
				store: new SQLiteStore,
				secret: sessionSecret,
				cookie: { maxAge: expireDays * (24 * 60 * 60 * 1000) }, // expires in n days
				saveUninitialized: true,
				resave: false
			})
			sess(req,res,next);
		} else {
			next();
		}
	});
	/* */

	//init storage in session middleware  
	api.use(function(req,res,next){
		res.setHeader('Access-Control-Allow-Origin', '*');
		if(req.session) {
			if(!req.session.github) {
				req.session.github={}
			} else {
				if(req.session.github.token) {
					API.setAccessToken(req.session.github.token);
				}
			}

			req.session.save();
		}
		next()
	})


	
	api.get('/callback', function(req,res) {
		if(!req.query) {
			console.log('building query');
			var url=new URL(req.url);
			req.query=querystring.parse(url.searchParams);
		}
		if(!req.query.code) {
			res.setHeader('Content-Type', 'text/html');
			var html=require('fs').readFileSync(require('path').resolve(__dirname, '../public/callback.html'), {encoding: 'utf8'});
			res.send(html);
		} else {
			API.getAccessToken(req.query.code).then(token=>{
				req.session.github.token=token;
				req.session.save();
				API.setAccessToken(token);
				return token;
			})
			.then(token=>{
				return API.getUser().then(user=>{
					req.session.github.user = user;
					req.session.save();
					console.log(hh.fromJson(JSON.stringify(user)));
					res.redirect('/github');
				})
			}).catch(err=>{
				res.setHeader('Content-Type', 'text/html');
				res.statusCode=500;
				res.send('Error: ' + err.message);
			});
		}
	})

	api.get('/login', function(req,res) {
			res.redirect(API.authorizeUrl());
	})
	api.get('/logout', function(req,res) {
		req.session.github={};
		req.session.save();
		res.redirect('/');
	})

	api.get('/user', function(req,res) {
		res.setHeader('Content-Type', 'application/json');
		API.getUser().then(data=>res.send(data));
	});

	api.use('/', express.static(path.resolve(__dirname, '../public')));

	return api;
}