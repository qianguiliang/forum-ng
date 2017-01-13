//帖子类
var mongoose = require('mongoose');
//Schema对象
var Schema = mongoose.Schema;

//设置Schema
var postSchema = new Schema({
    "id"        : Number,       //帖子id，从1开始,可以用mongoDB的_id代替
    "title"     : String,       //标题
    "content"   : String,       //内容
    "userId"    : Number,       //发帖人ID
    "userName"  : String,       //发帖人邮箱
    "userNickname":String,      //发帖人昵称
    "date"      : Number,       //发帖日期
    "like"      : [String],     //点赞的用户ID
    "comments"  : [             //评论的用户ID
        {   date:           String,
            commenttext:    String,
            commentuser:    String,
            nickname   :    String,
            talk       : [                      //评论中的评论
                {
                    word         : String,      //内容
                    fromemail    : String,      //来自 email
                    toemail      : String,      //发送给
                    talkdate     : Number       //日期
                }
            ]
        }
    ]     
})

//创建
var Post = mongoose.model("posts",postSchema);
module.exports = Post;