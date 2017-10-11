var request = require('request');
var express=require('express');
var bodyParser=require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var Promise=require('promise');
var db = require("./Database/config.js");
var Movie= require("./Database/Model/Movie.js");
var User= require("./Database/Model/User.js");
var util= require("./lib/utility.js");
var app=express();
var port = process.env.PORT||8080;


// app.set('views', __dirname + '/views');
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('shhh!, secret'));
app.use(session({
  secret: 'shhh!',
  resave: false,
  saveUninitialized: true
}));


app.get('/', util.checkUser, function(req, res) {
  res.sendFile(__dirname+'/index.html');

});

app.get('/login', function(req, res) {
  res.sendFile(__dirname+'/views/login.html');
});

app.get('/session',function(req,res){
  res.send(JSON.stringify(req.session.username))
});

app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({ username: username })
  .exec(function(err, user) {
    if (!user) {
      res.sendFile(__dirname+'/views/login.html');
    } else {
      if(password==user.password){
        req.session.username = user.username;
        // console.log('--------------------> login ', req.session.username)
        res.sendFile(__dirname+'/index.html');
      }
      else{
        res.sendFile(__dirname+'/Msg.html');
        console.log('Wrong Password .. Try Again');
      }
    }
  });
});

app.get('/logout', function(req, res){
  req.session.username = null;
  console.log(">>>>>>",req.session.username)
  res.sendFile(__dirname+'/views/login.html');
});

app.get('/signUp',function(req, res) {
  res.sendFile(__dirname+'/views/signUp.html');
});


app.post('/signUp', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username })
  .exec(function(err, user) {
    if (!user) {
      var newUser = new User({
        username: username,
        password: password
      });
      newUser.save(function(err, newUser) {
        if (err) {
          res.status(500).send(err);
        }
        req.session.username = newUser.username;
        console.log('--------------------> login ', req.session.username);
        res.sendFile(__dirname+'/index.html');
      });
    } else {
      console.log('Account already exists');
      res.sendFile(__dirname+'/Msg2.html');    }
    });
});


//.............................................................................
//add new for watched list 
//---1---handling post request for movie data
app.post('/add2',function(req,res){
 
  if(req.session.username){ 
  //prepare record 
  var record = new Movie ({
    id:req.body.id,
    title:req.body.title,
    poster_path:req.body.poster_path
  });

//add it to database
record.save( function(error, newMovie){
  var username = req.session.username;
  if(error){
    throw error;
  }

  User.findOne({username: username} , function(err, user){
    if (err)
     console.log('error in find =========>', err)

   user.watchlist.push(newMovie._id);
   console.log('user in find =========>', user.watchlist)
   User.findOneAndUpdate({username: username} ,{watchlist: user.watchlist},function(err , updated){
    if(err)
      console.log(err);
    else{
      console.log('updated---------------> ',updated)
    }
  })
 });
}); 
console.log('added')
res.send('done');
}
else // if the user not logged in
{
  console.log ('>>>>>>>>>> rejected');
  res.redirect('/login')
}
});





//---2---get data from 
app.get('/watchedlist',function(req,res){
  if (req.session.username){
    res.sendFile(__dirname+'/views/watchedlist.html')            
  }
  else
    res.redirect('/login')
})


//---3---fetch data from database
app.get('/watched', function(req,res){
  
  console.log('hi from watched')
  User.find({username:req.session.username},"watchlist",function(err,newMovie){
    if(err)
      throw err;
    console.log(newMovie[0].watchlist)
    var watchedarr=[];
    for (var i=0;i<newMovie[0].watchlist.length;i++){
      Movie.find({_id:newMovie[0].watchlist[i]},function(err,result){
        if(err)
          throw err;
        console.log('hiiiiiiiiiiii  from watched')
        console.log(result)
        watchedarr.push(result[0])
      })
    }
    
    setTimeout(function(){
      console.log('result')
      console.log(watchedarr)
      res.send(JSON.stringify(watchedarr))
    }, 100);
    
  })
  

})
//................................................................................
///////////////////////////////////////////////////

app.post('/removeFromFav', (req, res) => {
  if(req.session.username) {
    var username = req.session.username;
  }
  else {
    console.log('=========================> no username')
  }
  User.findOne({username: username}, (err, user) => {
    if(err) {
      console.log('=======================> error in find' + err);      
    }
    var index = user.movies.indexOf(req.body._id);
    user.movies.splice(index,1);
    User.findOneAndUpdate({username: username}, {movies: user.movies}, (err, newuser) => {
      if(err) {
        console.log('=======================> error in update ' + err);
      }
    });
  });
});

app.get('/movie-exists', (req, res) => {
  var id = req.url.split('?')[1];
  var username = req.session.username;
  User.find({username: username}, (err, user) => {
    if(err) {
      console.log('error in exists find ==========>', err);
      throw err;
    }
    console.log('--------------------> ',user[0].movies.indexOf(id))
    var index = user[0].movies.indexOf(id);
    if(index>-1) {
      res.status(200).end('y');
    }
    else {
      res.status(200).end('n');
    }
  });
});

//////////////////////////////////////////////////

