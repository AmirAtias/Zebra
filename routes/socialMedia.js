var express = require('express');
var FacebookC = require('../models/facebookCrawler'); 
var worldExplorerC = require('../models/worldExplorerCrawler');
var crawlingReq=require('../models/crawlingRequests');
var facebookPosts=require('../models/facebookPosts');
var posts=require('../models/post');
var mongoose=require('mongoose');
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

router.get('/worldExplorer', function (req, res, next) {
  res.render("worldExplorer");
  });
  
router.post('/worldExplorer', function (req, res, next) {
    var UserName=req.body.userName;
    var Url=req.body.url;
    worldExplorerC.crawler(UserName,Url);
    res.redirect('/')
  });

router.get('/results', async function (req, res, next) {
   facebookPosts.findOne({facebookUserName:"edenshavit"}).populate('posts').exec( function(err,doc){
    if(err){
      console.log(err);
    }
    else{
      res.render("socialMediaPosts",{allPosts:doc.posts,facebookUserName:"edenshavit",filter:false});
    }
 
  });
  });

  

  router.post('/results', async function (req, res, next) {
    console.log(req.body.theName);
    console.log(req.body.filter);
    //'posts.postContent':{ "$regex": req.body.filter, "$options": "i" 
    facebookPosts.findOne({facebookUserName:req.body.theName}).populate({path: 'posts',
    match: { postContent:{"$regex": req.body.filter, "$options": "i"}}}).exec( function(err,doc){
      if(err){
        console.log(err);
      }
      else{
  
        res.render("socialMediaPosts",{allPosts:doc.posts,facebookUserName:"edenshavit",filter:true,filterBy:req.body.filter});

      }
    });
    //res.render("socialMediaPosts",{allPosts:allPosts.posts,facebookUserName:"Amit Atias"});
    });
    router.get('/selectUser', async function (req, res, next) {
      facebookPosts.find({}).exec( function(err,doc){
        var arrOfAllUserName = [];
          if(err){
            console.log(err);
          }
          else{
            doc.forEach(function(user) {
              arrOfAllUserName.push(user.facebookUserName);
            });
        
            //res.send(arrOfAllUserName);  
            res.render("selectUserName",{allUserNames:arrOfAllUserName});
           
          }
       
        });
      });
    router.post('/saveResults', async function (req, res, next) {
      facebookPosts.findOne({facebookUserName:req.body.theName}).populate({path: 'posts',
      match: { postContent:{"$regex": req.body.filterBy, "$options": "i"}}}).exec( async function(err,doc){
        if(err){
          console.log(err);
        }
        else{
         await mongoose.disconnect();
          await mongoose.connect('mongodb://localhost:27017/CleanDB',{useNewUrlParser: true});
          for(post of doc.posts){
            post._id = mongoose.Types.ObjectId();
            post.isNew = true; //<--------------------IMPORTANT
            await post.save();
          }
          doc._id = mongoose.Types.ObjectId();
          doc.isNew = true; //<--------------------IMPORTANT
          doc.filter=req.body.filterBy
          await doc.save();
          await mongoose.disconnect();
          await mongoose.connect('mongodb://localhost:27017/dirtyDB',{useNewUrlParser: true});

          res.redirect('/')
  
        }
      });
      //res.render("socialMediaPosts",{allPosts:allPosts.posts,facebookUserName:"Amit Atias"});
      });
  
module.exports = router;
