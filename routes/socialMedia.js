var express = require('express');
var FacebookC = require('../models/facebookCrawler');
var worldExplorerC = require('../models/worldExplorerCrawler');
var profile = require('../models/profile');
var mongoose = require('mongoose');
var humHubC = require("../models/humhubCrawler");
var getTop5Arr = require("../models/top5Connections")
var router = express.Router();
var checkURL = require("../models/CheckingTheURL")
var getRandomFictitiousUser = require("../models/getRandomFictitiousUser")

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
    var socialMedia= await req.body.socialMedia;
    //validate url and username
    if(await checkURL.checkURL(userName,url,socialMedia)){
      if(await socialMedia == "WorldExplorer"){
        worldExplorerC.crawler(userName,url,socialMedia);
     }
      else if(await socialMedia == "humhub"){
       humHubC.crawler(userName,url,socialMedia);
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

//get all posts of  user
router.get('/allposts',withAuth, async function (req, res, next) {
  let userJson=JSON.parse(req.query.user);
  profile
  .findOne({userName:userJson.userName,crawlingTime:userJson.crawlingTime ,socialMedia:req.query.socialMedia}).populate('posts').exec( function(err,doc){
    if(err){
      global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
      res.json({allPosts:[]})
    }
    else{
      if(doc==null){
        res.json({allPosts:[]});
      }
      else{
        res.json({allPosts:doc.posts})
      }
    }
 
       });
  });

  router.get('/getSavedPosts',withAuth, async function (req, res, next) {
    let userJson=JSON.parse(req.query.user);
     mongoose.disconnect();
    await mongoose.connect('mongodb://localhost:27017/CleanDB',{useNewUrlParser: true});
    profile
    .findOne({userName:userJson.userName ,socialMedia:req.query.socialMedia,filter:req.query.filter,crawlingTime:userJson.crawlingTime}).populate('posts').exec( async function(err,doc){
      await mongoose.disconnect();
      await mongoose.connect('mongodb://localhost:27017/dirtyDB', { useNewUrlParser: true });
      if (err) {
        global.logger.error("error when trying to find user from database", { meta: { err: err.message } })
        res.sendStatus(500);
      }
      else {
        res.status(200).json({ allPosts: doc.posts, connections: doc.bestConnections });
      }

    });
});

  
router.get('/filterPosts',withAuth, async function (req, res, next) {
  let userJson=JSON.parse(req.query.user);

         profile.findOne({userName:userJson.userName,crawlingTime:userJson.crawlingTime,socialMedia:req.query.socialMedia}).populate({path: 'posts',
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
        let setOfAllUsers;
        let users=[];
          if(err){
            global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
            res.sendStatus(500);
          }
          else{
            doc.forEach(function(user) {
              users.push({userName:user.userName,crawlingTime:user.crawlingTime});
            });
            }
            // casting to json then using set (remove duplicates) and then casting to object again 
            jsonObject = users.map(JSON.stringify); 
            setOfAllUsers=new Set(jsonObject);
            var arrOfAllUserName =  Array.from(setOfAllUsers).map(JSON.parse);
           
            global.logger.info("success to get All UserNames", {meta: {users:arrOfAllUserName}})    
            res.status(200).json({users:arrOfAllUserName})  
       
        });
      });
      
    router.get('/getAllFilters',withAuth,async function (req, res, next) {
      let userJson=JSON.parse(req.query.user);
      await mongoose.disconnect();
      await mongoose.connect('mongodb://localhost:27017/CleanDB',{useNewUrlParser: true});
      profile.find({socialMedia:req.query.socialMedia,userName:userJson.userName,crawlingTime:userJson.crawlingTime}).exec(async function(err,doc){
		  var AllFilters;
		  //avoid duplicates
		  var setOfFilters=new Set();
        await mongoose.disconnect();
        await mongoose.connect('mongodb://localhost:27017/dirtyDB',{useNewUrlParser: true});
          if(err){
            global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
            res.sendStatus(500);
          }
          else{
            doc.forEach(function(user) {
					setOfFilters.add(user.filter);
            }
            );
            AllFilters=Array.from(setOfFilters);
          }
          global.logger.info("success to get AllFilters", {meta: {AllFilters:AllFilters}})    
          res.status(200).json({filters:AllFilters});
       
        });
    });
    
    router.post('/saveResults',withAuth, async function (req, res, next) {
    let filter;
    if(req.body.filter=="no filter"){  //case user want so save all posts
    filter="";
    }
    else{
      filter=req.body.filter;
    }
      profile.findOne({userName:req.body.user.userName,crawlingTime:req.body.user.crawlingTime,socialMedia:req.body.socialMedia}).populate({path: 'posts',
      match: { postContent:{"$regex":filter, "$options": "i"}}}).exec( async function(err,doc){
        if(err){
          global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
          res.json({isSucess:"false"})  
        }
        else{
			    var top5Connections =  await getTop5Arr.getTop5connections(doc,req.body.user.userName);
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