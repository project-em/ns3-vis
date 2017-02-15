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

        var NYT_data = getNYTArticles(topic);
    
        getGuardianArticles(topic).then(function(GUAR_data){
          
          pullBodyFromURLSet(NYT_data, "new york times").then(function(NYT_bodies) {
            pullBodyFromURLSet(GUAR_data, "guardian").then(function(GUAR_bodies) {
              var NYT_objs = createArticleJSObjects(NYT_data, NYT_bodies, "New York Times");
              var GUAR_objs = createArticleJSObjects(GUAR_data, GUAR_bodies, "The Guardian");

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
                      
                  });
              });
            })
          }).catch((error) => {
            console.log("error in pulling urls!")
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
   
   get.concat(urlString, function (err, res, data) {
     if (err) throw err
     
     var docs = JSON.parse(data.toString()).response.docs;
    
     docs.forEach(function(value, index) {
       var article_data = {
         url: value["web_url"],
         headline: value.headline.main
       }
       NYT_data.push(article_data);

     });

   });

   return NYT_data;
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

// function pullBodyFromURLSet(data, source) {
  
//   return new Promise(function(resolve, reject) {
//     bodyList = [];
//     data.forEach(function(value, index) {
//       pullBodyOfURL(value.url, source, function(body) {
//         bodyList.push(body);
//       });
//     });

//     if (bodyList.length != 0) {
//       resolve(bodyList);
//     } else {
//       reject("empty story!");
//     }
    
//   });
  
  
// }

function pullBodyFromURLSet(data, source) {
    async.eachSeries(data, function(item, callback) {
        var url = item.url;
    });
}

function pullBodyOfURL(url, source, callback) {
  return jsdom.env({
    url: url,
    scripts: ["http://code.jquery.com/jquery.js"],
    done: function (err, window) {
        var $ = window.$;

        var bodyStrings = [];
        var storyblocks = $(divClassTagFromSource(source));
        console.log("at: " + url);
        console.log("found: " + storyblocks.length);
        storyblocks.each(function(idx, val) {
            bodyStrings.push($(val).text());
        });
        
        var storyText = bodyStrings.join(" ");
        callback(storyText);
    }
  });

}

function divClassTagFromSource(source) {
    if (source === "new york times") 
      return '.story-body-text.story-content';
    else if (source === "guardian") 
      return '.content__article-body.from-content-api.js-article__body p';
    
}

function createArticleJSObjects(data, bodies, source) {
  var objs = [];
  for (var i = 0; i < data.length; i++) {
    var urlVal = data[i].url;
    var headline = data[i].headline;
    var bodyVal = bodies[i];

    var obj = {
      url: urlVal,
      body: bodyVal,
      source: source,
      headline: headline
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