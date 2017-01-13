var express = require('express');
var app = express();
var session = require('express-session');
var router = require('./controller/router.js');
//数据库连接
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bbs');
//设置session
app.use(session({
    secret: 'houtai',
    // 过期时间，10天
    expires : new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    // 两个默认的配置，API要求
    resave: false,
    saveUninitialized: true
}));
//路由清单
app.get('/checkLogin',router.checkLogin);   //检查是否登录
// app.get('/userList',router.userList);       //获取用户列表
app.get('/userdetail',router.userdetail);   //获取用户详情
app.post('/createuser',router.createuser);  //创建用户
app.post('/changeuser',router.changeuser);  //修改用户资料
app.get('/newslist',router.newslist);       //获得新闻列表
app.get('/newsdetail',router.newsdetail);   //获得新闻详情
app.post('/createnews',router.createnews);  //创建新闻
app.get('/savepost',router.savepost);       //为用户增加发帖数据
app.post('/login',router.login);            //登陆
app.get('/logout',router.logout);           //登出
app.get("/checkexist",router.checkExist);   //Ajax接口，检查email是否被占用
app.post('/addLike',router.addLike);        //给帖子增减点赞
app.post('/postcomment',router.postcomment) //回复帖子
app.get('/findmyports',router.findmyports)  //获取我的帖子
app.post('/posttalk',router.posttalk)       //发表回复中的回复
// app.get('/',router.showIndex);              //显示首页


//静态化
app.use('/',express.static("./"));
app.use("/public",express.static("public"));
app.use("/uploads",express.static("uploads"));
//监听
app.listen(3000);