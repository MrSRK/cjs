const mongoose=require('mongoose')
require('mongoose-schema-jsonschema')(mongoose)
const deploy=next=>
{
	try
	{
		mongoose.connect(process.env.MONGODB_URI,{
			useUnifiedTopology:true,
			useFindAndModify:false,
			useCreateIndex:true,
			useNewUrlParser:true
		})
		return next(true,null,mongoose)
	}
	catch(error)
	{
		return next(false,error)
	}

}
module.exports.deploy=deploy