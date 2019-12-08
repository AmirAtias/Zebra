var express = require('express');
var router = express.Router();
var crawlingReq=require('../models/crawlingRequests');


router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.render('home');
});

module.exports = router;
