var mongoose=require('mongoose');
var Schema=mongoose.Schema;

var postSchema=new Schema({
    postHeader: {type:String},
    postContent:{type:String},
    comments:[{commentHeader:String, commentContent:String, commentTime:String}],
    postTime: {type:String}
});
module.exports=mongoose.model('Post',postSchema);