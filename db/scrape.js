const schema = require('./schema.js');
const store = require('./store.js');
const webhose = require('./webhoseio.js');
const get = require('simple-get');
const jsdom = require("jsdom");
const guardian = require('guardian-js');
const Promise = require('bluebird');
const request = require('request');
const XRegExp = require('xregexp')
const fs = require('fs');
const logos = require("../logos.json");
const NYT_KEY = process.env["NYT_KEY"];
const GUAR_KEY = process.env["GUAR_KEY"];
const MAX_HISTORICAL_FILES = +process.env["MAX_HISTORICAL_FILES"] || 1000000000;
const MAX_HISTORICAL_CONCURRENCY = +process.env["MAX_HISTORICAL_CONCURRENCY"] || 100;
var guardApi = new guardian(GUAR_KEY, false);
const webhoseApi = webhose.config({token: process.env["WEBHOSE_TOKEN"]});

var exports = module.exports = {};

exports.crawl = (topic) => {
  return store.newTopic(topic).then((TopicDBObj) => {
    return store.newSource("New York Times", getSourceURLFromSourceName("New York Times"), logos["New York Times"], '#000000', '#FFFFFF').then(function(NYTSourceObj){
      return store.newSource("The Guardian", getSourceURLFromSourceName("The Guardian"), logos["The Guardian"], '#004a83', '#FFFFFF').then(function(GUARSourceObj){
          return getGuardianArticles(topic).then(function(GUAR_data) {
            return pullBodyFromURLSet(GUAR_data, "guardian").then(function(GUAR_bodies) {
              var GUAR_sentences = pullSentencesFromBodies(GUAR_bodies);
              var GUAR_objs = createArticleJSObjects(GUAR_data, GUAR_bodies, GUAR_sentences, "The Guardian");
              GUAR_objs.forEach((value, index) => {
                store.newArticle(value, TopicDBObj.id, GUARSourceObj.id, false).then(function(ArticleDBObj) {
                  value.sentences.forEach(function(sentence, index) {
                    // store.newSentence(ArticleDBObj, sentence).then(function(SentenceDBObj) {
                    // });
                  });
                });
              });
              console.log("Successfully pulled from The Guardian for topic:", topic);
            });
          }).catch(function(error) {
            console.log("error in pulling from the guardian", error);
          }).then((result) => {
            return getNYTArticles(topic).then(function(NYT_data) {
              pullBodyFromURLSet(NYT_data, "new york times").then(function(GUAR_bodies) {
                var GUAR_sentences = pullSentencesFromBodies(GUAR_bodies);
                var GUAR_objs = createArticleJSObjects(NYT_data, GUAR_bodies, GUAR_sentences, "The New York Times");
                GUAR_objs.forEach((value, index) => {
                  store.newArticle(value, TopicDBObj.id, NYTSourceObj.id, false).then(function(ArticleDBObj) {
                    value.sentences.forEach(function(sentence, index) {
                      // store.newSentence(ArticleDBObj, sentence).then(function(SentenceDBObj) {
                      // });
                    });
                  });
                });
                console.log("Successfully pulled from The New York Times for topic:", topic);
              });
            }).catch(function(error) {
              console.log("error in pulling from the new york times", error);
            });
        });
      });
    });
  });  
}

function walk(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        file = dir + '/' + file;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file));
        else results.push(file);
    });
    return results;
}

