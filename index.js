/* INCLUDES */

var exports = module.exports = {};
var express = require('express');
var body_parser = require('body-parser');
var queries = require('./db/queries.js');
var store = require('./db/store.js');
var config = require('./config.json')
var async = require("async");
var app = express();

const get = require('simple-get');
var jsdom = require("jsdom");
const guardian = require('guardian-js');
const Promise = require('bluebird');
const request = require('request');


var NYT_KEY = config["NYT_KEY"];
var GUAR_KEY = config["GUAR_KEY"];
var guardApi = new guardian(GUAR_KEY, false);

/* CONFIG */

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));
// app.use(body_parser.json());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.render('pages/index');
});

/* ROUTES */

app.get('/api/topics', (request, response) => {
  queries.topics().then((data) => {
    response.json(data);
  })
});

app.get('/api/topic/:topic/articles', (request, response) => {
  queries.articlesFor(request.params.topic).then((data) => {
    response.json(data);
  })
});

app.get('/api/topic/:topic/name', (request, response) => {
  queries.topicName(request.params.topic).then((data) => {
    response.json(data);
  })
});

app.get('/api/article/:article', (request, response) => {
  queries.articleBias(request.params.article).then((data) => {
    response.json(data);
  })
});

app.post('/api/topic', (request, response) => {
  console.log("hello");
  crawlArticlesForTopic("wind power");
  response.sendStatus(200);
});

/* CONFIG */

app.use((req, res) => {
  // support ui router
  res.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

/* HELPER FUNCTIONS */


function crawlArticlesForTopic(topic) {
  store.newTopic(topic).then(function(TopicDBObj) {
    store.newSource("New York Times", getSourceURLFromSourceName("New York Times")).then(function(NYTSourceObj){
      store.newSource("The Guardian", getSourceURLFromSourceName("The Guardian")).then(function(GUARSourceObj){

        getNYTArticles(topic).then(function(NYT_data){
          //console.log("NYT_DATA_LENGTH: " + NYT_data.length);
          getGuardianArticles(topic).then(function(GUAR_data){
          //console.log("GUAR_DATA_LENGTH: " + GUAR_data.length);
          pullBodyFromURLSet(NYT_data, "new york times").then(function(NYT_bodies) {
            //console.log("NYT BODIES LENGTH: " + NYT_bodies.length);
            pullBodyFromURLSet(GUAR_data, "guardian").then(function(GUAR_bodies) {
              //console.log("GUAR BODIES LENGTH: " + GUAR_bodies.length);

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
                    console.log("article added");
                    value.sentences.forEach(function(sentence, index) {
                      store.newSentence(ArticleDBObj, sentence).then(function(SentenceDBObj) {

                      });
                    });
                  });

                  
                });
              })
            }).catch(function(error) {
                console.log(error);
                console.log("error in pulling bodies");
            });
          });
        });
      });
    });
  });  
}



function getNYTArticles(topic) {
   var urlString = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
   urlString = urlString + "?q=" + topic.replace(' ', '+') + "&fq=document_type:(\"article\")" + "&api-key=" + NYT_KEY + "&response-format=jsonp" + "&callback=svc_search_v2_articlesearch";

   
   var NYT_data = [];
   

   return searchNYT(topic).then(function(response) {

     var docs = JSON.parse(response.body.toString()).response.docs;

          docs.forEach(function(value, index) {
            var article_data = {
              url: value["web_url"],
              headline: value.headline.main
            }

            NYT_data.push(article_data);
          });

          return NYT_data;
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
     });


}

function pullBodyFromURLSet(articles_data, source) {
    var bodyList = [];
    var totallength = articles_data.length;
    console.log("INPULL URL SET");
    console.log("DATA LENGTH: " + articles_data.length);
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
            console.log("at: " + article_data.url);
            console.log("found: " + storyblocks.length);
            storyblocks.each(function(idx, val) {
                bodyStrings.push($(val).text());
            });
            
            var storyText = bodyStrings.join(" ");
            console.log("about to do callback in pullBodyofURL");
            
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
    if (source === "new york times") 
      return '.story-body-text.story-content';
    else if (source === "guardian") 
      return '.content__article-body.from-content-api.js-article__body p';
    else if (source == "thehill") {
      return ".field-item.even > p";
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

function pullSentencesFromBodies(bodies) {
  
  var allSentences = [];

  bodies.forEach(function(value, index) {
      var sentences = value.split("(\.\w[A-Z])");
      allSentences.push(sentences);
  });

  return allSentences;
}