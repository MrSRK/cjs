const mongoose=require('mongoose')
const modelName=__dirname.split("\\").reverse()[1]
const image=mongoose.Schema({
	fieldname:{type:String,required:true},
	originalname:{type:String},
	encoding:{type:String},
	mimetype:{type:String},
	destination:{type:String},
	filename:{type:String},
	path:{type:String},
    size:{type:Number},
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
	title:{type:String},
	description:{type:String},
	text:{type:String},
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