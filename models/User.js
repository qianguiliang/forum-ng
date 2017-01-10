//用户类
var mongoose = require('mongoose');
//Schema对象
var Schema = mongoose.Schema;

//设置Schema
var userSchema = new Schema({
    "id"        : Number,       //从1开始
    "email"     : String,       //注册、登陆邮箱
    "nickname"  : String,       //昵称
    "password"  : String,       //密码
    "birthday"  : Number,       //生日
    "sex"       : String,       //性别
    "info"      : String,       //简介
    "tel"       : Number,       //电话
    "attention" : [Number],     //关注
    "fans"      : [Number],     //被关注
    "like"      : [Number],     //点赞的帖子
    "comments"  : [Number],     //评论的帖子
    "posts"     : [Number]      //发布过的帖子
    // "collection": [String]      //收藏的帖子
})
//检查用户是否被占用
userSchema.statics.checkExist = function(email,callback){
    //this指向类名，非Schema
    this.find({'email': email},function(err,results){
        if(results.length == 0){
            callback(false);
        }else{
            callback(true);
        }
    });
};
//创建
var User = mongoose.model("users",userSchema);
module.exports = User;

