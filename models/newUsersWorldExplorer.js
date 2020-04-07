var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var newUserSchema = new Schema({
    fullName: {type:String},
    userName: {type:String},
    email: {type:String},
    password: {type:String},
    creatTime:{type:Date}
});

module.exports=mongoose.model('newUsersWorldExplorer',newUserSchema);





