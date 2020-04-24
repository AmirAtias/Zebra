var express = require('express');
var FacebookC = require('../models/facebookCrawler'); 
var worldExplorerC = require('../models/worldExplorerCrawler');
var profile=require('../models/profile');
var mongoose=require('mongoose');
var humHubC=require("../models/humhubCrawler");
var getTop5Arr = require("../models/top5Connections")
var router = express.Router();
var checkURL = require("../models/CheckingTheURL")
const withAuth = require('./middleware')
router.get('/requestStatus',async function(req, res, next){
    if(reqStatus){
      res.json({handleRequest:true})
    }
    else{
      res.json({handleRequest:false})

    }
  });
router.post('/startCrawling',withAuth, async function (req, res, next) {
  try{
    var userName= await req.body.userName;
    var url= await req.body.url;
    var socialMedia= await req.body.socialMedia
    //validate url and username
    if(await checkURL.checkURL(userName,url,"humhub")){
      if (await socialMedia == "Facebook"){
      //await FacebookC(userName,url)
       await humHubC.crawler(userName,url);
     }
      else if(await socialMedia == "WorldExplorer"){
       await worldExplorerC.crawler(userName,url);
     }
      else if(await socialMedia == "Humhub"){
      await humHubC.crawler(userName,url);
     }
    res.json({validationSucess:"true"});
    }
    else{
    res.json({validationSucess:"false",message:"The username or url is incorrect.Please change them and try again."});
   }
  }
  catch (error) { 
    console.log(error);
  }

});

//here-done
//get all posts of  user
router.get('/allposts',withAuth, async function (req, res, next) {
  console.log(req.query.user);
  profile
  .findOne({userName:req.query.user.userName,crawlingTime:req.query.user.crawlingTime ,socialMedia:req.query.socialMedia}).populate('posts').exec( function(err,doc){
    if(err){
      global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
      res.json({allPosts:[]})
    }
    else{
      console.log(doc)
      if(doc==null){
        res.json({allPosts:[]});
      }
      else{
        res.json({allPosts:doc.posts})
      }
    }
 
       });
  });
 //here
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
        res.status(200).json({allPosts:doc.posts,connections:doc.bestConnections});
      }
   
         });
    });

  
  //here-done
  router.get('/filterPosts',withAuth, async function (req, res, next) {
		profile.findOne({userName:req.query.user.userName,crawlingTime:req.query.user.crawlingTime,socialMedia:req.query.socialMedia}).populate({path: 'posts',
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

    //done
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
              setOfAllUsers.add({userName:user.userName,crawlingTime:user.crawlingTime});
            });
            }
            var arrOfAllUserName = [...setOfAllUsers];
            global.logger.info("success to get All UserNames", {meta: {users:arrOfAllUserName}})    
            res.status(200).json({users:arrOfAllUserName})  
       
        });
      });
    //here
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
    //done
    router.post('/saveResults',withAuth, async function (req, res, next) {
    profile
    .findOne({userName:req.body.user.userName,crawlingTime:req.body.user.crawlingTime,socialMedia:req.body.socialMedia}).populate({path: 'posts',
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