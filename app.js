const express       = require('express');
const bodyParser    = require('body-parser');
const cookieSession = require('cookie-session');
const cookieParser  = require('cookie-parser');
const urllib        = require('url');
const path          = require('path');
const crypto        = require('crypto');

const config        = require('./config.json');
const defaultroutes = require('./routes/default');
const passwordauth  = require('./routes/password');
const webuathnauth  = require('./routes/webauthn.js');
const db            = require('./routes/dbutil.js');
const app           = express();
const i18n          = require("i18n");

i18n.configure({
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
  directory: __dirname + "/locales",
  objectNotation: true
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(bodyParser.json());

/* ----- session ----- */
app.use(cookieSession({
  name: 'session',
  keys: [crypto.randomBytes(32).toString('hex')],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(cookieParser())

/* ----- serve static ----- */
app.use(express.static(path.join(__dirname, 'static')));
app.use('/', defaultroutes)
app.use('/password', passwordauth)
app.use('/webauthn', webuathnauth)
app.use('/db', db)

app.use(i18n.init);
app.use(function (req, res, next) {
  if (req.session.locale) {
    i18n.setLocale(req, req.session.locale);
  }
  console.log(req.session);
  next();
});

const port = config.port || 3000;
app.listen(port);
console.log(`Started app on port ${port}`);

module.exports = app;
