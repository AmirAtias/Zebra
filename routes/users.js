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

router.post('/signup', (req, res, next) => {
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
    return res.send({
      success: false,
      message: 'Error: first name cannot be blank.'
    });
  }
    if (!lastName) {
      return res.send({
        success: false,
        message: 'Error: last name cannot be blank.'
      });
    
  }
  if (!email) {
    return res.send({
      success: false,
      message: 'Error: Email cannot be blank.'
    });
  }
  if (!password) {
    return res.send({
      success: false,
      message: 'Error: Password cannot be blank.'
    });
  }
  
  email = email.toLowerCase();
  email = email.trim();
  if(!validator.validate(email)){
    return res.send({
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
      return res.send({
        success: false,
        message: 'Error: Server error'
      });
    } else if (previousUsers.length > 0) {
      return res.send({
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
        return res.send({
          success: false,
          message: 'Error: Server error'
        });
      }
      return res.send({
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
    return res.send({
      success: false,
      message: 'Error: Email cannot be blank.'
    });
  }
  if (!password) {
    return res.send({
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
      console.log('err 2:', err);
      return res.send({
        success: false,
        message: 'Error: server error'
      });
    }
    if (users.length != 1) {
      return res.send({
        success: false,
        message: "email doesn't exist"
      });
    }
    user = users[0];
    if (!user.validPassword(password)) {
      return res.send({
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
     console.log(token)
     res.cookie('token', token, { httpOnly: true }).send({
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
  res.clearCookie('token').sendStatus(200);

});
router.get('/getLoginName',function(req, res) {
res.json({userName:global.userName})
})
module.exports = router;
