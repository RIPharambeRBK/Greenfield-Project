var db = require('../config');
var mongoose = require('mongoose');



//create our movie model 
var movieSchema = mongoose.Schema({
  id: Number,
  title: String,
  poster_path: String,
  genre: {type:String ,default:"general"},
  users: []
});

var Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;