// handling 'post' req for adding to favorites
app.post('/add',function(req,res) {
  // 1- check if there's a user and reject the req if there isn't 
  if(!req.session.username) {
    res.redirect('/login');
  }
  // 2- now that we know the user exists, we initiate the process of saving to DB
  var username = req.session.username;
  // 3- search first if the movie exists in the DB
  Movie.findOne({id: req.body.id}, (noMovie, foundMovie) => {
    // 3-1 if the movies doesn't exist, save it in the Movies table, then get the id of the saved movie and push it to the user movies array
    if(!foundMovie) {
      // saving the movie
      var record = new Movie ({
        id:req.body.id,
        title:req.body.title,
        poster_path:req.body.poster_path
      });
      record.users.push(username);
      record.save((error, newMovie) => {
        if(error) {
          throw error;
        }
        console.log('new movieeeeeeeeeeeeeeee ', newMovie);
        // get the user movie array
        User.findOne({username: username} , (err, user) => {
          if (!user)
            console.log('error in movie save find user =========> ', err);
          console.log('user ===========> ', user);
          // editing the returned array before re-saving it in the DB
          user.movies.push(newMovie._id);
          console.log('array ===========> ', user.movies);
          // resaving the updated array in the user
          User.findOneAndUpdate({username: username} ,{movies: user.movies},function(err , updated) {
            if(err)
              console.log(err);
            else
              console.log('updated---------------> ', updated)
          });
        });
      });
      res.end('done');
    }
    // 3-2 else if the movie is found
    // 3-2-1 check if the username is found in the array of users first
    else {
      // if it exists, no need to do anything
      if(foundMovie.users.indexOf(username) > -1) {
        res.end('exists');
      }
      // if the user isn't in the user array, push it then update the movie document/entry
      else {
        console.log('found but not fooooooooooound');
        foundMovie.users.push(username);
        // console.log('new array =============> ', foundMovie.users);
        // 
        User.findOne({username: username} , (err, user) => {
          if (!user)
            console.log('error in movie save find user =========> ', err);
          console.log('user ===========> ', user);
          // editing the returned array before re-saving it in the DB
          user.movies.push(foundMovie._id);
          console.log('array ===========> ', user.movies);
          // resaving the updated array in the user
          User.findOneAndUpdate({username: username} ,{movies: user.movies},function(err , updated) {
            if(err)
              console.log(err);
            else
              console.log('updated---------------> ', updated)
          });
        });
        Movie.findOneAndUpdate({id: req.body.id}, {users: foundMovie.users}, (err, newMovie) => {
          if(!newMovie) {
            console.log('error in movie update =========> ' + err);
          }
          console.log('updated movie')
        });
        res.end('done adding to user and movie');        
      }
    }
  });
});




app.delete('/favorite', (req, res) => {
  var id = req.url.split('?')[1];
  var username = req.session.username;
  User.find({username: username}, (err, user) => {
    if(err) {
      console.log('error in delete find ==========>', err);
      throw err;
    }
    var index = user[0].movies.indexOf(id);
    if(index!==-1) {
      user[0].movies.splice(index, 1);
    }
    User.findOneAndUpdate({username:username}, {movies: user[0].movies}, (err, newUser) => {
      if(err) {
        console.log('error in delete findAndUpdate ==========>', err);
        throw err;
      }
      console.log('new user ======>', newUser)
    });
  });
  res.end();
});


app.get('/favoritelist',function(req,res){
  if (req.session.username) {
    res.sendFile(__dirname+'/views/favoritelist.html')
  }
  else
    res.redirect('/login')
});


//fetch data from database
app.get('/favorite', function(req,res){
  User.find({username: req.session.username}, function(err,user) {
    if(err)
      throw err;
    // console.log(user[0].movies);
    var favArr=[];
    for (var i=0;i<user[0].movies.length;i++) {
      Movie.find({_id: user[0].movies[i]},function(err,result) {
        if(err)
          throw err;
        // console.log('hiiiiiiiiiiii')
        // console.log('resulting movies arr ============>' + result);
        favArr.push(result[0])
      })
    }
    
    setTimeout(function() {
        // console.log('result')
        // console.log(favArr)
        res.send(JSON.stringify(favArr))
      }, 500);
    
  })
  

})

app.listen(port,function(err){
  console.log('connected');
});

module.exports = app;


//trying the database

// var Movie1 = new Movie ({ 
//  id:13560 ,
//  title:"Max", 
//  release_date:"2002-09-10",
//  popularity: '3.938836', 
//  overview:
//    "In 1918, a young, disillusioned Adolph Hitler strikes up a friendship with a Jewish art dealer while weighing a life of passion for art vs. talent at politics",
//  vote_average: '6.2',
//  vote_count: '39',
//  poster_path: "/fzl48iRWkalx6c84lokVBoTQJjS.jpg" })


// var User1 = new User ({
//  id:1,
//  username: "samya",
//  password: "1234"})

// movie1.save(function(error, result){
//    if(error){
//    throw error;
//    }
//    else{
//    console.log("record added");
//     }
// });
// User1.save(function(error, result){
//    if(error){
//    throw error;
//    }
//    else{
//    console.log("record added");
//     }
// });