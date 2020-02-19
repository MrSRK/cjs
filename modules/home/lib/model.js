const mongoose=require('mongoose')
const modelName=__dirname.split("\\").reverse()[1]
const schema=new mongoose.Schema({
	active:{type:Boolean,default:true},
	name:{type:String},
},
{
	timestamps:true,
	versionKey:false
})
const model=mongoose.model(modelName,schema)
module.exports.model=model
module.exports.schema=schema