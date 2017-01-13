var formidable = require("formidable");
var fs = require("fs");
var crypto = require("crypto");             //加密
var url = require("url");
var User = require("../models/User.js");
var Post = require('../models/Post.js');
//显示首页
// exports.showIndex = function(req,res){
//     res.redirect('index.html')
// }
//检查是否登录
exports.checkLogin = function(req,res){
    if(req.session.login == true){
        res.send({
            data: req.session.email,
            nickname: req.session.nickname,
            errno: 0
        })
    }else{
        res.send({
            data: '',
            errno: 0
        })
    }

};
//登陆
//-1服务器错误
//-2没有这个用户
//-3密码不正确
//1登陆成功
exports.login = function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
        if(err){
            res.send("-1");
            return;
        }
        var email = fields.email;
        var hash = crypto.createHash("sha256");
        var passwordSha256 = hash.update(fields.password).digest("hex");
        User.find({'email': email},function(err,results){
            if(err){
                res.send("-1");
                return;
            }
            if(results.length == 0){
                res.send("-2");
                return;
            }
            //密码不匹配
            if(results[0].password != passwordSha256){
                res.send("-3");
                return;
            }
            //设置session
            req.session.login = true;
            req.session.email = email;
            req.session.nickname = results[0].nickname;
            res.send(results[0]);
        })
    })
}
//登出事件
exports.logout = function(req,res){
    req.session.login = false;
    req.session.email = null;
    res.send('1');
}
//检查注册邮箱是否被占用
exports.checkExist = function(req,res){
    var email = req.query.email;
    User.checkExist(email,function(bollean){
        res.send(bollean.toString());
    })
}

