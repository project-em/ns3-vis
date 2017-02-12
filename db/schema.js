var mongoose = require('mongoose');

var exports = module.exports = {};
var models = exports.models = {};

var song = new mongoose.Schema({
    song_id: String,
    artist: String,
    title: String
});

models.popular_songs = mongoose.model('song', song);