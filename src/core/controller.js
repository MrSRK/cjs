"use strict"
const bcrypt=require('bcrypt-nodejs')
const jwt=require("jsonwebtoken")
const jwtDecode=require("jwt-decode")
const ObjectId=require('mongoose').Types.ObjectId;
const storage=require('./storage')
const webp=require('webp-converter')
const sharp=require('sharp')
const fs=require('fs')
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
		'json_schema',
		'json_find',
		'json_findById',
		'json_authentication',
		'json_auth_find',
		'json_auth_findById',
		'json_auth_save',
		'json_auth_findByIdAndUpdate',
		'json_auth_findByIdAndDelete',
		'json_auth_save_image',
		'json_auth_remove_image'
	]
}
const pug={}
defaultRoutes.pug.forEach(f=>
{
	try
	{
		pug[f]=(toolbox,Model,schema,name,req,res)=>
		{
			const _id=req.params._id||null
			return res.status(200).render(f.replace('pug_',''),
			{
				title:name.substr(0,1).toUpperCase()+name.substr(1)+' '+f.replace('pug_','').substr(0,1).toUpperCase()+f.replace('pug_','').substr(1)+' Page',
				name:name,
				schema:schema,
				_id:_id
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
api.json_schema=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		return res.status(200).json({status:true,schema:Model.schema})
	}
	catch(error)
	{
		return res.status(500).json({status:false,error:error})
	}
}
api.json_find=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		let where={}
		let order=''
		if(req.body&&req.body.where)
			where=req.body.where
		if(req.body&&req.body.order)
			order=req.body.order
		//console.log(name+' order: '+order)
		// Get only active records
		where.active=true
		return Model
		.find()
		.where(where)
		.select('-password -username -email')
		.sort(order)
		.exec()
		.then(doc=>
		{
			return res.status(200).json({status:true,doc:doc})
		}).catch(error=>
		{
			console.log(error)
			return res.status(500).json({status:false,error:error})
		})
	}
	catch(error)
	{
		console.log(error)
		return res.status(500).json({status:false,error:error})
	}
}
api.json_findById=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		if(!ObjectId.isValid(req.params._id))
			return res.status(500).json({status:false,error:{name:"Error",message:'Invalid Object id'}})
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
			return res.status(200).json({status:true,doc:doc,schema:Model.schema})
		})
		.catch(error=>
		{
			return res.status(500).json({status:false,error:error})
		})
	}
	catch(error)
	{
		return res.status(500).json({status:false,error:error})
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
			/*
				let d=[]
				for(var i=1;i<=1000;i++)
				{
					d.push({
						active:true,
						name:'Ρουμπεδάκης Στυλιανός '+i,
						email:'web-'+i+'@visionadv.gr',
						password:'123'
					})
				}
				Model.insertMany(d,(ee,dd)=>
				{
					if(ee)
						console.log(ee)
					console.log(dd)
				})
			*/
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
					return res.status(500).json({status:false,error:error})
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
		let populate=[]
		let keys=Object.keys(schema.obj)
		keys.forEach(v=>
		{
			if(v=='parent'||v.indexOf('parent_')>=0)
				populate.push(v)
		})
		return Model
		.find(where)
		.select('-password')
		.populate(populate)
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
		return res.status(500).json({status:false,error:error})
	}
}
api.json_auth_findById=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		if(!ObjectId.isValid(req.params._id))
			return res.status(500).json({status:false,error:{name:"Error",message:'Invalid Object id'}})
		let where={}
		if(req.body&&req.body.where)
			where=req.body.where
		let populate=[]
		let keys=Object.keys(schema.obj)
		keys.forEach(v=>
		{
			if(v=='parent'||v.indexOf('parent_')>=0)
				populate.push(v)
		})
		return Model
		.findById(req.params._id)
		.populate(populate)
		.select('-password')
		.where(where)
		.exec()
		.then(doc=>
		{
			return res.status(200).json({status:true,doc:doc,schema:Model.schema})
		})
		.catch(error=>
		{
			return res.status(500).json({status:false,error:error})
		})
	}
	catch(error)
	{
		return res.status(500).json({status:false,error:error})
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
				return res.status(500).json({status:false,error:error})
			var data=data.toObject()
			if(data.password)
				delete data.password
			return res.status(200).json({status:true,doc:data})
		})
	}
	catch(error)
	{
		return res.status(500).json({status:false,error:error})
	}
}
api.json_auth_remove_image=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		const _id=req.params._id
		const image_id=req.params.image_id
		return Model.findById(_id,(error,doc)=>
		{
			if(error)
				throw error
			if(!doc)
				throw new Error('Record not exist')
			if(doc.images)
				doc.images.forEach((img,index)=>
				{
					if(img._id==image_id)
					{
						let toDelete=doc.images[index]
						doc.images.splice(index,1)[0]
						fs.unlink(toDelete.path,error=>
						{
							if(error)
								console.log(error)
						})
						const keys=['jpg','png','webp']
						keys.forEach(key=>
						{
							fs.unlink(toDelete.thumbnail[key].path,error=>
							{
								if(error)
									console.log(error)
							})
						})
						setTimeout(_=>
						{
							const dir=toDelete.path.split('.').reverse().splice(1).reverse().join('.')
							fs.rmdir(dir,error=>
							{
								if(error)
									console.log(error)
							})
						},5000)
						return Model.findByIdAndUpdate(_id,doc,{new:true},(error,d)=>
						{
							if(error)
								throw error
							return res.status(200).json({status:true,doc:d})
						})
					}
				})
			return new Error('Image not Found')
		})
	}
	catch(error)
	{
		console.log(error)
		return res.status(500).json({status:false,error:error})
	}
}
api.json_auth_save_image=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		const _id=req.params._id
		return  storage.create('/images/'+name+'/'+_id+'/','image',(error,upload)=>
		{
			if(error)
				throw error
			return upload(req,res,error=>
			{
				return Model.findById(_id,'-password',(error,data)=>
				{
					if(error)
						throw error
					var data=data.toObject()
					if(!data.images)
						data.images=[]
					if(!req.files||!req.files.image)
						return status('501').json({name:'Error',message:'Image not Found'})
					return sharpImages(req.files.image,(error,images)=>
					{
						if(error)
							throw error
						data.images[data.images.length]=
						{
							originalname:req.files.image.originalname,
							destination:req.files.image.destination,
							filename:req.files.image.filename,
							path:req.files.image.path,
							thumbnail:
							{
								jpg:
								{
									name:images.jpg.name,
									path:images.jpg.path
								},
								png:
								{
									name:images.png.name,
									path:images.png.path
								},
								webp:
								{
									name:images.webp.name,
									path:images.webp.path
								}
							}
						}
						const options=
						{
							new:true,
							select:'-password'
						}
						return Model.findByIdAndUpdate(_id,data,options,(error,d)=>
						{
							if(error)
								throw error
							return setTimeout(_=>
							{
								return res.status(200).json({status:true,doc:d})
							},2000)
						})
					})
				})
			})
		})
	}
	catch(error)
	{
		console.log(error)
		return res.status(500).json({status:false,error:error})
	}
}
api.json_auth_findByIdAndUpdate=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		if(!ObjectId.isValid(req.params._id))
			return res.status(500).json({status:false,error:{name:"Error",message:'Invalid Object id'}})
		let where={}
		if(req.body&&req.body.where)
			where=req.body.where
		let data={}
		if(req.body&&req.body.data)
			data=req.body.data
		if(data.password)
		{
			const salt=bcrypt.genSaltSync(10)
			data.password=bcrypt.hashSync(data.password,salt)
		}
		const options=
		{
			new:true,
			select:'-password'
		}
		Model
		.findByIdAndUpdate(req.params._id,data,options)
		.populate('parent')
		.where(where)
		.exec()
		.then(doc=>
		{
			return res.status(200).json({status:true,doc:doc})
		})
		.catch(error=>
		{
			return res.status(500).json({status:false,error:error})
		})
	}
	catch(error)
	{
		console.log(error)
		return res.status(500).json({status:false,error:error})
	}
}
api.json_auth_findByIdAndDelete=(toolbox,Model,schema,name,req,res)=>
{
	try
	{
		if(!ObjectId.isValid(req.params._id))
			return res.status(500).json({status:false,error:{name:"Error",message:'Invalid Object id'}})
		let where={}
		if(req.body&&req.body.where)
			where=req.body.where
		Model
		.findByIdAndDelete(req.params._id)
		.where(where)
		.exec()
		.then(doc=>
		{
			//delete images
			if(doc.images)
			{
				let dir=''
				doc.images.forEach(image=>
				{
					fs.unlink(image.path,error=>
					{
						if(error)
							console.log(error)
					})
					const keys=['jpg','png','webp']
					if(image.thumbnail)
					{
						keys.forEach(key=>
						{
							fs.unlink(image.thumbnail[key].path,error=>
							{
								if(error)
									console.log(error)
							})
						})
					}
					dir=image.path.split('.').reverse().splice(1).reverse().join('.')
					setTimeout(_=>
					{
						fs.rmdir(dir,error=>
						{
							if(error)
								console.log(error)
						})
					},5000)
				})
				const d=dir.split("\\").reverse().splice(1).reverse().join("\\")
				setTimeout(_=>
				{
					fs.rmdir(d,error=>
					{
						if(error)
							console.log(error)
					})
				},7000)
			}
			return res.status(200).json({status:true,doc:doc})
		})
		.catch(error=>
		{
			console.log(error)
			return res.status(500).json({status:false,error:error})
		})
	}
	catch(error)
	{
		console.log(error)
		return res.status(500).json({status:false,error:error})
	}
}
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
		return res.status(401).json({status:false,auth:false,error:error})
	}
}

