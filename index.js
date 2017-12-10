//Catch uncaught errors
var util=require("util");

process.on('uncaught', function(e) {
	console.log(util.inspect(e.stack,{showHidden: false, depth:null, color: true}));
});

module.exports = {
	credentials: require("./lib/credentials"),
	gist: require("./lib/gist.paste"),
	GitUrl: require("./lib/giturl"),
	Gist: require("./lib/gist")
}