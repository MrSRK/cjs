"use strict"
const bcrypt=require('bcrypt-nodejs')
const jwt=require("jsonwebtoken")
const jwtDecode=require("jwt-decode")
const ObjectId=require('mongoose').Types.ObjectId;
const defaultRoutes={
	pug:
	[
		'pug_list',
		'pug_show',
		'pug_signIn',
		'pug_sighUp',
		'pug_signOut',
		'pug_table',
		'pug_edit',
		'pug_new',
	],
	api:
	[
		'json_find',
		'json_findById',
		'json_authentication',
		'json_auth_find',
		'json_auth_findById',
		'json_auth_save',
		'json_auth_findByIdAndUpdate',
		'json_auth_findByIdAndDelete'
	]
}
const pug={}
defaultRoutes.pug.forEach(f=>
{
	try
	{
		pug[f]=(toolbox,Model,schema,name,req,res)=>
		{
			return res.status(200).render(f.replace('pug_',''),
			{
				title:name.substr(0,1).toUpperCase()+name.substr(1)+' '+f.substr(0,1).toUpperCase()+f.substr(1)+' Page',
				name:name,
				schema:schema,
			})
		}
	}
	catch(error)
	{
		return res.status(500).render('pug_500',
		{
			title:'Error 500 Page',
			error:error,
		})
	}
})
const api={}
api.json_find=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		let where={}
		if(req.body&&req.body.where)
			where=req.body.where
		// Get only active records
		where.active=true
		return Model
		.find()
		.where(where)
		.select('-password -username -email')
		.exec()
		.then(doc=>
		{
			return res.status(200).json({status:true,doc:doc})
		}).catch(error=>
		{
			return res.status(500).json({status:true,error:error})
		})
	}
	catch(error)
	{
		return res.status(500).json({status:true,error:error})
	}
}
api.json_findById=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		if(!ObjectId.isValid(req.params._id))
			return res.status(500).json({status:true,error:{name:"Error",message:'Invalid Object id'}})
		let where={}
		if(req.body&&req.body.where)
			where=req.body.where
		// Get only active records
		where.active=true
		return Model
		.findById(req.params._id)
		.where(where)
		.select('-password -username -email')
		.exec()
		.then(doc=>
		{
			return res.status(200).json({status:true,doc:doc})
		})
		.catch(error=>
		{
			return res.status(500).json({status:true,error:error})
		})
	}
	catch(error)
	{
		return res.status(500).json({status:true,error:error})
	}
}
api.json_authentication=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		let body={}
		if(req.body)
			body=req.body
		if(body.signIn)
		{
			/*let model=new Model({
				active:true,
				name:'Ρουμπεδάκης Στυλιανός',
				email:'rubes6@hotmail.com',
				password:'123'
			})
			model.save()*/
			if(!req.body.data||!req.body.data.email)
				return res.status(401).json({status:false,error:{name:"Error",message:"Email or Password not set"}})
			if(!req.body.data||!req.body.data.password)
				return res.status(401).json({status:false,error:{name:"Error",message:"Email or Password not set"}})
			const email=req.body.data.email
			const password=req.body.data.password
			return Model.findOne({email:email,active:true},(error,data)=>
			{
				if(error)
					return res.status(500).json({status:false,error:error})
				if(!data)
					return res.status(401).json({status:false,error:{name:"Error",message:"Incorrect Email or Password or account is deactive"}})
				return bcrypt.compare(password,data.password,(error,match)=>
				{
					if(error)
						return res.status(500).json({status:false,error:error})
					if(!match)
						return res.status(401).json({status:false,error:{name:"Error",message:"Incorrect Email or Password or account is deactive"}})
					const privateKey=(process.env.JWT_KEY||'10')+name
					const expires=process.env.JWT_USER_TOKEN_EXPIRES||"1h"
					const token=jwt.sign(
					{
						userId:data._id,
						name:name,
						userName:encodeURIComponent(data.name)
					},
					privateKey,
					{
						expiresIn:expires
					})
					let r=data.toObject()
					delete r.password
					return res.status(200).json({status:true,doc:r,token:token})
				})
			})
		}
		else if(body.signUp)
		{
			if(!req.body.data||!req.body.data.email)
				return res.status(401).json({status:false,error:{name:"Error",message:"Email not set"}})
			if(!req.body.data||!req.body.data.password)
				return res.status(401).json({status:false,error:{name:"Error",message:"Password not set"}})
			const email=req.body.data.email
			const password=req.body.data.password
			const doc={
				active:false,
				email:email,
				password:password,
			}
			model=new Model(doc)
			return model.save((error,data)=>
			{
				if(error)
					return res.status(500).json({status:true,error:error})
				var data=data.toObject()
				if(data.password)
					delete data.password
				return res.status(200).json({status:true,doc:data})
			})
		}
		else
			return res.status(401).json({status:true,error:{name:'Error',message:'Unauthorized'}})
	}
	catch(error)
	{
		console.log(error)
		return res.status(500).json({status:false,error:error})
	}
}
api.json_auth_find=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		let where={}
		if(req.body&&req.body.where)
			where=req.body.where
		return Model
		.find(where)
		.select('-password')
		.exec()
		.then(doc=>
		{
			return res.status(200).json({status:true,doc:doc})
		}).catch(error=>
		{
			throw error
		})
	}
	catch(error)
	{
		return res.status(500).json({status:true,error:error})
	}
}
api.json_auth_findById=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		if(!ObjectId.isValid(req.params._id))
			return res.status(500).json({status:true,error:{name:"Error",message:'Invalid Object id'}})
		let where={}
		if(req.body&&req.body.where)
			where=req.body.where
		return Model
		.findById(req.params._id)
		.select('-password')
		.where(where)
		.exec()
		.then(doc=>
		{
			return res.status(200).json({status:true,doc:doc})
		})
		.catch(error=>
		{
			return res.status(500).json({status:true,error:error})
		})
	}
	catch(error)
	{
		return res.status(500).json({status:true,error:error})
	}
}
api.json_auth_save=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		let data=req.body.data||{}
		if(data._id)
			delete data._id
		let model=new Model(data)
		return model.save((error,data)=>
		{
			if(error)
				return res.status(500).json({status:true,error:error})
			var data=data.toObject()
			if(data.password)
				delete data.password
			return res.status(200).json({status:true,doc:data})
		})
	}
	catch(error)
	{
		return res.status(500).json({status:true,error:error})
	}
}
api.json_auth_findByIdAndUpdate=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		if(!ObjectId.isValid(req.params._id))
			return res.status(500).json({status:true,error:{name:"Error",message:'Invalid Object id'}})
		let where={}
		if(req.body&&req.body.where)
			where=req.body.where
		let data={}
		if(req.body&&req.body.data)
			data=req.body.data
		const options=
		{
			new:true,
			select:'-password'
		}
		Model
		.findByIdAndUpdate(req.params._id,data,options)
		.where(where)
		.exec()
		.then(doc=>
		{
			return res.status(200).json({status:true,doc:doc})
		})
		.catch(error=>
		{
			return res.status(500).json({status:true,error:error})
		})
	}
	catch(error)
	{
		return res.status(500).json({status:true,error:error})
	}
}
api.json_auth_findByIdAndDelete=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		if(!ObjectId.isValid(req.params._id))
			return res.status(500).json({status:true,error:{name:"Error",message:'Invalid Object id'}})
		let where={}
		if(req.body&&req.body.where)
			where=req.body.where
		Model
		.findByIdAndDelete(req.params._id)
		.where(where)
		.exec()
		.then(doc=>
		{
			return res.status(200).json({status:true,doc:doc})
		})
		.catch(error=>
		{
			return res.status(500).json({status:true,error:error})
		})
	}
	catch(error)
	{
		return res.status(500).json({status:true,error:error})
	}
}
//Authorization
/*
* 	Two tokens one User (long life) Token and one request (sort life) token
*	User token by login (email, password)
*	Request token by user token
 */
