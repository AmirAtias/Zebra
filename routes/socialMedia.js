var express = require('express');
var FacebookC = require('../models/facebookCrawler');
var crawlingReq=require('../models/crawlingRequests');
var facebookPosts=require('../models/facebookPosts');

var router = express.Router();

router.get('/facebook', function (req, res, next) {
res.render("facebook");
});

router.post('/facebook', function (req, res, next) {
  var UserName=req.body.userName;
  var Url=req.body.url;
  FacebookC.crawler(UserName,Url);
  res.redirect('/')

});
router.get('/results', async function (req, res, next) {
  var allPosts={};
  await facebookPosts.findOne({facebookUserName:"Amit Atias"},function(err,doc){
    if(err){
      console.log(err);
    }
    else{
      allPosts=doc;
    }
  });
  res.render("socialMediaPosts",{allPosts:allPosts.posts,facebookUserName:"Amit Atias"});
  });

  router.post('/results', async function (req, res, next) {
    var allPosts={};
    
    console.log(req.body.filter);
    //'posts.postContent':{ "$regex": req.body.filter, "$options": "i" 
    await facebookPosts.find({"facebookUserName":{"$regex":"atias", "$options": "i"}},function(err,doc){
      if(err){
        console.log(err);
      }
      else{
        allPosts=doc[0];
        console.log(doc.length);
      }
    });
    res.render("socialMediaPosts",{allPosts:allPosts.posts,facebookUserName:"Amit Atias"});
    });
  
module.exports = router;
