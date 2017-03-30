/* INCLUDES */

var exports = module.exports = {};
const express = require('express');
const body_parser = require('body-parser');
const schedule = require('node-schedule');
const Promise = require('bluebird');
const fs = require('fs');
const schema = require('./db/schema.js');
const queries = require('./db/queries.js');
const store = require('./db/store.js');
const scrape = require('./db/scrape.js');
const topics = require('./topics.json');

const app = express();

/* CONFIG */

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));
app.use(body_parser.json());

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

app.post('/api/source', (request, response) => {
  store.newSource(request.body.name, request.body.url, request.body.logo).then((result) => {
    response.json({new: result});
  }, (fail) => {
    response.json(500, fail);
  });
});

app.post('/api/scrape', (request, response) => {
  console.log("Beginning scrape at " + new Date());
  crawlAll().then(() => {response.sendStatus(200)});
});

app.post('/api/seed', (request, response) => {
  scrape.seed().then((result) => response.sendStatus(200));
});

/* CONFIG */

app.use((req, res) => {
  // support ui router
  res.render('pages/index');
});

/* SCHEDULED TASKS */

function seed() {
  return scrape.seed().then((result) => {
      console.log("Seed data complete at", new Date());
  })
}

function crawlAll() {
    var promises = []
    topics.forEach((topic) => {
        promises.push(scrape.crawl(topic).then((result) => {
            scrape.crawlWebhose(topic).then((result) => {
                console.log("Finished acquisition for", topic);
            });
        }));
    });
    return Promise.all(promises);
}

// var hourly = schedule.scheduleJob('* 0 * * * *', () => crawlAll);

schema.db.sync({force: false}).then((result) => {
  app.listen(app.get('port'), function() {
    console.log('DB synced and Node app is running on port', app.get('port'));
  });
});