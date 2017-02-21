const schema = require('./schema.js');
const store = require('./store.js');
const webhose = require('webhose-nodejs');
const get = require('simple-get');
const jsdom = require("jsdom");
const guardian = require('guardian-js');
const Promise = require('bluebird');
const request = require('request');
const logos = require("../logos.json");
const NYT_KEY = process.env["NYT_KEY"];
const GUAR_KEY = process.env["GUAR_KEY"];
var guardApi = new guardian(GUAR_KEY, false);

var exports = module.exports = {};

exports.crawl = (topic) => {
  store.newTopic(topic).then((TopicDBObj) => {
    store.newSource("New York Times", getSourceURLFromSourceName("New York Times"), logos["New York Times"], '#000000', '#FFFFFF').then(function(NYTSourceObj){
      store.newSource("The Guardian", getSourceURLFromSourceName("The Guardian"), logos["The Guardian"], '#004a83', '#FFFFFF').then(function(GUARSourceObj){

        getNYTArticles(topic).then(function(NYT_data){
          getGuardianArticles(topic).then(function(GUAR_data){
          pullBodyFromURLSet(NYT_data, "new york times").then(function(NYT_bodies) {
            pullBodyFromURLSet(GUAR_data, "guardian").then(function(GUAR_bodies) {

              var NYT_sentences = pullSentencesFromBodies(NYT_bodies);
              var GUAR_sentences = pullSentencesFromBodies(GUAR_bodies);
                
              var NYT_objs = createArticleJSObjects(NYT_data, NYT_bodies, NYT_sentences, "New York Times");
              var GUAR_objs = createArticleJSObjects(GUAR_data, GUAR_bodies, GUAR_sentences, "The Guardian");

              var allObjs = NYT_objs.concat(GUAR_objs);
              allObjs.forEach(function(value, index) {
                  var source = value.source;
                  var sourceId = "";
                  if (source === "New York Times") {
                    sourceId = NYTSourceObj.id;
                  } else if (source === "The Guardian") {
                    sourceId = GUARSourceObj.id;
                  }

                  store.newArticle(value, TopicDBObj.id, sourceId).then(function(ArticleDBObj) {
                    value.sentences.forEach(function(sentence, index) {
                      store.newSentence(ArticleDBObj, sentence).then(function(SentenceDBObj) {
                      });
                    });
                  })
                });
              })
            }).catch(function(error) {
                console.log("error in pulling bodies", error);
            });
          });
        });
      });
    });
  });  
}

exports.crawlWebhose = (topic) => {
  var promises = [
    scrapeWebhose({
      name: "CNN",
      url: "cnn.com",
      logo: logos["CNN"],
      primaryColor: '#cc1417',
      secondaryColor: '#FFFFFF'
    }, topic),
    scrapeWebhose({
      name: "The Hill",
      url: "thehill.com",
      logo: logos["The Hill"],
      primaryColor: '#0b4a9a',
      secondaryColor: '#FFFFFF'
    }, topic),
  ];
  return Promise.all(promises);
}

function scrapeWebhose(source, topic) {
    store.newTopic(topic).then((topic_obj) => {
        store.newSource(source.name, source.url, source.logo, source.primaryColor, source.secondaryColor).then((source_obj) => {
            getWebhoseArticles(source_obj.url, topic_obj.name).then((articles) => {
                articles.forEach((article) => {
                    store.newArticle(article, topic_obj.id, source_obj.id).then((article_obj) => {
                        article.sentences.forEach((sentence) => {
                            store.newSentence(article_obj, sentence);
                        });
                    }, (article_failure) => {
                        throw article_failure;
                    });
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
    var search = Promise.promisify(webhose.search, { context: webhose });
    return search(topic, { site: source, format: webhose.enums.format.json }).then((result, err) => {
        if (err) throw err;
        // webhose is literally garbage so result.data is a string instead of json
        // even if you pass json as the format.
        // nice job idiots
        // console.log('Querying WebHose for', topic, 'on', source);
        var json = JSON.parse(result.data).posts;
        var results = json.map((value) => {
            return pullBodyOfURL(value, source).then((body) => {
                var sentences = pullSentencesFromBody(body);
                var returned =  {
                    url: value.url,
                    body: body,
                    source: source,
                    sentences: sentences,
                    headline: value.title,
                };
                return returned;
            }, (failure) => {
              throw failure;
            });
        });
        return Promise.all(results);
    });
};

function getNYTArticles(topic) {
    var urlString = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
    urlString = urlString + "?q=" + topic.replace(' ', '+') + "&fq=document_type:(\"article\")" + "&api-key=" + NYT_KEY + "&response-format=jsonp" + "&callback=svc_search_v2_articlesearch";


    var NYT_data = [];


    return searchNYT(topic).then(function(response) {
        if (response.statusCode == 429) {
            console.log("Retrying NYT in 1s.");
            return Promise.delay(1000, () => {
            }).then(() => {
                return searchNYT(topic);
            });
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
            var $ = window.$;
            var bodyStrings = [];
            var storyblocks = $(divClassTagFromSource(source));
            console.log("found", storyblocks.length, "at", article_data.url);
            storyblocks.each(function(idx, val) {
                bodyStrings.push($(val).text());
            });
            
            var storyText = bodyStrings.join(" ");
            
            try {
              resolve(storyText);
            } catch (ex) {
              console.log("error in pullBodyOfURL")
              reject(ex);
            }
        }
    });
    
  });
  

}

function divClassTagFromSource(source) {
    if (source.toLowerCase() === "new york times") 
      return '.story-body-text.story-content';
    else if (source.toLowerCase() === "guardian") 
      return '.content__article-body.from-content-api.js-article__body p';
    else if (source.toLowerCase() == 'thehill.com') {
      return ".field-item.even > p";
    } else if (source.toLowerCase() == 'cnn.com') {
      return '.zn-body__paragraph';
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
    return body.split("(\.\w[A-Z])");
}

function pullSentencesFromBodies(bodies) {
  return bodies.map(pullSentencesFromBody);
}