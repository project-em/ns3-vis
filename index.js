var express = require('express');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('prod', process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DATABASE_URL,
  dialect: 'postgres'
});
var queries = require('./db/queries.js');
var schema = require('./db/schema.js');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
  response.render('pages/index');
});

app.use((req, res) => {
  // support ui router
  res.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
