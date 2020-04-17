var express = require('express');
var FacebookC = require('../models/facebookCrawler'); 
var worldExplorerC = require('../models/worldExplorerCrawler');
var profile=require('../models/profile');
var mongoose=require('mongoose');
var humHubC=require("../models/humhubCrawler");
var getTop5Arr = require("../models/top5Connections")
var router = express.Router();
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
  worldExplorerC.crawler("guy hum hub","https://guyandamir-sn.humhub.com/u/guyamir/");
 res.json({validationSucess:"true"});

});


//get all posts of  user
router.get('/allposts',withAuth, async function (req, res, next) {
  profile
  .findOne({userName:req.query.userName ,socialMedia:req.query.socialMedia}).populate('posts').exec( function(err,doc){
    if(err){
      global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
      res.json({allPosts:[]})
    }
    else{
      res.json({allPosts:doc.posts});
    }
 
       });
  });

  router.get('/getSavedPosts',withAuth, async function (req, res, next) {
    await mongoose.disconnect();
    await mongoose.connect('mongodb://localhost:27017/CleanDB',{useNewUrlParser: true});
    profile
    .findOne({userName:req.query.userName ,socialMedia:req.query.socialMedia,filter:req.query.filter}).populate('posts').exec( async function(err,doc){
      await mongoose.disconnect();
      await mongoose.connect('mongodb://localhost:27017/dirtyDB',{useNewUrlParser: true});
      if(err){
        global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
        res.sendStatus(500);
      }
      else{
        res.status(200).json({allPosts:doc.posts});
      }
   
         });
    });

  

  router.get('/filterPosts',withAuth, async function (req, res, next) {
	 
		profile.findOne({userName:req.query.userName ,socialMedia:req.query.socialMedia}).populate({path: 'posts',
    match: { postContent:{"$regex": req.query.filter, "$options": "i"}}}).exec( function(err,doc){
      
      if(err){
        global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
				res.status(500).json({allPosts:[]})
      }
      else{
				res.status(200).json({allPosts:doc.posts})
      }
      
      });
    });
    router.get('/displayAllUsers',withAuth, async function (req, res, next) {
      if(req.query.cleanDb=="true"){
        await mongoose.disconnect();
        await mongoose.connect('mongodb://localhost:27017/CleanDB',{useNewUrlParser: true});
      }
      profile.find({socialMedia:req.query.socialMedia}).exec(async function(err,doc){
        if(req.query.cleanDb=="true"){
          await mongoose.disconnect();
          await mongoose.connect('mongodb://localhost:27017/dirtyDB',{useNewUrlParser: true});
        }
        //avoid duplicates 
        let setOfAllUsers=new Set();
          if(err){
            global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
            res.sendStatus(500);
          }
          else{
            doc.forEach(function(user) {
              setOfAllUsers.add(user.userName);
            });
            }
            var arrOfAllUserName = [...setOfAllUsers];
            global.logger.info("success to get All UserNames", {meta: {users:arrOfAllUserName}})    
            res.status(200).json({users:arrOfAllUserName})  
       
        });
      });
    
    router.get('/getAllFilters',withAuth,async function (req, res, next) {
      await mongoose.disconnect();
      await mongoose.connect('mongodb://localhost:27017/CleanDB',{useNewUrlParser: true});
      profile.find({socialMedia:req.query.socialMedia,userName:req.query.userName}).exec(async function(err,doc){
        var AllFilters = [];
        await mongoose.disconnect();
        await mongoose.connect('mongodb://localhost:27017/dirtyDB',{useNewUrlParser: true});
          if(err){
            global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
            res.sendStatus(500);
          }
          else{
            doc.forEach(function(user) {
              AllFilters.push(user.filter);
            }
            );
          
          }
          global.logger.info("success to get AllFilters", {meta: {AllFilters:AllFilters}})    
          res.status(200).json({filters:AllFilters});
       
        });
    });
    router.post('/saveResults',withAuth, async function (req, res, next) {
   profile
    .findOne({userName:req.body.userName,socialMedia:req.body.socialMedia}).populate({path: 'posts',
      match: { postContent:{"$regex": req.body.filter, "$options": "i"}}}).exec( async function(err,doc){
        if(err){
          global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
          res.json({isSucess:"false"})  
        }
        else{
          var top5Connections =  await getTop5Arr.getTop5connections(doc);
          await mongoose.disconnect();
          await mongoose.connect('mongodb://localhost:27017/CleanDB',{useNewUrlParser: true});
          for(post of doc.posts){
            post._id = mongoose.Types.ObjectId();
            post.isNew = true; //<--------------------IMPORTANT
            await post.save();
          }
          doc._id = mongoose.Types.ObjectId();
          doc.isNew = true; //<--------------------IMPORTANT
          doc.filter=req.body.filter;
          doc.bestConnections = top5Connections;
          await doc.save();
          await mongoose.disconnect();
          await mongoose.connect('mongodb://localhost:27017/dirtyDB',{useNewUrlParser: true});
          global.logger.info("user saved to cleandb", {meta: {user:doc.userName}})

          res.json({isSucess:"true"})  
      }})
      
      });
  
module.exports = router;