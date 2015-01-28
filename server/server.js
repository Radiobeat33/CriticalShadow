var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = process.env.PORT || 3000;
var host = process.env.HOST;
var path = require('path');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var db = require('./db');
var handlers = require('./handlers');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/../client'));

var FACEBOOK_APP_ID = 922911927720037;
var FACEBOOK_APP_SECRET = '513872ee43b515e579d4133a0d7e4086';

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback"
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
  ));

//This is the handler for Facebook authentication. Our application redirects to facebook which will ask for permission and then make a GET req to the route below
app.get('/auth/facebook', passport.authenticate('facebook'), function (req, res) {
});

//Facebook redirects to this URL upon approval
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/signup' }), function (req, res) {
  handlers.setUser(req.user.displayName)
    .then(function (user) {
    res.cookie('u_id', user.id)
    }).then(function () {
      res.redirect('/');
    });
});

app.get('/', function (req, res) {
  res.sendFile(__dirname, 'index.html');
});

app.get('/mymap', function (req, res) {
  res.sendFile(path.join(__dirname, '/../client/mymap.html'));
});

app.get('/createMaps', function (req, res) {
  res.sendFile(path.join(__dirname, '/../client/createMaps.html'));
});

app.get('/login', function (req, res) {
  res.sendFile(path.join(__dirname, '/../client/templates/login.html'));
});

app.get('/signup', function (req, res) {
  res.sendFile(path.join(__dirname, '/../client/templates/signup.html'));
});

//Handles both sign up and login form actions on the respective pages
app.post('/facebook', function (req, res) {
  res.redirect('/auth/facebook');
});

app.listen(port, function () {
  console.log("Listening on " + port);
});