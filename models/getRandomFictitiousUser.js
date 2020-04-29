var mongoose = require('mongoose');
var avatar = require('../models/avatar');

function randomInt(min, max) {
  return min + Math.floor((max - min) * Math.random());
}

async function getRandomAvatar(socialMedia) {
  try{
  await mongoose.disconnect();
  await mongoose.connect('mongodb://localhost:27017/dirtyDB',{ useNewUrlParser: true ,useUnifiedTopology: true });
  var result = await avatar.find({ socialMedia : socialMedia});
  console.log(result);

  var numberOfRandomAvatar = await randomInt(0, result.length)
  var selectedAvatar = result[numberOfRandomAvatar];
  console.log(selectedAvatar);
  var data = [];
  data[0] = await selectedAvatar.userName;
  data[1] = await selectedAvatar.password;

  return data;
}
catch(err){
  console.log(err)
}
}

module.exports.getRandomAvatar = getRandomAvatar;