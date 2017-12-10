//Catch uncaught errors
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
var gist = {};



// GIST Basic Templates
// --------
gist.escape = s => {
  s = s || "";
  var regex = /[<>\|\*\(\)\[\]\!`]{1}/g;
  return s.replace(regex, (a, b, c) => {
    var chr = a.charCodeAt(0);
    return `&#${chr};`;
  });
};
gist.rn = () => "\r\n";
gist.br = s => gist.rn() + s + gist.rn();
gist.hr = () => gist.br("- - -");
gist.link = (href, title) => {
  href = href || "";
  title = title || href;
  return " [" + title + "](" + href + ") "
}
gist.inline = s => "`" + gist.escape(s) + "`";
gist.code = (code, lang) => {
  code = code || "";
  lang = lang || "";
  return gist.br("```" + lang) + code + gist.br("```");
}
gist.img = (src, title) => {
  src = src || "";
  title = title || "image";
  return "![" + title + "](" + src + ")"
};
gist.imglink = (href, src) => gist.link(href, gist.img(src));
//google image search result
gist.image = function (item) {
  var p = [];
  var title = p[0] = '\n[' + item.title + '](http://hagb4rd.gizmore.org/gallery/slideshow.html?img=' + encodeURIComponent(item.link) + ')\n';
  //var img   = p[1] = "\n[![" + item.title + "](" + item.image.thumbnailLink + ")]("+ item.link +")\n"; 
  var img = p[1] = gist.br(gist.img(item.link, item.title));
  "![" + item.title + "](" + item.link + ")\n";
  var json = p[2] = gist.code(beautify(JSON.stringify(item)));
  return p.join("\r\n");
}





gist.paste = (text, name, description) => {
  return new Promise(function (resolve, reject) {
    if (text.length < 1)
      throw new Error("textlength must be > 0");

    var mime = "text/plain";
    var content;
    if (name) {
      if (name.includes(".htm")) {
        mime = "text/html";
      } else if (name.includes(".json")) {
        mime = "application/json";
      }
      content = text;
    } else {
      name = (new Date()).toISOString() + ".md";
      content = gist.code(text, "js");
    }
    description = description || "output";

    var payload = {
      description: description,
      public: false,
      files: {}
    }
    payload.files[name] = {
      content: content,
      type: mime
    };

    //done(null, { payload: payload });

    var opt = {
      url: "https://api.github.com/gists",
      headers: {
        "User-Agent": require("./credentials").USER_AGENT
      },
      json: payload
    };

    request.post(opt, function (err, response) {
      if (err)
        reject(err);
      var blocks_url = '';

      var url = URL.parse(response.body.html_url)
      result = URL.format(url);
      resolve(result);
    });
  });

};
gist.edit = async function edit(o) {
  /*
  if(typeof(o) == "object") {
    
    Function.prototype.inspect = function() { return this.toString( )};
    
    var protoChain = [o];
    while(o.__proto__) {
      protoChain.push(o.__proto__);
      o = o.__proto__
    }
    
    var text = beautify(util.inspect(protoChain, {showHidden: true, colors: false, depth: null }));   
    
  } else if(typeof(o) == "function") {
   var text = beautify(text.toString());
  } else if (typeof(o) == "string") {
    var text = o;
  } else {
    var text = String(o);
  }
  */
  var text = beautify(serialize(o));

  var link = await gist.paste(text, String(Date.now()) + ".js");
  var id = link.match(/[^\/]+$/g)[0];
  var links = {
    raw: (id => `https://gist.githubusercontent.com/anonymous/${id}/raw/`)(id),
    //github: link,
    edit: (id => ` http://hagb4rd.gizmore.org/edit/index.html#load=${id}`)(id)
  };
  return links.edit;
};
gist.fetch = function fetch(link) {
  var id = String(link).match(/[0-9a-z]+$/ig)[0];
  var rawurl = (id => `https://gist.githubusercontent.com/anonymous/${id}/raw`)(id);
  return rp(rawurl);
}

gist.file = (filepath) => {
  var path = admin().require("path");
  return util.promisify(admin().fs.readFile)(filepath, {
    encoding: "utf-8"
  }).then(str => gist.paste(str, path.basename(filepath))).then(url => {
    var split = url.split("/");
    var id = split[split.length - 1];
    return {
      raw: url,
      edit: ` http://hagb4rd.gizmore.org/edit/index.html#load=${id} `
    };
  }).then(({
    edit,
    raw
  }) => ` gist: ${raw} | edit: ${edit} `)
};

module.exports = gist;