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
mongoose.set('useFindAndModify', false);
var app = express();
mongoose.connect('mongodb://localhost:27017/dirtyDB',{useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', '.hbs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
resetReq.resetCrawlingReq();
app.use(async function(req, res, next){
  var exists=false
 await  crawlingReq.find({socialMedia:"facebook"},function (err, doc){
    if(err){
      console.log(err)
    }
    if(doc[0].requestHandling){
      app.locals.reqStatus=doc[0].requestHandling;
      exists=true;
    }  
  });
if(!exists){
await  crawlingReq.find({socialMedia:"worldExplorer"},function (err, doc){
    if(err){
      console.log(err)
    }
    
    if(doc[0].requestHandling){
      
      app.locals.reqStatus=doc[0].requestHandling;
      exists=true;

    }
  });
  if(!exists){
    app.locals.reqStatus=false;
  }

}  
  next();
  });

app.use('/socialMedia',socialMedia)
app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
