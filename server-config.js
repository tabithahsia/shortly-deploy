var express = require('express');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var util = require('./lib/utility');
var mongoose = require('mongoose');

var handler = require('./lib/request-handler');

var app = express();

mongoose.connect('mongodb://localhost/test');
var mDB = mongoose.connection;
mDB.on('error', console.error.bind(console, 'connection error: '));
mDB.once('open', () => {
  console.log('we\'re connected!');

  var kittySchema = mongoose.Schema({
    name: String
  });
  kittySchema.methods.speak = function () {
    let greeting = this.name
      ? 'Meow name is ' + this.name
      : 'I don\'t have a name';
    console.log(greeting);
  };

  var Kitten = mongoose.model('Kitten', kittySchema);

  var puppySchema = mongoose.Schema({
    name: String
  });
  puppySchema.methods.speak = function () {
    let greeting = this.name
      ? 'Woof my name is ' + this.name
      : 'I don\'t have a name';
    console.log(greeting);
  };

  var Puppy = mongoose.model('Puppy', puppySchema);

  var silence = new Kitten({ name: 'Silence' });
  silence.speak();

  silence.save((err, model) => {
    console.log('silence was saved: ', model);
  });

  var noName = new Kitten({ name: '' });

  noName.save((err, model) => {
    console.log('kitten was saved: ', model);
  });

  console.log(silence.name);
  silence.speak();
  noName.speak();

  var bob = new Puppy({name: 'Bob'});
  bob.save((err, model) => {
    console.log('Saved: ', model)
  });
  bob.speak();
  var retrieved = Puppy.findOne({name: 'Bob'}, (err, results) => {
    console.log('I found a: ', results.name);
  });
});


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser('shhhh, very secret'));
app.use(session({
  secret: 'shhh, it\'s a secret',
  resave: false,
  saveUninitialized: true
}));

// app.get('/db', (req, res) => {
//   // mongoose.connect('mongodb://localhost/27017');
// });

app.get('/', util.checkUser, handler.renderIndex);
app.get('/create', util.checkUser, handler.renderIndex);

app.get('/links', util.checkUser, handler.fetchLinks);
app.post('/links', handler.saveLink);

app.get('/login', handler.loginUserForm);
app.post('/login', handler.loginUser);
app.get('/logout', handler.logoutUser);

app.get('/signup', handler.signupUserForm);
app.post('/signup', handler.signupUser);

app.get('/*', handler.navToLink);

module.exports = app;
