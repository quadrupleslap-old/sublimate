var config = require('./config'),
id         = config.id,
secret     = config.secret,
callback   = 'http://'+config.host+'/callback';

var port = parseInt(process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || '8080'),
    ip   = process.env.OPENSHIFT_NODEJS_IP;

var express  = require('express'),
app          = express(),
ejs          = require('ejs'),
passport     = require('passport'),
SBHSStrategy = require('passport-sbhs'),
uuid         = require('node-uuid'),
request      = require('request');

app.use(require('compression')());

passport.serializeUser(function(user,done){done(null,user)});
passport.deserializeUser(function(user,done){done(null,user)});


app.use(express.static(__dirname + '/public', {maxAge: 2592000000 /*One Month*/}));
express.static.mime.define({'text/cache-manifest': ['appcache']});

app.set('view engine', 'ejs');
app.use(require('cookie-parser')());
app.use(require('express-session')({secret: secret, key: id, cookie:{maxAge:7776000000 /* 90 Days */}}));
app.use(passport.initialize());
app.use(passport.session());

var state = uuid.v4();

var SBHS = new SBHSStrategy({
    clientID: id,
    clientSecret: secret,
    state: state,
    callbackURL: callback
},
function(accessToken, refreshToken, profile, done) {
    var now = new Date();
    profile.tokens = {accessToken: accessToken, refreshToken: refreshToken, expires: Date.now() + 3600000 /* 1 Hour */};
    done(null,profile);
});

passport.use(SBHS);

var termsCache = {}; // Of course we plan to leave this running forever ;)

