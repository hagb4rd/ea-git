//Catch uncaught errors
process.on('uncaught', function(e) {
	console.log(util.inspect(e.stack,{showHidden: false, depth:null, color: true}));
});


var url = require("url");
var util = require("util");

function GitUrl() {
	this.usr = "";
	this.repo = ""; 
	this.branch = "";
	this.type = "";
	this.tree = ""; 
	this.file = ""; 
	this.fileext = "";
}
GitUrl.prototype.toRawUser = function() {
	
	var urlObject = {
		protocol: 'https:',
		host: "raw.githubusercontent.com",
		slashes: true,
		pathname: "/" + ([this.usr, this.repo, this.branch].concat(this.tree)).join("/")
	};
	return url.format(urlObject);
};

GitUrl.prototype.toRaw = function() {
	
	var urlObject = {
		protocol: 'https:',
		host: "rawgit.com",
		slashes: true,
		pathname: "/" + ([this.usr, this.repo, this.branch].concat(this.tree)).join("/")
	};
	return url.format(urlObject);
};
GitUrl.prototype.toRawCDN = function() {
	
	var urlObject = {
		protocol: 'https:',
		host: "cdn.rawgit.com",
		slashes: true,
		pathname: "/" + ([this.usr, this.repo, this.branch].concat(this.tree)).join("/")
	};
	return url.format(urlObject);
};
GitUrl.prototype.toGitHub = function() {
	
	var urlObject = {
		protocol: 'https:',
		host: "gihub.com",
		slashes: true,
		pathname: "/" + ([this.usr, this.repo, this.branch, this.type].concat(this.tree)).join("/")
	};
	return url.format(urlObject);
};



GitUrl.fromGitHub = function(gitUrl){	
	//https://github.com/deweyapp/dewey-website/blob/master/docs/how-to-use-dewey.md
	var uri = url.parse(gitUrl); 
	var pathArr = uri.pathname.split("/").slice(1); // [ 'deweyapp', 'dewey-website', 'master', 'Demo', 'demo.response.html' ] 

	var g = new GitUrl();
	g.usr = pathArr.shift()  // 'deweyapp'
	g.repo = pathArr.shift(); // 'dewey-website'
	g.type = pathArr.shift(); // 'blob'
	g.branch = pathArr.shift() // 'master'
	g.tree = pathArr.slice(0); //[ 'docs', 'how-to-use-dewey.md' ] 	
	g.file = pathArr[pathArr.length-1];
	g.fileext = "";
	var extIndex = g.file.lastIndexOf(".");
	if(extIndex >= 0) {
		g.fileext = g.file.slice(extIndex);
	}
	return g;
}


GitUrl.fromRaw = function(rawUrl) {	
	// "https://raw.githubusercontent.com/zalun/jsFiddleGithubDemo/master/Demo/demo.response.html"
	var uri = url.parse(rawUrl); 
	var pathArr = uri.pathname.split("/").slice(1); // [ 'zalun', 'jsFiddleGithubDemo', 'master', 'Demo', 'demo.response.html' ] 

	var g = new GitUrl();
	g.usr = pathArr.shift()  // 'zalun'
	g.repo = pathArr.shift(); // 'jsFiddleGithubDemo'
	g.branch = pathArr.shift() // 'master'
	g.tree = pathArr.slice(0); //[ 'Demo', 'demo.response.html' ] 	
	g.file = pathArr[pathArr.length-1];
	g.fileext = "";
	var extIndex = g.file.lastIndexOf(".");
	if(extIndex >= 0) {
		g.fileext = g.file.slice(extIndex);
	}
	return g;
}


module.exports = GitUrl;