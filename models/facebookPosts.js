var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var facebookSchema = new Schema({
url:{type:String,required:true},
facebookUserName:{type:String,required:true},
posts:[{
    postHeader: {type:String},
    postContent:{type:String},
    comments:[{type:String}]
}]
});

module.exports=mongoose.model('FacebookPosts',facebookSchema);

