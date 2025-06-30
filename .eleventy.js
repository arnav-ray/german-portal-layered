module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("images");
  
  // Enable hot reload for development
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = require('fs').readFileSync('_site/404.html');
        browserSync.addMiddleware("*", (req, res) => {
          res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};