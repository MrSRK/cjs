const mongoose=require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const modelName=__dirname.split("\\").reverse()[1]||__dirname.split("/").reverse()[1]

const image=mongoose.Schema({
	originalname:{type:String},
	destination:{type:String},
	filename:{type:String},
	path:{type:String},
    thumbnail:
    {
        jpg:
        {
            name:{type:String},
            path:{type:String},
        },
        png:
        {
            name:{type:String},
            path:{type:String},
        },
        webp:
        {
            name:{type:String},
            path:{type:String},
        }
    }
})
const schema=new mongoose.Schema({
	active:{type:Boolean,default:true},
	order:{type:Number},
	name:{type:String},
	email:{type:String,required:true},
	password:{type:String,required:true},
	images:[image]
},
{
	timestamps:true,
	versionKey:false
})
schema.pre('save',function save(next)
{
	const user=this
	if(!user.isModified('password'))
		return next()
	return bcrypt.genSalt(10,(error,salt)=>
	{
		if(error)
			return next(error)
		return bcrypt.hash(user.password,salt,null,(error,hash)=>
		{
			if(error)
				return next(error)
			user.password=hash
			return next()
		})
	})
})
const model=mongoose.model(modelName,schema)
module.exports.model=model
module.exports.schema=schema