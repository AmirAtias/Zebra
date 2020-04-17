var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressHbs = require('express-handlebars');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var socialMedia=require('./routes/socialMedia');
var crawlingReq=require('./models/crawlingRequests');
var resetReq=require('./models/resetCrawlingReq');
var mongoose=require('mongoose');
var cors = require('cors')
const config = require('config');
const logdna= config.get('logdna');
var Logger = require('logdna');
var options = {
    hostname: logdna.hostname,
    ip: logdna.ip,
    app: logdna.app }
options.index_meta = true;
options.tags = ['logging', 'nodejs', 'logdna'];
global.logger = Logger.createLogger(logdna.apikey, options);
mongoose.set('useFindAndModify', false);
var app = express();
mongoose.connect('mongodb://localhost:27017/dirtyDB',{useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', function(err){
  global.logger.error(err);
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(logger('dev',{skip: function (req, res) { return res.statusCode === 304 ||req.url ==='/sendLogs'}
,stream:{write:function(str){
  global.logger.log(str,{ level: 'Info'})
}} }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: 'http://localhost:4000', 
  credentials: true,
}));
app.use(cookieParser());

resetReq.resetCrawlingReq();
global.reqStatus=false;
global.userName="";
app.use('/socialMedia',socialMedia)
app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  global.logger.error(err.message)
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
