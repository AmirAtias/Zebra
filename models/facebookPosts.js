var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var Post=require("./post");
var facebookSchema = new Schema({
url:{type:String,required:true},
facebookUserName:{type:String,required:true},
posts:[{type:Schema.Types.ObjectId,ref:'Post'}],
filter:{type:String}
});

module.exports=mongoose.model('FacebookPosts',facebookSchema);