exports.seed = () => {
    console.log("Starting historical scrape at " + new Date());
    var sources = [{
      name: "The Huffington Post",
      url: "huffingtonpost.com",
      logo: logos["The Huffington Post"],
      primaryColor: '#2E7160',
      secondaryColor: '#FFFFFF'
    }, {
      name: "CNN",
      url: "cnn.com",
      logo: logos["CNN"],
      primaryColor: '#cc1417',
      secondaryColor: '#FFFFFF'
    }, {
      name: "The Hill",
      url: "thehill.com",
      logo: logos["The Hill"],
      primaryColor: '#0b4a9a',
      secondaryColor: '#FFFFFF'
    }, {
      name: "Fox News",
      url: "foxnews.com",
      logo: logos["Fox News"],
      primaryColor: '#183A53',
      secondaryColor: '#FFFFFF'
    }, {
      name: "The Blaze",
      url: "theblaze.com",
      logo: logos["The Blaze"],
      primaryColor: '#E92500',
      secondaryColor: '#FFFFFF'
    }];
    var path = "train/webhose/";
    var maxFiles = MAX_HISTORICAL_FILES;
    var filecount = 0;
    var files = walk(path);
    return store.newTopic("seed", false).then((topic_obj) => {
        var source_objs = [];
        sources.forEach((source) => {
            source_objs.push(store.newSource(source.name, source.url, source.logo, source.primaryColor, source.secondaryColor)
                .then((src) => {
                  return src;
                }));
        });
        return Promise.all(source_objs).then((srcs) => {
            var source_map = srcs.reduce(function(map, obj) {
                map[obj.key] = obj.val;
                return map;
            }, {});
            var pulled_promises = [];
            var articleSourceMap = [];
            return Promise.map(files, (file) => {
                filecount++;
                if (filecount > maxFiles) return;
                if (file.indexOf('DS_Store') != -1) return;
                var json = require('../' + file.replace('//', '/'));
                var url = json['url'];
                var source = null;
                srcs.forEach((src) => {
                  if (!source && url.toLowerCase().indexOf(src.url) != -1) {
                    source = src;
                    articleSourceMap[url] = src.id;
                  }
                });
                if (source == null) {
                  console.log("couldn't match", url);
                  return;
                }
                return pullBodyOfURL(json, source.url).then((body) => {
                    var sentences = pullSentencesFromBody(body);
                    if (sentences == null) {
                      sentences = [];
                    }
                    var returned =  {
                        url: json.url,
                        body: body,
                        source: source,
                        sentences: sentences,
                        headline: json.title,
                    };
                    if (!returned.body || !returned.body.length) {
                      return null;
                    } else {
                      return returned;
                    }
                }).catch((failure) => {
                  console.log(failure);
                  return null;
                });
            }, { concurrency: MAX_HISTORICAL_CONCURRENCY }).then((results) => {
                results.forEach((article) => {
                    if (article == null) {
                      return;
                    }
                    store.newArticle(article, topic_obj.id, articleSourceMap[article.url], true).then((article_obj) => {
                        // var promises = [];
                        // article.sentences.forEach((sentence) => {
                        //     // promises.push(store.newSentence(article_obj, sentence));
                        // });
                        // Promise.all(promises).then(() => {
                        //   store.computeArticleBias(article_obj.id).then(() => {});
                        // });
                    }, (article_failure) => {
                        throw article_failure;
                    });
                });
                console.log("Ending historical scrape at " + new Date());
            });
        });
    });
}

exports.crawlWebhose = (topic) => {
    var sources = [
      {
        name: "The Atlantic",
        url: "theatlantic.com",
        logo: logos["The Atlantic"],
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF'
      },
      {
        name: "CNN",
        url: "cnn.com",
        logo: logos["CNN"],
        primaryColor: '#cc1417',
        secondaryColor: '#FFFFFF'
      },
      {
        name: "The Hill",
        url: "thehill.com",
        logo: logos["The Hill"],
        primaryColor: '#0b4a9a',
        secondaryColor: '#FFFFFF'
      },
      {
        name: "Fox News",
        url: "foxnews.com",
        logo: logos["Fox News"],
        primaryColor: '#183A53',
        secondaryColor: '#FFFFFF',
      },
      {
        name: "The Fiscal Times",
        url: "thefiscaltimes.com",
        logo: logos["The Fiscal Times"],
        primaryColor: '#D94331',
        secondaryColor: '#FFFFFF'
      },
      {
        name: "The Economist",
        url: "economist.com",
        logo: logos["The Economist"],
        primaryColor: '#E3120B',
        secondaryColor: '#FFFFFF'
      },
      {
        name: "The Huffington Post",
        url: "huffingtonpost.com",
        logo: logos["The Huffington Post"],
        primaryColor: '#2E7160',
        secondaryColor: '#FFFFFF'
      },
      {
        name: "The Washington Post",
        url: "washingtonpost.com",
        logo: logos["The Washington Post"],
        primaryColor: '#000000',
        secondaryColor: '#FFFFFF'
      },
      {
        name: "The Washington Times",
        url: "washingtontimes.com",
        logo: logos["The Washington Times"],
        primaryColor: '#FFFFFF',
        secondaryColor: '#000000',
      },
      {
        name: "Independent Journal Review",
        url: "ijr.com",
        logo: logos["Independent Journal Review"],
        primaryColor: '#FFFFFF',
        secondaryColor: '#000000',
      },
      {
        name: "The Blaze",
        url: "theblaze.com",
        logo: logos["The Blaze"],
        primaryColor: '#E92500',
        secondaryColor: '#FFFFFF'
      }
    ];
    return Promise.map(source, (source) => {
        return scrapeWebhose(source, topic);
    }, {concurrency: 1});
}

