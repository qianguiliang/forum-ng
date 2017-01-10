// 获取应用程序
angular.module('myApp', ['ui.router'])
// 第四步，在配置中定义路由
.config(function ($stateProvider, $urlRouterProvider) {
	// 通过state方法定义状态
	$stateProvider
	// 定义首页路由
	.state('home', {
		url: '/home', 	//定义路径
		views: {
			main: {
				templateUrl:'view/home.html',
				controller: 'homeCtrl'
			},
			slider: {
				templateUrl: 'view/recommend.html',
				controller: 'recommendCtrl'
			}
		}
	})
	//定义帖子详情路由
	.state('details',{
		url: '/details/:newsID',
		views: {
			main: {
				templateUrl:'view/details.html',
				controller: 'detailsCtrl'
			},
			slider: {
				templateUrl: 'view/recommend.html',
				controller: 'recommendCtrl'
			}
		}
	})
	//定义个人主页路由
	.state('personage',{
		url: '/personage',
		views: {
			main: {
				templateUrl: 'view/personage.html',
				controller: 'personageCtrl'
			},
			slider: {
				templateUrl: 'view/recommend.html',
				controller: 'recommendCtrl'
			}

		}
	})

	// 定义默认路由 => 首页
	$urlRouterProvider
		.otherwise('/home')
})
.service('checkLogin',function($rootScope, $location){
	this.check = function () {
		// 判断用户是否登录过，只需要判断根作用域下是否有userName信息
		if (!$rootScope.userEmail) {
			return false;
		}
		return true;
	}
})
// 定义头部控制器
.controller('headerCtrl', function ($scope, $http, $location, $rootScope) {
	// 查看用户是否登录过
	$rootScope.isShow = false;
	// $scope.isShow = false;
	$scope.showList = function () {
		$rootScope.isShow = !$rootScope.isShow;
	}
	$http.get('/checkLogin')
	// 监听回调函数
		.success(function (res) {
			if(res.errno === 0 && res.data){
				$rootScope.isLogin = true;
				$rootScope.userEmail = res.data;
				$rootScope.nickname = res.nickname;
			}else{
				$rootScope.isLogin = false;
			}
		})
	//登陆事件
	$scope.logIn = function(){
		$http.post('/login',$scope.logdata)
			.success(function(res){
				if(res == -1){
					alert("服务器错误");
				}else if(res == -2){
					alert("没有这个用户");
				}else if(res == -3){
					alert("密码错误");
				}else{
					$rootScope.isLogin = true;
					$rootScope.userEmail = $scope.logdata.email;
					$rootScope.nickname = res.nickname;
					alert("登陆成功！");
					history.go('0');
				}
			})
	}
	//登出事件
	$scope.logOut = function(){
		$http.get('/logout')
			.success(function(res){
				$rootScope.isLogin = false;
				$rootScope.userEmail = '';
				$rootScope.nickname = '';
				window.location = '/';
			})
	}
	//注册事件
	$scope.regAll = function(){
		delete $scope.data.password2;
		$http.post('/createuser',$scope.data)
			.success(function(res){
				// console.log(res);
				if(res == '-1'){
					alert("对不起，服务器错误");
				}else{
					$rootScope.userEmail = res;
					$rootScope.isLogin = true;
					alert("恭喜，注册成功,并自动登录");
					history.go('0');
				}
			})
	}
	//检查两次密码是否输入一致
	$scope.checkPassword = function(){
		var ps1 = $scope.data.password;
		var ps2 = $scope.data.password2;
		if(ps1 === ps2){
			$scope.checkPas = true;
		}else{
			$scope.checkPas = false;
		}
	}
	//检查注册邮箱是否被占用
	$scope.checkEmail = function(){
		if($scope.regist.Email.$invalid){
			return;
		}
		// console.log($scope.data.email);
		$http.get('/checkexist',{
			params: {
				email: $scope.data.email
			}
		})
			.success(function(res){
				if(res === 'false'){
					$scope.checkExist = true;
				}else{
					$scope.checkExist = false;
				}
			})
	}
	// 显示页面
	$rootScope.isShowAll = 'block';

})
//定义主页控制器
.controller('homeCtrl',function ($scope, $http,$rootScope,checkLogin) {
	//获取新闻列表
	$http.get('newslist')
		.success(function (res) {
			if (res == '-1') {
				alert('获取新闻列表失败');
			}else {
				$scope.news = res
				// console.log($scope.news)
			}
		})
	//发布新主题
	$scope.creatPost = function (){
		//检查是否登录
		if(checkLogin.check()){
			$scope.data.date = new Date().getTime();
			$http.post('/createnews', $scope.data)
				.success(function (res) {
					if (res == '-1') {
						alert("对不起！服务器错误");
					} else {
						alert("发布成功！");
					}
				})
			//添加个人发帖
			$http.get('/savepost', {
				params: {
					date: $scope.data.date
				}
			})
				.success(function (res) {
					if (res == '-1') {
						console.log("增加发帖失败");
					} else {
						// console.log("增加发帖： " + res);
						window.location = '/';
					}
				})
		}else{
			alert("请登录！");
			return;
		}
	}
	//点赞
	$scope.addLike = function () {
		var id = arguments[0];
		$http.post('/addLike', {id: id})
			.success(function (res) {
				if (res === '-1') {
					alert("服务器错误！");
				} else if (res === '-2') {
					alert("已经点过赞了")
				} else if (res === '-3') {
					alert("请先登录！")
				}else{
					$http.get('newslist')
						.success(function (res) {
							if (res == '-1') {
								alert('获取新闻列表失败');
							}else {
								$scope.news = res
								console.log($scope.news)
							}
						})
				}
			})
	}
	//评论时绑定ＩＤ
	$scope.bind_id = function () {
		$scope.putcommentid = arguments[0];
	}
	//评论方法
	$scope.addComment = function () {
		//首先检查是否登录
		if(checkLogin.check()){
			$scope.comment.date = new Date().getTime();
			$scope.comment.putcommentid = $scope.putcommentid;
			$http.post('/postcomment', $scope.comment)
				.success(function (res) {
					if (res == '-1') {
						alert("对不起！服务器错误");
					} else {
						alert("回复成功！");
						window.location = '/';
					}
				})
		}else{
			alert("请先登录！")
			window.location = '/';
		}
	}
})
//详情页控制器
.controller('detailsCtrl',function($scope, $http, $rootScope, $stateParams,checkLogin){
	//获取各种信息
	$scope.detailId = $stateParams.newsID;
	$http.get('/newsdetail',{
		params: {id: $scope.detailId}
	})
		.success(function(res){
			$scope.title = res.title;
			$scope.date = res.date;
			$scope.userName = res.userName;
			$scope.nickname = res.userNickname;
			$scope.content = res.content;
			$scope.like = res.like;
			$scope.comments = res.comments.reverse();
		})
	// 发表回复
	$scope.addComment = function () {
		//首先检查是否登录
		if(checkLogin.check()){
			$scope.comment.date = new Date().getTime();
			$scope.comment.putcommentid = $scope.detailId;
			console.log($scope.comment)
			$http.post('/postcomment', $scope.comment)
				.success(function (res) {
					if (res == '-1') {
						alert("对不起！服务器错误");
					} else {
						alert("回复成功！");
						// window.location = '#/details/' + $scope.detailId;
						history.go('0');
					}
				})
		}else{
			alert("请先登录！")
			history.go('0');
		}
	}
})
.controller('recommendCtrl',function () {})
//个人资料页
.controller('personageCtrl',function ($scope, $http, $rootScope, $stateParams,checkLogin) {
	if(!checkLogin.check()){
		alert("请先登录！即将返回首页");
		window.location = '/';
	}
	$scope.user = {
		nickname: '',
		tel: '',
		info: ''
	}
	$http.get('userdetail')
		.success(function(res){
			$scope.all = res;
			$scope.user.nickname = $scope.all.nickname;
			$scope.user.tel = $scope.all.tel;
			$scope.user.info = $scope.all.info;
			$scope.user.sex = $scope.all.sex;
		})
	//提交更改信息
	$scope.submitUser = function(){
		if($scope.user){
			var resutl = {
				nickname: $scope.user.nickname ? $scope.user.nickname : '',
				tel		: $scope.user.tel ? $scope.user.tel : null,
				sex		: $scope.user.sex ? $scope.user.sex : '',
				info	: $scope.user.info ? $scope.user.info : '',
			}
			$http.post('changeuser',$scope.user)
				.success(function(res){
					if(res == '-1'){
						alert("对不起！服务器错误")
					}else{
						alert("恭喜！保存成功！")
					}
				})
		}else {
			alert("您什么也没有提交哦~")
		}

	}
})