//创建用户
//-1服务器错误
//1成功
exports.createuser = function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        if(err){
            res.send("-1");
            return;
        }
        // console.log(fields);
        var hash = crypto.createHash("sha256");
        var passwordSha256 = hash.update(fields.password).digest("hex");
        var u = new User({
            "email": fields.email,
            "password": passwordSha256
        });
        u.save(function(err){
            if(err){
                res.send("-1");
                return;
            }
            //设置session
            req.session.login = true;
            req.session.email = fields.email;
            res.send("req.session.email");
        })
    })
};
//获得新闻列表
exports.newslist = function(req,res){
    Post.find({},null, {sort: {'_id': -1}},function(err,results){
        if(err){
            res.send('-1');
        }
        res.send(results);
    })
};
//给帖子增加点赞
//-1服务器错误
//-2已经点过赞
//-3没有登录
//1成功
exports.addLike = function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        if(err){
            res.send('-1');
        }
        var id = fields.id;
        var user = req.session.email;
        if(!user){
            res.send('-3');
            return;
            
        }
        Post.find({'_id': id},function(err,results){
            if(err){
                res.send('-1');
            }
            //查看是否已经点过赞
            for(var i = 0;i < results[0].like.length;i++){
                if(results[0].like[i] == user.toString()){
                    res.send('-2');
                    return;
                }
            }
            results[0].like.push(user);
            results[0].save(function(err){
                if(err){
                    res.send("-1");
                    return;
                }
                res.send("1");
            })
        })
    })
}
//回复帖子
exports.postcomment = function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        if(err){
            console.log('-1');
        }
        var date = fields.date;
        var userName = req.session.email;
        var comment = fields.text.$viewValue;
        var nickname = req.session.nickname;
        var putcommentid = fields.putcommentid;
        var commentObj = {
            date: date,
            commenttext: comment,
            commentuser: userName,
            nickname : nickname
        }

        Post.find({'_id': putcommentid},function(err,results){
            if(err){
                res.send('-1');
                return;
            }
            results[0].comments.push(commentObj);
            results[0].save(function(err){
                if(err){
                    res.send("-1");
                    return;
                }
                res.send("1");
            })
        })
    })
}
//发表回复中的回复
exports.posttalk = function (req,res) {
    var form = new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        if(err){
            console.log('-1');
        }
        var hash = fields.hash;     //talk的标识
        var detail = fields.detailId;   //帖子的标识
        var word = fields.word;
        var toemail = fields.toemail;
        Post.findById(detail)
            // .where({'_id': hash})
            .exec(function (err,doc) {
                if(err) {res.send('-1');return;}
                doc.comments.forEach(function (value,index) {
                    if(doc.comments[index]._id == hash){
                        doc.comments[index].talk.push({
                            word: word,
                            fromemail: req.session.email,
                            toemail: toemail,
                            talkdate: +new Date()
                        })
                        doc.save(function(err){
                            if(err){
                                res.send("-1");
                                return;
                            }
                            res.send("1");
                        })
                    }
                })
            })
    })
}
//获得新闻详情
exports.newsdetail = function(req,res){
    var id = req.query.id;
    Post.find({'_id': id},function(err,results){
        if(err){
            res.send('-1')
        }
        res.send(results[0]);
    })
};
//创建新闻
//-1服务器错误
//1成功
exports.createnews = function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        if(err){
            res.send("-1");
            return;
        }
        var p = new Post({
            "title": fields.title,
            "content": fields.content,
            "date": fields.date,
            "userName": req.session.email,
            'userNickname': req.session.nickname
        });
        p.save(function(err){
            if(err){
                res.send("-1");
                return;
            }
            res.send("1");
        })
    })
};
//为用户增加发帖数据
exports.savepost = function (req,res) {
    var date = req.query.date;
    User.find({'email': req.session.email},function(err,results){
        results[0].posts.push(date);
        results[0].save(function(err){
            if(err){
                res.send("-1");
                return;
            }
            res.send("1");
        });
    })
}
//获取用户详情
exports.userdetail = function(req,res){
    var user = req.session.email;
    User.find({'email': user},function(err,results){
        if(err){res.send('-1')}
        res.send(results[0])
    })
}
//修改用户资料
exports.changeuser = function(req,res){
    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        if(err){res.send('-1')}
        var id = req.session.email;
        User.find({'email': id},function(err,results){
            if(err){res.send('-1');return}
            var isChangeNickname = !(results[0].nickname == fields.nickname);
            results[0].nickname = fields.nickname;
            results[0].tel = fields.tel;
            results[0].sex = fields.sex;
            results[0].info = fields.info;
            results[0].save(function(err){
                if(err){
                    res.send("-1");
                    return;
                }
                // res.send("1");
            })
            //如果更改了nickname，需要修改posts中的userNickname
            if(isChangeNickname){
                Post.find({'userName': id},function (err,results) {
                    if(err){res.send('-1');return};
                    results.forEach(function (value,index) {
                        results[index].userNickname = fields.nickname;
                        results[index].save()
                    })
                })

                //同时要遍历所有posts内相关的
                //comments内
                Post.find({'comments.commentuser': id},function (err,results) {
                    if(err){res.send('-1');return};
                    results.forEach(function (value,index) {
                        // console.log(results[index])
                        results[index].comments.forEach(function (v,i) {
                            results[index].comments[i].nickname = fields.nickname;
                            results[index].save();
                        })
                    })
                })
                // //talk内的 发送者
                // Post.find({'comments.talk.fromemail': id},function (err,results) {
                //     if(err){res.send('-1');return};
                //     results.forEach(function (value,index) {
                //         console.log(222)
                //         results[index].comments.forEach(function (v,i) {
                //             console.log(results[index].comments)
                //             results[index].comments[i].talk.forEach(function (vs,is) {
                //                 results[index].comments[i].talk[is].fromnick = fields.nickname;
                //                 results[index].save();
                //             })
                //         })
                //     })
                // })
                //两种方式都可以save
                Post.find()
                    .where('comments.talk.fromemail').equals(id)
                    .exec(function (err,doc) {
                        if(err){res.send('-1');return};
                        doc.forEach(function (value,index) {
                            doc[index].comments.forEach(function (v,i) {
                                doc[index].comments[i].talk.forEach(function (vs,is) {
                                    // console.log(doc[index].comments[i].talk[is])
                                    if(doc[index].comments[i].talk[is].fromemail == id)
                                    doc[index].comments[i].talk[is].fromnick = fields.nickname;
                                    doc[index].save();
                                })
                            })
                        })
                    })
                // //talk内的 接受者
                Post.find()
                    .where('comments.talk.toemail').equals(id)
                    .exec(function (err,doc) {
                        if(err){res.send('-1');return};
                        doc.forEach(function (value,index) {
                            doc[index].comments.forEach(function (v,i) {
                                doc[index].comments[i].talk.forEach(function (vs,is) {
                                    if(doc[index].comments[i].talk[is].toemail == id)
                                    doc[index].comments[i].talk[is].tonick = fields.nickname;
                                    doc[index].save();
                                })
                            })
                        })
                    })
                res.send("1");
            }else {
                res.send("1");
            }
        })


    })
}
//获取我的帖子
exports.findmyports = function (req,res) {
    var user = req.session.email;
    User.find({'email': user},function(err,results){
        if(err){res.send('-1')}
        var posts = results[0].posts
        Post.where('date').in(posts).sort({'_id':-1}).exec(function (err,docs) {
            if(err){res.send('-1')}
            res.send(docs)
        })
    })
}