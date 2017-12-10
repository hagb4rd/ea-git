process.on('uncaught', function(e) {
	console.log(util.inspect(e.stack,{showHidden: false, depth:null, color: true}));
});


var mimeTypes = require('mime-types'),
    request = require("request"),
  rp = require('request-promise'),
  qs = require('querystring'),
  URL = require('url'),
  util = require('util'),
  beautify = require('js-beautify');

// filenames is an array, options is an object of command line options.
var gist = require("./gist.paste");


var Gist = class Gist {
  constructor(opts) {
    opts=opts||{};
    this.id = "";
    this.gist = undefined;
    this.title = opts.title || "";
    this.description = opts.description || "";
    this.public = opts.public || false;
    this.files = opts.files || [];
  }
  static createFile(content, title, mime) { 

    if(!content) {
      throw new Error('Missing Parameter: <content>');
    }
    if(!title && !mime) {
      content = gist.code(String(content));
    }
    title = title || (new Date()).toISOString() + ".md";
    mime = mime || mimeTypes.lookup(title);
    return {
      content: content,
      title: title,
      mime: mime
    }
  }
  static async  paste(content, title, mime) {
    var gist = new Gist({
      files: [
        Gist.createFile(content, title, mime)
      ]
    });
    await gist.post();
    return gist;
  }
  async info() {
    try {
      if(this.id) {
        // https://api.github.com/gists/bdb4bf6761625f386651f6ff5a8aa1a6
        var resp = await rp({
          url:`https://api.github.com/gists/${this.id}`,
          headers: { "User-Agent": require("./credentials").USER_AGENT }
        });
        this.data = JSON.parse(resp);
        return this.data;
      } else {
        throw new Error("Missing <gist.id> - Gist has not been post()'ed yet.");
      }
    } catch(e) {
      console.log(e);
      throw(e);
    }
  }
  
  async post() {
    var resp = await rp({
      url: "https://api.github.com/gists",
      headers: {
        "User-Agent": require("./credentials").USER_AGENT
      },
      json: {
        description: this.description,
        public: this.public,
        files: (() => {
          var files = {};
          this.files.forEach(file => {
            files[file[title]] = {
              content: file.content,
              mime: file.mime
            }
          });
          return files;
        })()
      }
    });
    var uri = URL.parse(resp.body.html_url)
    var url = URL.format(uri);
    this.id = url.path.split("/").pop();
    return this.info();
  }
}
Gist.md = gist;


module.exports = Gist;