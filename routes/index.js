var express = require('express');
var router = express.Router();
var crawlingReq=require('../models/crawlingRequests');


router.post('/sendLogs', function(req, res, next) {
  global.logger.log(req.body.msg, { level:req.body.level, app: 'Zebra-UI'})
    res.status(200);
});

module.exports = router;
