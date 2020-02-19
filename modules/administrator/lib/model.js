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
	name:{type:String},
	email:{type:String,required:true},
	password:{type:String,required:true},
	images:[image]
},
{
	timestamps:true,
	versionKey:false
})
const model=mongoose.model(modelName,schema)
module.exports.model=model
module.exports.schema=schema