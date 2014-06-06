
var config = require('./config'),
    id     = config.id,
    secret = config.secret,
    host   = config.host;

var express  = require('express'),
app          = express(),
ejs          = require('ejs'),
passport     = require('passport'),
SBHSStrategy = require('passport-sbhs'),
uuid         = require('node-uuid');


passport.serializeUser(function(user,done){done(null,user)});
passport.deserializeUser(function(user,done){done(null,user)});

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(require('cookie-parser')());
app.use(require('express-session')({secret: secret, key: id}));
app.use(passport.initialize());
app.use(passport.session());

var state = uuid.v4();

var SBHS = new SBHSStrategy({
    clientID: id,
    clientSecret: secret,
    state: state,
    callbackURL: 'http://'+host+'/callback'
},
function(accessToken, refreshToken, profile, done) {
    profile.accessToken = accessToken;
    profile.refreshToken = refreshToken;
    done(null,profile);
});

passport.use(SBHS);

app.get('/', function(req,res) {
    if (req.user) {
        SBHS.day(req.user.accessToken, function (err, o) {
            if (!err && o) {
                res.render('index', o);
            } else {
                res.redirect('/login');
            }
        });
    } else {
        res.render('login');
    }
});

app.get('/login', passport.authenticate('sbhs'));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/callback', passport.authenticate('sbhs', {
    successRedirect: '/',
    failureRedirect: '/'
}));

app.listen(80);