const express = require('express');
const session = require('express-session');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');

var app = express();

let randomImage = function() {
  var images = ["http://www.fillmurray.com/200/300", "https://images-na.ssl-images-amazon.com/images/I/41oq%2BCg32iL._SY300_.jpg"];
  let randomIndex = (Math.random() > 0.5) ? 1 : 0;
  return images[randomIndex];
};

let captcha = {
  'http://www.fillmurray.com/200/300': 'billmurray',
  'https://images-na.ssl-images-amazon.com/images/I/41oq%2BCg32iL._SY300_.jpg': 'notbillmurray'
}

// Configure mustache
app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');

// Configure Body Parser
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

// Configure express-session middleware
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true
}));

// Authentication and Authorization Middleware
var auth = function(req, res, next) {
  if (req.session && req.session.admin)
    return next();
  else
    return res.sendStatus(401);
};

// Root endpoint, redirect to login, if not logged in, or content if logged in
app.get('/', function (req, res) {
  if (req.session && req.session.admin) {
    res.redirect('/content');
  } else {
    res.redirect('/login');
  }
});

// Login endpoint
app.get('/login', function (req, res) {
  res.render('login', { random: randomImage });
});

app.post('/login', function (req, res) {
  let correctAnswer = captcha[req.body.displayedImg];
  if (req.body.guess === correctAnswer) {
    req.session.user = "bill";
    req.session.admin = true;
    res.redirect('/content');
  }
});

// // Get content endpoint
app.get('/content', auth, function (req, res) {
    res.render('secret-murray');
});

// Logout endpoint
app.post('/logout', function (req, res) {
  req.session.destroy();
  res.render('logout');
});

app.listen(3000, function() {
  console.log('Catch-a-Murray started on port 3000...');
});