api.json_auth_request=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		if(!req.body||!req.body.userToken)
				return res.status(401).json({status:false,error:{name:"Error",message:"User token not set"}})
		const privateKey=(process.env.JWT_KEY||'10')+name
		const expires=process.env.JWT_REQUEST_TOKEN_EXPIRES||"1h"
		return jwt.verify(req.body.userToken,privateKey,(error,decoded)=>
		{
			if(error)
				return res.status(401).json({status:false,error:{name:'Error',message:'Unauthorized Access'}})
			const token=jwt.sign(
			{
				userId:decoded.userId,
				name:decoded.name,
				userName:decoded.userName
			},
			privateKey,
			{
				expiresIn:expires
			})
			return res.status(200).json({status:true,token:token})
		})
	}
	catch(error)
	{
		return res.status(401).json({status:false,error:error})
	}
}
module.exports.json_auth_check_middleware=(req,res,next)=>
{
	try
	{
		if(!req.headers.authorization)
			throw {name:'Error',message:'Unauthorized Access (Undefined Authorization Header)'}
		const token=req.headers.authorization.split(" ")[1]
		if(!token)
			throw {name:'Error',message:'Unauthorized Access (Unsupported Header)'}
		const decode=jwtDecode(token)
		if(!decode.name)
			throw {name:'Error',message:'Unauthorized Access (Unsupported Token)'}
		const privateKey=(process.env.JWT_KEY||'10')+decode.name
		return jwt.verify(token,privateKey,(error,d)=>
		{
			if(error)
				throw {name:'Error',message:'Token no longer valid'}
			return next()
		})
	}
	catch(error)
	{
		return res.status(401).json({status:false,error:error})
	}
}
module.exports.pug=pug
module.exports.api=api