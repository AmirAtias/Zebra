var mongoose = require('mongoose');
var avatar = require('../models/avatar');

function randomInt(min, max) {
  return min + Math.floor((max - min) * Math.random());
}

async function getRandomAvatar(req, res, socialMedia) {
  //{socialMedia: socialMedia}
  await mongoose.disconnect();
  await mongoose.connect('mongodb://localhost:27017/dirtyDB');

  var result = await avatar.find({}).populate('avatars');
  var numberOfRandomAvatar = await randomInt(0, result.length)
  var selectedAvatar = result[numberOfRandomAvatar];
  var data = [];
  data[0] = await selectedAvatar.userName;
  data[1] = await selectedAvatar.password;
  
  return data;
}

module.exports.getRandomAvatar = getRandomAvatar;