var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var crawlingSchema=new Schema({
    socialMedia:{type:String,required:true},
    requestHandling:{type:Boolean,required:true}
});

module.exports=mongoose.model('crawlingReqursts',crawlingSchema);