function getTokens(tokens, done) {
    if (Date.now() <= tokens.expires) {
        done(null, tokens);
    } else {

    request.post({
        'uri': 'https://student.sbhs.net.au/api/token',
        'headers': {'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'},
        'body':'grant_type=refresh_token&refresh_token=' + tokens.refreshToken + '&client_id='+encodeURIComponent(id) + '&client_secret='+ secret
    }, function (err, response, body) {
      if(err) return done(err);
      var result = JSON.parse(body);
      var now = Date.now();
      var newTokens = {accessToken: result.access_token,
                       refreshToken: tokens.refreshToken,
                       expires: Date.now() + 3600000};
      done(null, newTokens);
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
    res.jsonp({"date":1391086800,"dayInfo":{"date":"2014-01-31","term":"1","week":"1","weekType":"A","events":[],"dayNumber":"5"},"dateYesterday":1391000400,"dateTomorrow":1391346000,"notices":[{"id":"4275","title":"16s Tennis","content":"<p>\n  Would all boys in the 16s Tennis team please meet in Room 207\n  Lunch 1 on Thursday and Friday to ensure teams are correct for\n  this Saturday.</p>","years":["10"],"dates":["2014-01-30","2014-01-31"],"relativeWeight":"0","isMeeting":"1","meetingDate":"2014-01-30","meetingTimeParsed":"00:00:00","meetingTime":"Lunch 1","meetingLocation":"Room 207","displayYears":"Year 10","authorName":"MIC Tennis"},{"id":"4280","title":"Pre-Season Athletics Meeting","content":"<p>\n  Anyone interested in the upcoming Athletics season to meet this\n  Friday at lunch in the gymnasium for debriefing.</p>","years":["7","8","9","10","11","12"],"dates":["2014-01-29","2014-01-30","2014-01-31"],"relativeWeight":"0","isMeeting":"1","meetingDate":"2014-01-31","meetingTimeParsed":"00:00:00","meetingTime":"Lunch 1","meetingLocation":"Gymnasium","displayYears":"All Students","authorName":"K Rich"},{"id":"4285","title":"SRC","content":"<p>\n  With the swimming carnival on Monday, could all involved with the\n  SRC briefly meet on Tuesday lunch at 304? Thanks</p>","years":["7","8","9","10","11","12"],"dates":["2014-01-30","2014-01-31","2014-02-04"],"relativeWeight":"0","isMeeting":"1","meetingDate":"2014-02-04","meetingTimeParsed":"00:00:00","meetingTime":"Lunch 1","meetingLocation":"304","displayYears":"All Students","authorName":"O The"},{"id":"4295","title":"Year 7 Debating ","content":"<p>\n  All Year 7 students wanting to sign up for debating MUST attend a\n  lunch time meeting on Friday 7th in the Great Hall.</p>","years":["7"],"dates":["2014-01-31","2014-02-03","2014-02-04"],"relativeWeight":"0","isMeeting":"1","meetingDate":"2014-02-07","meetingTimeParsed":"00:00:00","meetingTime":"Lunch 1","meetingLocation":"The Great Hall","displayYears":"Year 7","authorName":"RJ Powell"},{"id":"4283","title":"Basketball Training Sessions","content":"<p>\n  <strong>All sessions resume Monday and are the same as term 4\n  with the exception of 16DEF who are after school in the gym on\n  Thursday. New year 7's will be given all information&nbsp;at\n  trials.&nbsp;</strong></p>","years":["7","8","9","10","11","12"],"dates":["2014-01-31","2014-02-03"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"All Students","authorName":"B Hayman"},{"id":"4286","title":"Chess coaching 2014","content":"<p>\n  Chess coaching with Vladimir Feldman will move from Friday to\n  Monday mornings this year in 104 with coach Vladimir Feldman.\n  Begins next Monday 3rd. February at 8 a. m.</p>","years":["7","8","9","10","11","12"],"dates":["2014-01-30","2014-01-31"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"All Students","authorName":"R Barr"},{"id":"4303","title":"Found","content":"<p>\n  1 pair of school shoes has been found at parklands tennis\n</p>\n<p>\n  1 new school cap\n</p>\n<p>\n  1 new belt\n</p>\n<p>\n  1school shoe\n</p>\n<p>\n  1 Pencil case found in room 102 period 1 or 2&nbsp;Thurs 30.01014\n</p>\n<p>\n  Please see main office</p>","years":["7","8","9","10","11","12"],"dates":["2014-01-31"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"All Students","authorName":"main office"},{"id":"4301","title":"Lockers","content":"<p>\n  These will be allocated next week. Year 7 &amp; 8 have priority.\n  You will be notified&nbsp; by the day sheet when it is your turn.\n  Do not ask the office or me. You will be notified as soon as\n  possible.</p>","years":["7","8","9","10","11","12"],"dates":["2014-01-31","2014-02-03","2014-02-04"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"All Students","authorName":"C Barris"},{"id":"4281","title":"Music Ensembles Term 1","content":"<p>\n  All music ensembles including Marching Band will commence in Week\n  2</p>","years":["7","8","9","10","11","12"],"dates":["2014-01-29","2014-01-30","2014-01-31"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"All Students","authorName":"Music"},{"id":"4292","title":"School SWimming Carnival","content":"<p>\n  The School Swimming Carnival will be held this Monday at Heffron\n  Pool Maroubra. Please pick up a note form outside the Social\n  Science Staffroom if you have not received one yet.\n</p>","years":["7","8","9","10","11","12"],"dates":["2014-01-30","2014-01-31"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"All Students","authorName":"P Loizou"},{"id":"4293","title":"2013 RECORD","content":"<p>\n  If you did not get your copy of the 2013 Record last year please\n  collect from outside the art staff room this week.</p>","years":["8","9","10","11","12"],"dates":["2014-01-31","2014-02-03","2014-02-04"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"Years 8-12","authorName":"J May"},{"id":"4294","title":"Debating Sign Up","content":"<p>\n  All year 8-12 students committed to debating this year MUST sign\n  up on the debating board by 3pm on Friday February 7th. There\n  will be absolutely NO late sign up.</p>","years":["8","9","10","11","12"],"dates":["2014-01-31","2014-02-03","2014-02-04"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"Years 8-12","authorName":"RJ Powell"},{"id":"4282","title":"Meet the Music & Encore Tickets","content":"<p>\n  Please remember to pay for your \"Meet the Music\" &amp; \"Encore\"\n  tickets to the front office ASAP!</p>","years":["9","10","11","12"],"dates":["2014-01-29","2014-01-30","2014-01-31"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"Years 9-12","authorName":"Music"},{"id":"4287","title":"Senior Concert Band","content":"<p>\n  ALL members in the Senior Concert Band, please note that\n  rehearsals will now be held on <strong>TUESDAY mornings at 7:45am\n  in room 201</strong>. Please ensure that you attend as of week 2\n  as 80% attendance is required for award scheme points to apply.</p>","years":["9","10","11","12"],"dates":["2014-01-30","2014-01-31","2014-02-04"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"Years 9-12","authorName":"Music"},{"id":"4290","title":"Senior Library","content":"<p>\n  The Senior Library is closed for the remainder of this week for\n  stocktaking and administration. The Junior Library may be used in\n  this time.</p>","years":["10","11","12"],"dates":["2014-01-30","2014-01-31"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"Years 10-12","authorName":"J Kay"},{"id":"4291","title":"Big Brother","content":"<p>\n  Last opportunity for any boys to receive recognition for Big\n  Brother. You must provide evidence of the thank you letter,\n  teacher report on your performance and your own reflection by\n  Monday. A list of those already completed is outside room 305</p>","years":["10"],"dates":["2014-01-30","2014-01-31"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"Year 10","authorName":"J Kay"},{"id":"4304","title":"Latin and German","content":"<p>\n  Year 8 latin and Year 8 German will begin next Tuesday 4th\n  February at 7.30 am .\n</p>\n<p>\n  Latin in room 211\n</p>\n<p>\n  German in room 213</p>","years":["8"],"dates":["2014-01-31","2014-02-03"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"Year 8","authorName":"Languages"},{"id":"4300","title":"Yr 7 Tennis Saturday","content":"<p>\n  Year 7 tennis now starts at 8.30 on Saturday at SBHS courts.</p>","years":["7"],"dates":["2014-01-31"],"relativeWeight":"0","isMeeting":"0","meetingDate":null,"meetingTimeParsed":"00:00:00","meetingTime":"","meetingLocation":"","displayYears":"Year 7","authorName":"M Pavone"}]});
    return;
    if (req.user) {
        getTokens(req.user.tokens, function(err, tokens) {
         req.user.tokens = tokens;
         SBHS.dailyNotices(req.user.tokens.accessToken, function (err, o) {
            if (!err && o) {
                /* EXPERIMENTAL CACHE SETTINGS */
                res.set('Cache-Control', 'private, max-age=300');
                res.jsonp(o);
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
                res.jsonp(o);
            } else {
                res.status(500).send("500 Internal Server Error");
            }
        });
     });
    } else {
        res.status(401).send("401 Unauthorized");
    }
});

app.get('/api/calendar/terms.json', function(req,res) {
  var year = new Date().getFullYear();
  if (year in termsCache) res.jsonp(termsCache[year]);
  else request("https://student.sbhs.net.au/api/calendar/terms.json", function (err, response, body) {
    if (!err && response.statusCode == 200) {
      body = JSON.parse(body);
      res.jsonp(body);
      termsCache[year] = body;
    };
  });
});

app.get('/api/daytimetable.json', function(req,res) {
    if (req.user) {
        getTokens(req.user.tokens, function(err, tokens) {
         req.user.tokens = tokens;
         SBHS.day(req.user.tokens.accessToken, function (err, o) {
            if (!err && o) {
                /* EXPERIMENTAL CACHE SETTINGS */
                res.set('Cache-Control', 'private, max-age=300');

                if (o.shouldDisplayVariations) {
                  var t=o.bells[o.bells.length-1].time.split(':'),
                      end=new Date(o.date);
                  end.setHours(parseInt(t[0])); end.setMinutes(parseInt(t[1]));
                  res.set('Cache-Control', 'private, max-age='+(end.getTime() - Date.now())/1000);
                }

                res.jsonp(o);
            } else {
                res.status(500).send("500 Internal Server Error");
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

app.get('/*', function(req, res) {
  res.render('404', {name: req.user ? req.user.givenName : null })
});

app.listen(port, ip);
