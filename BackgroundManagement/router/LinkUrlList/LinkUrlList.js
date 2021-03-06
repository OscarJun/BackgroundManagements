
var express = require('express');
var fs = require('fs');//引入node的文件(夹)读写包
var router = express.Router();
var app = express();
var routeSql = require('../sql/routeSql.js');
var Sequelize = require('sequelize');
var sequelize = require('../sql/sqlConnect.js')
var Ipconfig = require('../Ipconfig/Ipconfig.js')


// 获取链接内容
router.get('/LinkUrlList',function(req,res){
<<<<<<< HEAD

	routeSql.AbpLink.findAll({where:{FileLinkId:req.query.Id,IsDeleted:false},order:[['ShowSort','ASC']],attributes:['Id','LinkUrl','Desc','ShowSort','FileLinkId']}).then(function(LinkData){
				res.send({error:0,result:LinkData});
			});
	// routeSql.FileLinkName.findOne({where:{LinkName:req.query.LinkName,IsDeleted:false}}).then(function(FileLinkData){
	// 	// console.log(FileLinkData)
	// 	if (FileLinkData) {
	// 		routeSql.AbpLink.findAll({where:{FileLinkId:FileLinkData.dataValues.Id,IsDeleted:false},order:[['ShowSort','ASC']],attributes:['Id','LinkUrl','Desc','ShowSort','FileLinkId']}).then(function(LinkData){
	// 			res.send({error:0,result:LinkData});
	// 		});
	// 	} else {
	// 		res.send({error:1,result:{msg:'还没有链接'}})
	// 	}
	// });
=======
	routeSql.AbpLink.findAll({where:{FileLinkId:req.query.Id,IsDeleted:false,ShowSort:{$ne:0}},order:[['ShowSort','ASC']],attributes:['Id','LinkUrl','Desc','ShowSort','FileLinkId']}).then(function(LinkData){
		routeSql.AbpLink.findOne({where:{FileLinkId:req.query.Id,ShowSort:0,IsDeleted:false}}).then(function(BackLinkData){
			res.send({error:0,result:{LinkData:LinkData,BackLinkData:BackLinkData}});
		});
	})
})

// 通过链接文件名称获取链接内容
router.get('/FileLinkUrlList',function(req,res){
	console.log(req.query)
	routeSql.FileLinkName.findOne({where:{LinkName:req.query.LinkName,IsDeleted:false}}).then(function(data){
		console.log(data)
		if (data) {
			routeSql.AbpLink.findAll({where:{FileLinkId:data.dataValues.Id,IsDeleted:false,ShowSort:{$ne:0}},order:[['ShowSort','ASC']],attributes:['Id','LinkUrl','Desc','ShowSort','FileLinkId']}).then(function(LinkData){
				routeSql.AbpLink.findOne({where:{FileLinkId:data.dataValues.Id,ShowSort:0,IsDeleted:false}}).then(function(BackLinkData){
					res.send({error:0,result:{LinkData:LinkData,BackLinkData:BackLinkData}});
				});
			})
		} else {
			res.send({error:1,result:{msg:'文件链接不存在'}})
		}
	})
>>>>>>> develop
})

router.post('/CreateNewUrl',function(req,res){
	routeSql.AbpLink.max('ShowSort',{where:{FileLinkId:req.body.FileLinkId}}).then(function(MaxShowSort){
		var NewShowSort = MaxShowSort?(MaxShowSort+1):1
		if (req.body.LinkUrl == ''||req.body.Desc == '') {
			res.send({error:1,result:{msg:'链接及公众号名称不能为空'}})
		} else {
			routeSql.AbpLink.create({FileLinkId:req.body.FileLinkId,LinkUrl:req.body.LinkUrl,Desc:req.body.Desc,ShowSort:NewShowSort}).then(function(){
				res.send({error:0,result:{msg:'创建成功'}})
			})
		}
	})
})

router.get('/DeleteLinkUrl',function(req,res){
	routeSql.AbpLink.findOne({where:{Id:req.query.Id,IsDeleted:false}}).then(function(LinkData){
		if (LinkData) {
			routeSql.AbpLink.update({IsDeleted:true},{where:{Id:req.query.Id}}).then(function(){
				res.send({error:0,result:{msg:'链接删除成功'}})
			})
		} else {
			res.send({error:1,result:{msg:'链接不存在'}})
		}
	})
})

router.get('/GetLinkUrl',function(req,res){
	routeSql.AbpLink.findOne({where:{Id:req.query.Id,IsDeleted:false}}).then(function(LinkData){
		if (LinkData) {
			res.send({error:0,result:LinkData.dataValues})
		} else {
			res.send({error:1,result:{msg:'该链接不存在'}})
		}
	})
})

router.post('/UpdateLinkUrl',function(req,res){
	routeSql.AbpLink.update({LinkUrl:req.body.LinkUrl,Desc:req.body.Desc},{where:{Id:req.body.Id}}).then(function(){
		res.send({error:0,result:{msg:'修改成功'}});
	})
})

router.get('/UpLinkUrl',function(req,res){
	routeSql.AbpLink.findOne({where:{Id:req.query.Id,IsDeleted:false}}).then(function(LinkData){
		if (LinkData) {
			var ShowSort = parseInt(LinkData.dataValues.ShowSort)
			if (ShowSort>1) {
				routeSql.AbpLink.update({ShowSort:ShowSort},{where:{ShowSort:ShowSort-1,FileLinkId:LinkData.dataValues.FileLinkId,IsDeleted:false}}).then(function(){
					routeSql.AbpLink.update({ShowSort:ShowSort-1},{where:{Id:req.query.Id,IsDeleted:false}}).then(function(){
						res.send({error:0,result:{msg:'上移成功'}});
					})
				})
			} else {
				res.send({error:2,result:{msg:'已经是第一个，不能再上移了'}})
			}
		} else {
			res.send({error:1,result:{msg:'链接不存在'}})
		}
	})
})

router.get('/DownLinkUrl',function(req,res){
	routeSql.AbpLink.findOne({where:{Id:req.query.Id,IsDeleted:false}}).then(function(LinkData){
		if (LinkData) {
			routeSql.AbpLink.max('ShowSort',{where:{FileLinkId:LinkData.dataValues.FileLinkId}}).then(function(MaxShowSort){
				var ShowSort = parseInt(LinkData.dataValues.ShowSort)
				if (MaxShowSort && ShowSort < MaxShowSort) {
					routeSql.AbpLink.update({ShowSort:ShowSort},{where:{ShowSort:ShowSort+1,FileLinkId:LinkData.dataValues.FileLinkId,IsDeleted:false}}).then(function(){
						routeSql.AbpLink.update({ShowSort:ShowSort+1},{where:{Id:req.query.Id,IsDeleted:false}}).then(function(){
							res.send({error:0,result:{msg:'下移成功'}});
						})
					})
				} else {
					res.send({error:2,result:{msg:'已经是最后一个，不能再下移了'}})
				}
			})
		} else {
			res.send({error:1,result:{msg:'链接不存在'}})
		}
	})
})



module.exports = router;


