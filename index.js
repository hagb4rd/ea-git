var url = require("url");
var util = require("util");



function GitUrl() {
	
	var git = this; 
	git.usr = "";
	git.prj = ""; 
	git.branch = "";
	git.tree = ""; 
	git.file = ""; 
	git.fileext = "";
}
GitUrl.prototype.toRaw = function() {
	
	var urlObject = {
		protocol = 'https:',
		host = "raw.githubusercontent.com",
		slashes = true,
		pathname = "/" + ([this.usr, this.prj, this.branch].concat(this.tree)).join("/")
	};
	return url.format(urlObject);
};


GitUrl.fromRaw = (rawUrl) => {	
	// "https://raw.githubusercontent.com/zalun/jsFiddleGithubDemo/master/Demo/demo.response.html"
	var uri = url.parse(rawUrl); 
	var pathArr = uri.pathname.split("/").slice(1); // [ 'zalun', 'jsFiddleGithubDemo', 'master', 'Demo', 'demo.response.html' ] 

	var git = new GirUrl();
	git.usr = pathArr.shift()  // 'zalun'
	git.prj = pathArr.shift(); // 'jsFiddleGithubDemo'
	git.branch = pathArr.shift() // 'master'
	git.tree = pathArr.slice(0); //[ 'Demo', 'demo.response.html' ] 	
	git.file = pathArr[pathArr.length-1];
	git.fileext = "";
	var extIndex = git.file.lastIndexOf(".");
	if(extIndex >= 0) {
		git.fileext = git.file.slice(extIndex);
	}
}

module.exports = GitUrl; 
