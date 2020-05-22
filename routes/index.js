var express = require('express');
var router = express.Router();


router.post('/sendLogs', function(req, res) {
  global.logger.log(req.body.msg, { level:req.body.level, app: 'Zebra-UI'})
    res.status(200);
});

module.exports = router;
