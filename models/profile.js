var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var profileSchema = new Schema({
url:{type:String,required:true},
userName:{type:String,required:true},
posts:[{type:Schema.Types.ObjectId,ref:'Post'}],
filter:{type:String},
socialMedia:{type:String,required:true}
});

module.exports=mongoose.model('Profile',profileSchema);