function scrapeWebhose(source, topic) {
    console.log('Querying WebHose for', topic, 'on', source.name);
    return store.newTopic(topic).then((topic_obj) => {
        return store.newSource(source.name, source.url, source.logo, source.primaryColor, source.secondaryColor).then((source_obj) => {
            return getWebhoseArticles(source_obj.url, topic_obj.name).then((articles) => {
                return Promise.map(articles, (article) => {
                    return store.newArticle(article, topic_obj.id, source_obj.id, false).then(() => {
                        return true;
                    }, (article_failure) => {
                        console.log(article_failure);
                        throw article_failure;
                    });
                }, {concurrency: MAX_HISTORICAL_CONCURRENCY}).then(() => {
                  console.log('Finished WebHose for', topic, 'on', source.name);
                  return true;
                });
            }, (webhose_failure) => {
              throw webhose_failure;
            });
        }, (source_failure) => {
          throw source_failure;
        });
    }, (topic_failure) => {
      throw topic_failure;
    });
}

function getWebhoseArticles(source, topic) {
    return webhoseApi.query('search', {q: "thread.title:(" + topic + ") site:" + source }).then((result) => {
        // webhose is literally garbage so result.data is a string instead of json
        // even if you pass json as the format.
        // nice job idiots
        // dedup results first
        var foundUrls = [];
        if (!result.posts) {
          console.log("Failed query for", topic, "on", source);
          return Promise.delay(500).then(() => {
            return getWebhoseArticles(source, topic);
          });
        }
        result.posts.forEach((article) => {
          var hashIdx = article.url.lastIndexOf('#');
          var url = article.url.substring(0, hashIdx == -1 ? article.url.length : hashIdx);
          var qIdx = url.indexOf('?');
          url = url.substring(0, qIdx == -1 ? url.length : qIdx);
          foundUrls[url] = article;
        });

        var keys = Object.keys(foundUrls);
        return Promise.map(keys, (key) => {
            var value = foundUrls[key];
            return pullBodyOfURL(value, source).then((body) => {
                var sentences = pullSentencesFromBody(body);
                if (sentences == null) {
                  sentences = [];
                }
                var returned =  {
                    url: value.url,
                    body: body,
                    source: source,
                    sentences: sentences,
                    headline: value.title,
                };
                if (!returned.body || !returned.body.length) {
                  return null;
                } else {
                  return returned;
                }
            }, (failure) => {
              throw failure;
            });
        }, {concurrency: MAX_HISTORICAL_CONCURRENCY}).then((results) => {
            return results.filter((n) => { return !!n; }); 
        });
    });
};  

function getNYTArticles(topic) {
    var urlString = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    urlString = urlString + "?q=" + topic.replace(' ', '+') + "&fq=document_type:(\"article\")" + "&api-key=" + NYT_KEY + "&response-format=jsonp" + "&callback=svc_search_v2_articlesearch";


    var NYT_data = [];


    return searchNYT(topic).then(function(response) {
        if (response.statusCode == 429) {
            console.log("Retrying NYT in 1s.");
            return [];
        }
        var docs = JSON.parse(response.body.toString()).response.docs;

        docs.forEach(function(value, index) {
            var article_data = {
                url: value["web_url"],
                headline: value.headline.main
            }
            NYT_data.push(article_data);
        });

        return NYT_data;
    }, (error) => {
      console.log(error);
    });
}

function searchNYT(topic) {
    var get = Promise.promisify(request.get);
    var key = NYT_KEY;
    var urlString = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    urlString = urlString + "?q=" + topic.replace(' ', '+') + "&fq=document_type:(\"article\")" + "&api-key=" + NYT_KEY + "&response-format=jsonp" + "&callback=svc_search_v2_articlesearch";

    return get(urlString);
}