const sharpImages=(image,next)=>
{
	try
	{
		const original=image.path
		const path=image.path.split('.').reverse().splice(1).reverse().join('.')
		const name=image.filename.split('.').reverse().splice(1).reverse().join('')
		const width=parseInt(process.env.IMAGE_MAX_WIDTH)||800
		const heigth=parseInt(process.env.IMAGE_MAX_HEIGHT)||800
		const args={fit:'inside'}
		if(!fs.existsSync(path))
			fs.mkdirSync(path,{recursive:true})
		const outputImages={
			jpg:{
				path:path+'/'+name+'.jpg',
				name:name,
				flaten:{background:{r:255,g:255,b:255,alpha:1}},
				width:width,
				heigth:heigth,
				args:args
			},
			png:{
				path:path+'/'+name+'.png',
				name:name,
				flaten:false,
				width:width,
				heigth:heigth,
				args:args
			},
			webp:{
				path:path+'/'+name+'.webp',
				name:name,
				flaten:false,
				width:width,
				heigth:heigth,
				args:args
			}
		}
		//Resize Base Image
		const keys=Object.keys(outputImages)
		keys.forEach(key=>
		{
			var im=outputImages[key]
			sharp(original)
			.flatten(im.flaten)
			.resize(im.width,im.heigth,im.args)
			.toFile(im.path,(error,info)=>
			{
				if(error)
					console.log(error)
			})
		})
		return next(null,outputImages)
	}
	catch(error)
	{
		next(error,[])
	}
}
module.exports.pug=pug
module.exports.api=api