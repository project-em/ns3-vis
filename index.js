var express = require('express');
var mongoose = require('mongoose');
var queries = require('./db/queries.js');
var schema = require('./db/schema.js');

var app = express();

mongoose.connect('mongodb://54.159.218.143:27017/cis450');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("db connected");
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/bower_components'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/api/genres', function(request, response) {
  queries.genres().then(function(value) {
    response.json(value);
  });
});

app.get('/api/songs/:song_id/similar', function(request, response) {
  var song_id = request.params.song_id;
  if (!song_id) {
    response.send('invalid');
  } else {
    queries.similarSongs(song_id, request.query.n).then(function(value) {
      response.json(value);
    });
  }
});

app.get('/api/songs/name/:song_name/tags', function(request, response) {
  var song_name = request.params.song_name;
  if (!song_name) {
    response.send('invalid');
  } else {
    queries.songTags(song_name).then(function(value) {
      response.json(value);
    });
  }
});

app.get('/api/songs/:song_id/tags', function(request, response) {
  var song_id = request.params.song_id;
  if (!song_id) {
    response.send('invalid');
  } else {
    queries.songTagsById(song_id, request.query.n).then(function(value) {
      response.json(value);
    });
  }
});

app.get('/api/artists/:artist_name/songs', function(request, response) {
  var artist_name = request.params.artist_name;
  if (!artist_name) {
    response.send('invalid');
  } else {
    queries.artistSongs(artist_name).then(function(value) {
      response.json(value);
    });
  }
});

app.get('/api/artists/:artist_name/genres', function(request, response) {
  var artist_name = request.params.artist_name;
  if (!artist_name) {
    response.send('invalid');
  } else {
    queries.artistGenres(artist_name).then(function(value) {
      response.json(value);
    });
  }
});

app.get('/api/songs/covered', function(request, response) {
  queries.commonlyCoveredSongs().then(function(value) {
    response.json(value);
  });
});

app.get('/api/songs/similar', function(request, response) {
  queries.findCommon().then(function(value) {
    response.json(value);
  });
});


app.get('/api/songs/popular', function(request, response) {
  queries.mostPopularSongs().then(function(value) {
    response.json(value);
  });
});

app.get('/api/autocomplete/songs/:song_name', function(request, response) {
  queries.autocompleteSongs(request.params.song_name).then(function(value) {
    response.json(value);
  });
});

app.get('/api/autocomplete/artists/:artist_name', function(request, response) {
  queries.autocompleteArtists(request.params.artist_name).then(function(value) {
    response.json(value);
  });
});


app.use(function(req, res) {
  // support ui router
  res.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