function getGuardianArticles(topic) {
    var header = {
      "type": "article"
    };

    var GUAR_data = [];

    return guardApi.content.search(topic, header).then(function(response){ 
        var docs = JSON.parse(response.body.toString()).response.results;

        docs.forEach(function(value, index) {
          var article_data = {
            url: value["webUrl"],
            headline: value["webTitle"]
          }

          GUAR_data.push(article_data);
        });

        return GUAR_data;
     }, (error) => {
       console.log(error);
     });


}

function pullBodyFromURLSet(articles_data, source) {
    var bodyList = [];
    var totallength = articles_data.length;
    var urlPullPromises = articles_data.map(
      function(x) { return pullBodyOfURL(x, source); }
    );

    var stories = Promise.all(urlPullPromises);
  
    return stories;
    
}

function pullBodyOfURL(article_data, source) {
  return new Promise(function(resolve, reject) {
    jsdom.env({
        url: article_data.url,
        scripts: ["http://code.jquery.com/jquery.js"],
        done: function (err, window) {
            if (err) {
                console.log(err);
                reject("Error loading " + article_data.url);
            }
            else {
                try {
                  var $ = window.jQuery;
                  var bodyStrings = [];
                  var storyblocks = $(divClassTagFromSource(source, article_data.url).join(', '));
                  storyblocks.each(function(idx, val) {
                      bodyStrings.push($(val).text());
                  });
                  var storyText = bodyStrings.join(" ");
                  console.log("found", storyblocks.length, "at", article_data.url);
                  resolve(storyText.trim());
                } catch (ex) {
                  console.log("error in pullBodyOfURL")
                  reject(ex);
                }
            }
        }
    });
    
  });
  

}

function divClassTagFromSource(source, url) {
    if (source.toLowerCase() === "new york times") 
      if (url.includes("query.nytimes")) {
        return ['.articleBody p'];
      } else {
        return ['.story-body-text.story-content'];
      }
    else if (source.toLowerCase() === "guardian") 
      return ['.content__article-body.from-content-api.js-article__body p'];
    else if (source.toLowerCase() == 'thehill.com') {
      return [".field-item.even > p"];
    } else if (source.toLowerCase() == 'cnn.com') {
      return ['.zn-body__paragraph'];
    } else if (source.toLowerCase() == 'foxnews.com') {
      return ['div.article-text > p', ".field-item p", "#block-system-main > div > article > div > div > p"];
    } else if (source.toLowerCase() == "thefiscaltimes.com") {
      return [''];
    } else if (source.toLowerCase() == "theatlantic.com") {
      return ['.article-body p'];
    } else if (source.toLowerCase() == "economist.com") {
      return ['.blog-post__text p'];
    } else if (source.toLowerCase() == 'huffingtonpost.com') {
      return ['.content-list-component.text p', 'div.js-entry-body p'];
    } else if (source.toLowerCase() == "washingtonpost.com") {
      return ["article > p"];
    } else if (source.toLowerCase() == "washingtontimes.com") {
      return [".bigtext > p"];
    } else if (source.toLowerCase() == "ijr.com") {
      return [".tk-proxima-nova p"];
    } else if (source.toLowerCase() == "theblaze.com") {
      return [".entry-content p"];
    }
  }

function createArticleJSObjects(data, bodies, sentences, source) {
  var objs = [];
  for (var i = 0; i < data.length; i++) {
    var urlVal = data[i].url;
    var headline = data[i].headline;
    var bodyVal = bodies[i];
    var art_sentences = sentences[i];

    var obj = {
      url: urlVal,
      body: bodyVal,
      source: source,
      headline: headline,
      sentences: art_sentences
    }

    objs.push(obj);
  }

  return objs;
}

function getSourceURLFromSourceName(sourceName) {
  if (sourceName === "New York Times") {
    return "https://www.nytimes.com";
  } else if (sourceName === "The Guardian") {
    return "https://www.theguardian.com";
  }
}

function pullSentencesFromBody(body) {
    return XRegExp.match(body, /\(?[^\.\?\!]+[\.!\?]\)?/g );
}
function pullSentencesFromBodies(bodies) {
  return bodies.map(pullSentencesFromBody);
}