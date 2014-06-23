var config = require('./config'),
id     = config.id,
secret = config.secret,
host   = config.host;

var express  = require('express'),
app          = express(),
ejs          = require('ejs'),
passport     = require('passport'),
SBHSStrategy = require('passport-sbhs'),
uuid         = require('node-uuid'),
request        = require('request');


passport.serializeUser(function(user,done){done(null,user)});
passport.deserializeUser(function(user,done){done(null,user)});

app.use(require('compression')());

app.use(express.static(__dirname + '/public'));
express.static.mime.define({'text/cache-manifest': ['appcache']});

app.set('view engine', 'ejs');
app.use(require('cookie-parser')());
app.use(require('express-session')({secret: secret, key: id, cookie:{maxAge:7776000000}}));
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
    var now = new Date();
    profile.tokens = {accessToken: accessToken, refreshToken: refreshToken, expires: (new Date(now.getTime() + 3600000)).valueOf()};
        done(null,profile);
    });

passport.use(SBHS);


function getTokens(tokens, done) {
    if (new Date().valueOf() < tokens.expires) {
        done(null, tokens);
    } else {

    request.post({
        url: 'https://student.sbhs.net.au/api/token',
        form: {
          refresh_token: tokens.refreshToken,
          client_id:     id,
          client_secret: secret,
          grant_type:    'refresh_token'
      }

  }, function (err, response, body) {
    if(err) return done(err);


    var result = JSON.parse(body);

    var now = new Date();
    var newTokens = {accessToken: result.access_token, refreshToken: tokens.refreshToken, expires: (new Date(now.getTime() + (result.expires_in * 1000))).valueOf()};

        return done(null, newTokens);

    });



  }
};

app.get('/', function(req,res) {
    if (req.user) {
        res.render('index');
    } else {
        res.render('login');
    }
});

app.get('/fallback', function(req,res) {
    if (req.user) {
        res.render('offline');
    } else {
        res.status(401).send("401 Unauthorized");
    }
});

app.get('/api/dailynotices.json', function(req,res) {
    if (req.user) {
        getTokens(req.user.tokens, function(err, tokens) {
         req.user.tokens = tokens;
         SBHS.dailyNotices(req.user.tokens.accessToken, function (err, o) {
            if (!err && o) {
                res.json(o);
            } else {
                res.status(500).send(err);
            }
        }, req.query.date);
     });
    } else {
        res.status(401).send("401 Unauthorized");
    }
});

app.get('/api/timetable.json', function(req,res) {
    if (req.user) {
        getTokens(req.user.tokens, function(err, tokens) {
         req.user.tokens = tokens;
         SBHS.timetable(req.user.tokens.accessToken, function (err, o) {
            if (!err && o) {
                res.json(o);
            } else {
                res.status(500).send(err);
            }
        });
     });
    } else {
        res.status(401).send("401 Unauthorized");
    }
});

app.get('/api/daytimetable.json', function(req,res) {
    if (req.user) {
        getTokens(req.user.tokens, function(err, tokens) {
         req.user.tokens = tokens;
         SBHS.day(req.user.tokens.accessToken, function (err, o) {
            if (!err && o) {
                res.json(o);
            } else {
                res.status(500).send(err);
            }
        }, req.query.date);
     });
    } else {
        res.status(401).send("401 Unauthorized");
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