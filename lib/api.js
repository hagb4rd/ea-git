var credentials=require('./credentials');
var express=require('express');
var url = require('url');
var querystring = require('querystring');
var path=require('path');
var fetch=require('node-fetch');
var baseUrl='https://api.github.com';




/* ------------------ USERS --------------- */
// https://developer.github.com/v3/users/
/* ---------------------------------------- */
var getUser = exports.getUser = async() => {
	var resp = await getJSON(`/user`);
	return resp;
}

/* -------------------------------- */

var authorizeUrl=exports.authorizeUrl=(scope)=>{ 
	scope=scope||credentials.SCOPE||'user:read gist';
	return `https://github.com/login/oauth/authorize?scope=${encodeURIComponent(scope)}&client_id=${credentials.CLIENT_ID}`;
}


var getHeaders = () => {
	var authorize=(token)=>({"Authorization": `token ${token}`});
	var headers = { 
		"User-Agent": credentials.USER_AGENT,
		"Origin":	"jslave.herokuapp.com",
		"Access-Control-Allow-Origin": "*",
		"Accept": "application/vnd.github.v3.full+json"
	};
	if(credentials.TOKEN) {
		Object.assign(headers, authorize(credentials.TOKEN));
	}
	return headers;
} 


var getJSON = (url, query) => {
	if(url.startsWith('/')) {
		url = baseUrl + url;
	}
	var searchParams;
	if(query) {
		searchParams = querystring.stringify(query);
	};
	if(searchParams) {
		url += "?" + searchParams;
	};
	return fetch(url, {
		method: "GET",
		headers: Object.assign(getHeaders(), { 
			"Accept": "application/json",
			"Content-Type": "application/json"
		}),
		body: JSON.stringify(query)
	})
	.then(resp=>resp.json());
}


var postJSON = (url, query) => {
	if(url.startsWith('/')) {
		url = baseUrl + url;
	}
	return fetch(url, {
		method: "POST",
		headers: Object.assign(getHeaders(), { 
			"Accept": "application/json",
			"Content-Type": "application/json"
		}),
		body: JSON.stringify(query)
	})
	.then(resp=>resp.json());
}
var setAccessToken=exports.setAccessToken=async(token)=>{
	credentials.TOKEN=token;
};
var getAccessToken=exports.getAccessToken=async(code)=>{
	var query = {
			client_id: credentials.CLIENT_ID,
			client_secret: credentials.CLIENT_SECRET,
			code: code
	};
	var resp =await postJSON('https://github.com/login/oauth/access_token', query);
	setAccessToken(resp['access_token']);
	return resp['access_token'];
}



