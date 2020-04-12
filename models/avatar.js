var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var avatarSchema = new Schema({
    fullName: {type:String},
    userName: {type:String},
    email: {type:String},
    password: {type:String},
    creatTime:{type:Date}
});



module.exports=mongoose.model('Avatar',avatarSchema);





