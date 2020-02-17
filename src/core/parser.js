const bodyParser=require('body-parser')
const deploy=(parse,next)=>
{
	try
	{
		if(parse=='json')
			return next(true,null,bodyParser.json())
		if(parse=='url')
			return next(true,null,bodyParser.urlencoded({extended:true}))
		return next(false)
	}
	catch(error)
	{
		next(false,error)
	}
}
module.exports.deploy=deploy