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
   facebookPosts.findOne({facebookUserName:"Amit Atias"}).populate('posts').exec( function(err,doc){
    if(err){
      console.log(err);
    }
    else{
    
      res.render("socialMediaPosts",{allPosts:doc.posts,facebookUserName:"Amit Atias"});
    }
  });


  
  });

  router.post('/results', async function (req, res, next) {
    console.log(req.body.theName);
    console.log(req.body.filter);
    //'posts.postContent':{ "$regex": req.body.filter, "$options": "i" 
    facebookPosts.findOne({facebookUserName:"Amit Atias"}).populate({path: 'posts',
    match: { postContent:{"$regex": req.body.filter, "$options": "i"}}}).exec( function(err,doc){
      if(err){
        console.log(err);
      }
      else{
  
        res.render("socialMediaPosts",{allPosts:doc.posts,facebookUserName:"Amit Atias"});

      }
    });
    //res.render("socialMediaPosts",{allPosts:allPosts.posts,facebookUserName:"Amit Atias"});
    });
  
module.exports = router;
