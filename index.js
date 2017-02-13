/* INCLUDES */
var exports = module.exports = {};
var express = require('express');
var body_parser = require('body-parser');
var queries = require('./db/queries.js');
var store = require('./db/store.js');
var app = express();

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

app.post('/api/topic', (request, response) => {
  store.newTopic(request.body.name);
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
