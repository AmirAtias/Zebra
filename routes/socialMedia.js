var express = require('express');
var FacebookC = require('../models/facebookCrawler'); 
var worldExplorerC = require('../models/worldExplorerCrawler');
var crawlingReq=require('../models/crawlingRequests');
var profile=require('../models/profile');
var posts=require('../models/post');
var mongoose=require('mongoose');
var router = express.Router();
var app=require("../app");
const withAuth = require('./middleware')
router.get('/requestStatus',async function(req, res, next){
    if(reqStatus){
      res.json({handleRequest:true})
    }
    else{
      res.json({handleRequest:false})

    }
  });
router.post('/startCrawling',withAuth, function (req, res, next) {
  var UserName=req.body.userName;
	var Url=req.body.url;
	var socialMedia=req.body.socialMedia
	//validate url and username
	console.log("username:"+UserName+" url" +Url +"socialMedia" +socialMedia)
 FacebookC.crawler("sdds","sdsd","sdsds");
 res.json({validationSucess:"true"});

});


//get all posts of  user
router.get('/allposts',withAuth, async function (req, res, next) {
  profile
  .findOne({userName:req.query.userName ,socialMedia:req.query.socialMedia}).populate('posts').exec( function(err,doc){
    if(err){
      console.log(err);
      res.json({allPosts:[]})
    }
    else{
      res.json({allPosts:doc.posts});
    }
 
       });
  });

  

  router.get('/filterPosts',withAuth, async function (req, res, next) {
	 
		profile.findOne({userName:req.query.userName ,socialMedia:req.query.socialMedia}).populate({path: 'posts',
    match: { postContent:{"$regex": req.query.filter, "$options": "i"}}}).exec( function(err,doc){
      if(err){
        console.log(err);
				res.json({allPosts:[]})
      }
      else{
				res.json({allPosts:doc.posts})
      }
      });
    });
    router.get('/displayAllUsers',withAuth, async function (req, res, next) {
      profile.find({socialMedia:req.query.socialMedia}).exec( function(err,doc){
        var arrOfAllUserName = [];
          if(err){
            console.log(err);
          }
          else{
            doc.forEach(function(user) {
              arrOfAllUserName.push(user.userName);
            }
            );
           res.json({users:arrOfAllUserName});
          }
       
        });
      });
    router.post('/saveResults',withAuth, async function (req, res, next) {
   profile
    .findOne({userName:req.body.userName,socialMedia:req.body.socialMedia}).populate({path: 'posts',
      match: { postContent:{"$regex": req.body.filter, "$options": "i"}}}).exec( async function(err,doc){
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
          doc.filter=req.body.filter
          await doc.save();
          await mongoose.disconnect();
          await mongoose.connect('mongodb://localhost:27017/dirtyDB',{useNewUrlParser: true});

          res.json({isSucess:"true"})  
      }})
      
      });
  
module.exports = router;
