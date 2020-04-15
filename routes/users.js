var express = require('express');
var router = express.Router();
var app =require("../app");
// Import our User schema
const User = require('../models/User');
var validator = require("email-validator");
const config = require('config');
const secret= config.get('jwt.secret');
const withAuth = require('./middleware')
const jwt = require('jsonwebtoken');
var Logger = require('logdna');
router.post('/signup', (req, res, next) => {
  global.logger.log('test', { level: 'Warn'});
  const { body } = req;
  const {
    password
  } = body;
  let {
    email
  } = body;

  let {
    firstName
  } = body;
  let {
    lastName
  } = body;
  if (!firstName) {
    global.logger.info('first name cannot be blank.')
    return res.status(200).send({
      success: false,
      message: 'Error: first name cannot be blank.'
    });
  }
    if (!lastName) {
      global.logger.info('last name cannot be blank.')
      return res.status(200).send({
        success: false,
        message: 'Error: last name cannot be blank.'
      });
    
  }
  if (!email) {
    global.logger.info('Email cannot be blank.')
    return res.status(200).send({
      success: false,
      message: 'Error: Email cannot be blank.'
    });
  }
  if (!password) {
    global.logger.info('Password cannot be blank.')
    return res.status(200).info({
      success: false,
      message: 'Error: Password cannot be blank.'
    });
  }
  
  email = email.toLowerCase();
  email = email.trim();
  if(!validator.validate(email)){
    global.logger.info('invalid email address.', {meta: {email:email}})
    return res.status(200).send({
      success: false,
      message: 'Error: invalid email address.'
    });
  }
  // Steps:
  // 1. Verify email doesn't exist
  // 2. Save
  User.find({
    email: email
  }, (err, previousUsers) => {
    if (err) {
      global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
      return res.status(500).send({
        success: false,
        message: 'Error: Server error'
      });
    } else if (previousUsers.length > 0) {
      global.logger.info('Account already exist.',{meta: {email:email}})
      return res.status(200).send({
        success: false,
        message: 'Error: Account already exist.'
      });
    }
    // Save the new user
    const newUser = new User();
    newUser.firstName=firstName;
    newUser.lastName=lastName;
    newUser.email = email;
    newUser.password = newUser.generateHash(password);
    newUser.save((err, user) => {
      if (err) {
        global.logger.error("error when trying to save user to database", {meta: {err: err.message}})
        return res.status(500).send({
          success: false,
          message: 'Error: Server error'
        });
      }
      global.logger.info("Signed up",{meta:{user:newUser}})
      return res.status(200).send({
        success: true,
        message: 'Signed up'
      });
    });
  });
}); // end of sign up endpoint


router.post('/signin',async function(req, res, next){
  const { body } = req;
  const {
    password
  } = body;
  let {
    email
  } = body;
  if (!email) {
    global.logger.info('Email cannot be blank.')
    return res.status(200).send({
      success: false,
      message: 'Error: Email cannot be blank.'
    });
  }
  if (!password) {
    global.logger.info(' Password cannot be blank.')
    return res.status(200).send({
      success: false,
      message: 'Error: Password cannot be blank.'
    });
  }
  email = email.toLowerCase();
  email = email.trim();
  var user;
 await User.find({
    email: email
  }, (err, users) => {
    if (err) {
      global.logger.error("error when trying to find user from database", {meta: {err: err.message}})
      return res.status(500).send({
        success: false,
        message: 'Error: server error'
      });
    }
    if (users.length != 1) {
      global.logger.info("email doesn't exist",{meta:{email:email}})
      return res.status(200).send({
        success: false,
        message: "email doesn't exist"
      });
    }
    user = users[0];
    if (!user.validPassword(password)) {
      global.logger.info('Error: Invalid password')
      return res.status(200).send({
        success: false,
        message: 'Error: Invalid password'
      });
    }
  })
    // Otherwise correct user

     // Issue token
     const payload = { email };
     const token =  jwt.sign(payload, secret, {
       expiresIn: '1h'
     });
     global.userName=user.firstName;
     global.logger.info('success to sign in',{meta:{email:email}})
     res.status(200).cookie('token', token, { httpOnly: true }).send({
        success: true,
        message: 'success to sign in',
        userName:user.firstName
      });
 
});


router.get('/checkToken', withAuth, function(req, res) {
  res.sendStatus(200);
});
router.get('/logout', withAuth, function(req, res) {
  global.userName="";
  global.logger.info("Logout successful")
  res.clearCookie('token').sendStatus(200);

});
router.get('/getLoginName',function(req, res) {
res.json({userName:global.userName})
})
module.exports = router;
