function randomInt(min, max) {
    return min + Math.floor((max - min) * Math.random());
}

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
 
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("dirtyDB");
  var avatar = dbo.collection("avatars").find({}).toArray(function(err, arrOfAvatars) {
    if (err) throw err;
    numberOfRandomAvatar = randomInt(0,arrOfAvatars.length) 
    var selectedAvatar = arrOfAvatars[numberOfRandomAvatar];
    console.log("The selected avatar is: ");
    console.log(selectedAvatar);
    db.close();
    return selectedAvatar;
  });
  return avatar;
});